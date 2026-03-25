import type { IpcMainInvokeEvent } from 'electron';
import {
  getCostSummary,
  getCostBreakdown,
  getCostRecordsForTask,
} from '@anastomotic_ai/agent-core';
import type { CostSummary, CostBreakdown, CostRecord } from '@anastomotic_ai/agent-core/common';
import { handle } from './utils';

export function registerCostHandlers(): void {
  handle(
    'cost:summary',
    async (_event: IpcMainInvokeEvent, sinceDate?: string): Promise<CostSummary> => {
      return getCostSummary(sinceDate);
    },
  );

  handle(
    'cost:breakdown',
    async (_event: IpcMainInvokeEvent, sinceDate?: string): Promise<CostBreakdown[]> => {
      return getCostBreakdown(sinceDate);
    },
  );

  handle(
    'cost:forTask',
    async (_event: IpcMainInvokeEvent, taskId: string): Promise<CostRecord[]> => {
      return getCostRecordsForTask(taskId);
    },
  );
}
