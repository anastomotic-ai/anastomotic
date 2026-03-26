import type { IpcMainInvokeEvent } from 'electron';
import {
  createMemoryEntry,
  listMemoryEntries,
  searchMemory,
  deleteMemoryEntry,
  clearMemoryEntries,
  getMemoryStats,
  listPreferences,
  upsertPreference,
  deletePreference,
  type MemoryCreateInput,
  type MemoryScope,
  type MemoryCategory,
  type PreferenceCreateInput,
} from '@anastomotic_ai/agent-core';
import { handle } from './utils';

export function registerMemoryHandlers(): void {
  handle('memory:create', async (_event: IpcMainInvokeEvent, input: MemoryCreateInput) => {
    return createMemoryEntry(input);
  });

  handle(
    'memory:list',
    async (
      _event: IpcMainInvokeEvent,
      workspaceId?: string,
      scope?: MemoryScope,
      category?: MemoryCategory,
    ) => {
      return listMemoryEntries(workspaceId, scope, category);
    },
  );

  handle(
    'memory:search',
    async (_event: IpcMainInvokeEvent, query: string, workspaceId?: string) => {
      return searchMemory(query, workspaceId);
    },
  );

  handle('memory:delete', async (_event: IpcMainInvokeEvent, id: string) => {
    return deleteMemoryEntry(id);
  });

  handle('memory:clear', async (_event: IpcMainInvokeEvent, workspaceId?: string) => {
    clearMemoryEntries(workspaceId);
  });

  handle('memory:stats', async (_event: IpcMainInvokeEvent, workspaceId?: string) => {
    return getMemoryStats(workspaceId);
  });

  handle('memory:preferences:list', async (_event: IpcMainInvokeEvent, workspaceId?: string) => {
    return listPreferences(workspaceId);
  });

  handle(
    'memory:preferences:upsert',
    async (_event: IpcMainInvokeEvent, input: PreferenceCreateInput) => {
      return upsertPreference(input);
    },
  );

  handle('memory:preferences:delete', async (_event: IpcMainInvokeEvent, id: string) => {
    return deletePreference(id);
  });
}
