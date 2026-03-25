import { ipcMain } from 'electron';
import type { IpcMainInvokeEvent } from 'electron';
import {
  getTasks,
  listKnowledgeNotes,
  generateSuggestions,
  getActiveWorkspaceId,
} from '@anastomotic_ai/agent-core';
import type { RecentTaskSummary } from '@anastomotic_ai/agent-core';

export function registerSuggestionHandlers(): void {
  ipcMain.handle('suggestions:get', async (_event: IpcMainInvokeEvent) => {
    const workspaceId = getActiveWorkspaceId() ?? undefined;
    const tasks = getTasks(workspaceId).slice(0, 10);

    const notes = workspaceId ? listKnowledgeNotes(workspaceId).map((n) => n.content) : [];

    const recentTasks: RecentTaskSummary[] = tasks.map((t) => ({
      prompt: t.prompt,
      status: t.status,
      messages: t.messages,
      completedAt: t.completedAt,
    }));

    return generateSuggestions(recentTasks, notes);
  });
}
