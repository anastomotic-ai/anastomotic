/**
 * Deep Memory Service — enhanced auto-learning with semantic memory,
 * behavioral preferences, and cross-workspace knowledge transfer.
 */

import type { TaskMessage } from '../common/types/task.js';
import type { MemoryCategory, MemoryScope, PreferenceKey } from '../common/types/memory.js';
import type { GetApiKeyFn } from './auto-learner.js';
import type { ApiKeyProvider } from '../common/types/provider.js';
import {
  createMemoryEntry,
  searchMemory,
  getMemoryForPrompt,
} from '../storage/repositories/memoryStore.js';
import { upsertPreference, getPreferencesForPrompt } from '../storage/repositories/preferences.js';
import { createConsoleLogger } from '../utils/logging.js';

const log = createConsoleLogger({ prefix: 'DeepMemory' });

const MEMORY_EXTRACT_PROMPT = `You are a deep memory extraction assistant. Given a completed task conversation, extract structured knowledge.

Output JSON with these fields (output ONLY valid JSON, nothing else):
{
  "memories": [
    {"category": "task_context|preference|pattern|fact|workflow", "content": "...max 500 chars...", "scope": "workspace|global"}
  ],
  "preferences": [
    {"key": "naming_convention|folder_structure|writing_style|code_style|tool_preference|communication_tone|custom", "label": "short label", "value": "observed preference"}
  ]
}

Rules:
- Extract 1-3 memories and 0-2 preferences per conversation
- "global" scope = applies to all projects, "workspace" = project-specific
- Focus on reusable knowledge: patterns, conventions, preferences
- If nothing useful to extract, output: {"memories":[],"preferences":[]}

Task prompt: {PROMPT}

Conversation (last messages):
{MESSAGES}`;

const MAX_MESSAGES = 12;
const MAX_MSG_CHARS = 400;

function buildMessages(messages: TaskMessage[]): string {
  return messages
    .filter((m) => m.type === 'assistant' || m.type === 'user')
    .slice(-MAX_MESSAGES)
    .map((m) => {
      const prefix = m.type === 'user' ? 'User' : 'Assistant';
      const content =
        m.content.length > MAX_MSG_CHARS ? m.content.slice(0, MAX_MSG_CHARS) + '...' : m.content;
      return `${prefix}: ${content}`;
    })
    .join('\n');
}

export async function extractDeepMemory(
  prompt: string,
  messages: TaskMessage[],
  workspaceId: string,
  getApiKey: GetApiKeyFn,
): Promise<{ memoriesCreated: number; preferencesUpdated: number }> {
  if (messages.length < 3) {
    return { memoriesCreated: 0, preferencesUpdated: 0 };
  }

  const messagesText = buildMessages(messages);
  if (!messagesText.trim()) {
    return { memoriesCreated: 0, preferencesUpdated: 0 };
  }

  const fullPrompt = MEMORY_EXTRACT_PROMPT.replace('{PROMPT}', prompt.slice(0, 300)).replace(
    '{MESSAGES}',
    messagesText,
  );

  const providers: ApiKeyProvider[] = ['anthropic', 'openai', 'google', 'xai'];

  for (const provider of providers) {
    const apiKey = getApiKey(provider);
    if (!apiKey) {
      continue;
    }

    try {
      const result = await callProviderForMemory(provider, apiKey, fullPrompt);
      if (!result) {
        continue;
      }

      let memoriesCreated = 0;
      let preferencesUpdated = 0;

      for (const mem of result.memories || []) {
        if (mem.content && mem.content.length > 10) {
          const isDuplicate = checkDuplicate(mem.content, workspaceId);
          if (!isDuplicate) {
            createMemoryEntry({
              workspaceId: mem.scope === 'global' ? null : workspaceId,
              scope: (mem.scope as MemoryScope) || 'workspace',
              category: (mem.category as MemoryCategory) || 'fact',
              content: mem.content.slice(0, 2000),
            });
            memoriesCreated++;
          }
        }
      }

      for (const pref of result.preferences || []) {
        if (pref.value && pref.label) {
          upsertPreference({
            workspaceId,
            key: (pref.key as PreferenceKey) || 'custom',
            label: pref.label,
            value: pref.value,
          });
          preferencesUpdated++;
        }
      }

      log.info(
        `Deep memory: ${memoriesCreated} memories, ${preferencesUpdated} preferences from ${provider}`,
      );
      return { memoriesCreated, preferencesUpdated };
    } catch (err) {
      log.warn(`Deep memory extraction failed with ${provider}: ${err}`);
    }
  }

  return { memoriesCreated: 0, preferencesUpdated: 0 };
}

function checkDuplicate(content: string, workspaceId: string): boolean {
  const results = searchMemory(content, workspaceId, 3);
  return results.some((r) => r.matchScore > 10);
}

export function getEnhancedPromptContext(workspaceId: string): string {
  const memoryContext = getMemoryForPrompt(workspaceId);
  const prefContext = getPreferencesForPrompt(workspaceId);
  if (!memoryContext && !prefContext) {
    return '';
  }
  return `\n# Agent Memory & Preferences\n${memoryContext}${prefContext}`;
}

interface MemoryExtraction {
  memories: Array<{ category: string; content: string; scope: string }>;
  preferences: Array<{ key: string; label: string; value: string }>;
}

async function callProviderForMemory(
  provider: ApiKeyProvider,
  apiKey: string,
  prompt: string,
): Promise<MemoryExtraction | null> {
  const { callProvider } = await import('./auto-learner.js');
  const raw = await callProvider(provider, apiKey, prompt);
  if (!raw) {
    return null;
  }

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return null;
    }
    return JSON.parse(jsonMatch[0]) as MemoryExtraction;
  } catch {
    return null;
  }
}
