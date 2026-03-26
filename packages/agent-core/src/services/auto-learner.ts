/**
 * Auto-learning service — extracts reusable insights from completed tasks.
 *
 * After a successful task, this service analyses the conversation messages
 * and generates a concise knowledge note that captures useful context,
 * patterns, or references discovered during the task.
 */

import type { TaskMessage } from '../common/types/task.js';
import type { KnowledgeNoteCreateInput } from '../common/types/workspace.js';
import type { ApiKeyProvider } from '../common/types/provider.js';
import { createConsoleLogger } from '../utils/logging.js';

const log = createConsoleLogger({ prefix: 'AutoLearn' });

export type GetApiKeyFn = (provider: ApiKeyProvider) => string | null;

const EXTRACT_PROMPT = `You are a knowledge extraction assistant. Given a completed task conversation between a user and an AI assistant, extract ONE concise, reusable insight that would help the AI work better on future tasks in this workspace.

Rules:
- Output a single line of text (max 400 characters), nothing else
- Focus on workspace-specific facts: file paths, project conventions, preferred tools, API patterns, architectural decisions, or recurring preferences
- Do NOT extract generic programming knowledge that any AI already knows
- Do NOT extract task-specific details that won't generalize
- If the conversation is too simple or generic to extract a useful insight, output exactly: SKIP

Examples of good insights:
- "This project uses pnpm workspaces with apps/ and packages/ directories, Vitest for testing"
- "User prefers functional components with hooks over class components in React"
- "API endpoints follow REST conventions at /api/v2/ with JWT auth via Authorization header"
- "Database migrations are in packages/core/migrations/ and must be sequential"

Task prompt: {PROMPT}

Conversation (last messages):
{MESSAGES}

Extract one insight:`;

const MAX_MESSAGES_FOR_EXTRACTION = 10;
const MAX_MESSAGE_CHARS = 300;

function buildExtractionMessages(messages: TaskMessage[]): string {
  const relevant = messages
    .filter((m) => m.type === 'assistant' || m.type === 'user')
    .slice(-MAX_MESSAGES_FOR_EXTRACTION);

  return relevant
    .map((m) => {
      const prefix = m.type === 'user' ? 'User' : 'Assistant';
      const content =
        m.content.length > MAX_MESSAGE_CHARS
          ? m.content.slice(0, MAX_MESSAGE_CHARS) + '...'
          : m.content;
      return `${prefix}: ${content}`;
    })
    .join('\n');
}

export async function extractInsight(
  prompt: string,
  messages: TaskMessage[],
  getApiKey: GetApiKeyFn,
): Promise<KnowledgeNoteCreateInput | null> {
  if (messages.length < 3) {
    return null;
  }

  const messagesText = buildExtractionMessages(messages);
  if (!messagesText.trim()) {
    return null;
  }

  const fullPrompt = EXTRACT_PROMPT.replace('{PROMPT}', prompt.slice(0, 200)).replace(
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
      const insight = await callProvider(provider, apiKey, fullPrompt);
      if (insight && insight !== 'SKIP' && insight.length > 10) {
        log.info(`[AutoLearn] Extracted insight using ${provider}`);
        return {
          workspaceId: '', // caller must set this
          type: 'context',
          content: insight.slice(0, 500),
          source: 'auto',
        };
      }
      if (insight === 'SKIP') {
        log.info('[AutoLearn] Conversation too simple for extraction');
        return null;
      }
    } catch (error) {
      log.warn(`[AutoLearn] ${provider} failed: ${String(error)}`);
    }
  }

  log.info('[AutoLearn] No provider available for extraction');
  return null;
}

export async function callProvider(
  provider: ApiKeyProvider,
  apiKey: string,
  prompt: string,
): Promise<string | null> {
  switch (provider) {
    case 'anthropic':
      return callAnthropic(apiKey, prompt);
    case 'openai':
      return callOpenAI(apiKey, prompt);
    default:
      return null;
  }
}

async function callAnthropic(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-20250414',
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const data = (await response.json()) as {
    content: Array<{ type: string; text: string }>;
  };
  return data.content[0]?.text?.trim() || '';
}

async function callOpenAI(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  return data.choices[0]?.message?.content?.trim() || '';
}
