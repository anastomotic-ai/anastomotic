import type { IpcMainInvokeEvent } from 'electron';
import {
  addScheduledTask,
  listScheduledTasks,
  cancelScheduledTask,
} from '@anastomotic_ai/agent-core';
import type { ScheduledTask } from '@anastomotic_ai/agent-core/common';
import { handle } from './utils';

export function registerScheduleHandlers(): void {
  handle(
    'schedule:create',
    async (_event: IpcMainInvokeEvent, cron: string, prompt: string): Promise<ScheduledTask> => {
      return addScheduledTask(cron, prompt);
    },
  );

  handle('schedule:list', async (_event: IpcMainInvokeEvent): Promise<ScheduledTask[]> => {
    return listScheduledTasks();
  });

  handle(
    'schedule:cancel',
    async (_event: IpcMainInvokeEvent, scheduleId: string): Promise<boolean> => {
      return cancelScheduledTask(scheduleId);
    },
  );
}
