import type { IpcMainInvokeEvent } from 'electron';
import {
  addLocalModel,
  listLocalModels,
  updateLocalModelEnabled,
  deleteLocalModel,
  enqueueOfflineTask,
  listOfflineQueue,
  updateQueueItemStatus,
  clearCompletedQueue,
  type LocalModelCreateInput,
  type OfflineQueueInput,
} from '@anastomotic_ai/agent-core';
import { handle } from './utils';

export function registerOfflineHandlers(): void {
  handle('offline:model:add', async (_event: IpcMainInvokeEvent, input: LocalModelCreateInput) => {
    return addLocalModel(input);
  });

  handle('offline:model:list', async () => {
    return listLocalModels();
  });

  handle(
    'offline:model:toggle',
    async (_event: IpcMainInvokeEvent, id: string, enabled: boolean) => {
      updateLocalModelEnabled(id, enabled);
    },
  );

  handle('offline:model:delete', async (_event: IpcMainInvokeEvent, id: string) => {
    return deleteLocalModel(id);
  });

  handle('offline:queue:add', async (_event: IpcMainInvokeEvent, input: OfflineQueueInput) => {
    return enqueueOfflineTask(input);
  });

  handle('offline:queue:list', async (_event: IpcMainInvokeEvent, status?: string) => {
    return listOfflineQueue(status);
  });

  handle(
    'offline:queue:update',
    async (_event: IpcMainInvokeEvent, id: string, status: string, errorMessage?: string) => {
      updateQueueItemStatus(id, status, errorMessage);
    },
  );

  handle('offline:queue:clear', async () => {
    clearCompletedQueue();
  });
}
