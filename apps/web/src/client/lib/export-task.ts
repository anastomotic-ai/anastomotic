import type { Task, TaskMessage } from '@anastomotic_ai/agent-core/common';

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  const s = Math.floor(ms / 1000);
  if (s < 60) {
    return `${s}s`;
  }
  const m = Math.floor(s / 60);
  return `${m}m ${s % 60}s`;
}

function buildMarkdown(task: Task): string {
  const lines: string[] = [];
  lines.push(`# ${task.summary || task.prompt}`);
  lines.push('');
  lines.push(`**Status:** ${task.status}`);
  lines.push(`**Created:** ${task.createdAt}`);
  if (task.completedAt) {
    lines.push(`**Completed:** ${task.completedAt}`);
  }
  if (task.result?.durationMs) {
    lines.push(`**Duration:** ${formatDuration(task.result.durationMs)}`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  for (const msg of task.messages) {
    lines.push(`## ${messageLabel(msg)}`);
    lines.push('');
    lines.push(msg.content || '_No content_');
    lines.push('');
  }

  return lines.join('\n');
}

function messageLabel(msg: TaskMessage): string {
  if (msg.type === 'tool' && msg.toolName) {
    return `Tool: ${msg.toolName}`;
  }
  return msg.type.charAt(0).toUpperCase() + msg.type.slice(1);
}

function taskFilename(task: Task, ext: string): string {
  const shortId = task.id.slice(0, 8);
  const date = new Date(task.createdAt).toISOString().slice(0, 10);
  return `task-${shortId}-${date}.${ext}`;
}

export function exportTaskAsMarkdown(task: Task) {
  downloadFile(buildMarkdown(task), taskFilename(task, 'md'), 'text/markdown');
}

export function exportTaskAsJson(task: Task) {
  const data = {
    id: task.id,
    prompt: task.prompt,
    summary: task.summary,
    status: task.status,
    createdAt: task.createdAt,
    completedAt: task.completedAt,
    result: task.result,
    messages: task.messages.map((m) => ({
      id: m.id,
      type: m.type,
      content: m.content,
      toolName: m.toolName,
      timestamp: m.timestamp,
    })),
  };
  downloadFile(JSON.stringify(data, null, 2), taskFilename(task, 'json'), 'application/json');
}
