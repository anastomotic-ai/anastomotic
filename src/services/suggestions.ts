/**
 * Smart Task Suggestions — generates contextual next-task suggestions
 * based on recent task history, knowledge notes, and workspace context.
 */

import type { TaskMessage } from '../common/types/task.js';

export interface TaskSuggestion {
  id: string;
  title: string;
  prompt: string;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface RecentTaskSummary {
  prompt: string;
  status: string;
  messages: TaskMessage[];
  completedAt?: string;
}

const MAX_SUGGESTIONS = 5;

/**
 * Build contextual suggestions from recent tasks and knowledge notes.
 * Uses heuristic pattern matching — no LLM required.
 */
export function generateSuggestions(
  recentTasks: RecentTaskSummary[],
  knowledgeNotes: string[],
): TaskSuggestion[] {
  const suggestions: TaskSuggestion[] = [];
  const seen = new Set<string>();

  // Pattern 1: Follow-up on recent code changes
  for (const task of recentTasks.slice(0, 5)) {
    if (task.status !== 'completed') {
      continue;
    }

    const hasCodeChanges = task.messages.some(
      (m) =>
        m.type === 'assistant' &&
        (m.content.includes('Created file') ||
          m.content.includes('Modified') ||
          m.content.includes('wrote') ||
          m.content.includes('updated')),
    );

    if (hasCodeChanges) {
      const shortPrompt = task.prompt.slice(0, 60);
      const key = `test-${shortPrompt}`;
      if (!seen.has(key)) {
        seen.add(key);
        suggestions.push({
          id: `sug_${Date.now()}_${suggestions.length}`,
          title: 'Write tests for recent changes',
          prompt: `Write comprehensive tests for the changes made in: "${shortPrompt}"`,
          reason: 'Recent task modified code that may need test coverage',
          confidence: 'high',
        });
      }
    }

    const hasGitActivity = task.messages.some(
      (m) => m.type === 'assistant' && (m.content.includes('commit') || m.content.includes('git')),
    );

    if (hasGitActivity && !seen.has('git-review')) {
      seen.add('git-review');
      suggestions.push({
        id: `sug_${Date.now()}_${suggestions.length}`,
        title: 'Review uncommitted changes',
        prompt: 'Review all uncommitted changes, check for issues, and suggest improvements',
        reason: 'Recent tasks involved git operations',
        confidence: 'medium',
      });
    }
  }

  // Pattern 2: Failed task retry
  for (const task of recentTasks.slice(0, 3)) {
    if (task.status === 'failed' || task.status === 'error') {
      const key = `retry-${task.prompt.slice(0, 40)}`;
      if (!seen.has(key)) {
        seen.add(key);
        suggestions.push({
          id: `sug_${Date.now()}_${suggestions.length}`,
          title: 'Retry failed task with more context',
          prompt: `${task.prompt}\n\n(This task failed previously — please try a different approach)`,
          reason: 'A recent task failed and may succeed with a revised approach',
          confidence: 'medium',
        });
      }
    }
  }

  // Pattern 3: Knowledge-note-driven suggestions
  for (const note of knowledgeNotes) {
    const lower = note.toLowerCase();

    if (lower.includes('test') && !seen.has('kn-test')) {
      seen.add('kn-test');
      suggestions.push({
        id: `sug_${Date.now()}_${suggestions.length}`,
        title: 'Run and fix failing tests',
        prompt: 'Run the test suite, identify any failing tests, and fix them',
        reason: 'Workspace knowledge mentions testing conventions',
        confidence: 'low',
      });
    }

    if (
      (lower.includes('lint') || lower.includes('eslint') || lower.includes('prettier')) &&
      !seen.has('kn-lint')
    ) {
      seen.add('kn-lint');
      suggestions.push({
        id: `sug_${Date.now()}_${suggestions.length}`,
        title: 'Fix lint and formatting issues',
        prompt: 'Run linting and formatting checks, then fix any issues found',
        reason: 'Workspace knowledge mentions linting/formatting tools',
        confidence: 'low',
      });
    }

    if (lower.includes('documentation') || lower.includes('readme')) {
      if (!seen.has('kn-docs')) {
        seen.add('kn-docs');
        suggestions.push({
          id: `sug_${Date.now()}_${suggestions.length}`,
          title: 'Update project documentation',
          prompt: 'Review and update the project documentation to reflect recent changes',
          reason: 'Workspace knowledge mentions documentation',
          confidence: 'low',
        });
      }
    }
  }

  return suggestions.slice(0, MAX_SUGGESTIONS);
}
