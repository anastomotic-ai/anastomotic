import type { IpcMainInvokeEvent } from 'electron';
import {
  createFileWatcher,
  listFileWatchers,
  deleteFileWatcher,
  updateFileWatcherStatus,
  listAlerts,
  dismissAlert,
  clearDismissedAlerts,
  startProactiveAgent,
  stopProactiveAgent,
  getDefaultProactiveConfig,
  type FileWatcherCreateInput,
  type WatcherStatus,
  type AlertStatus,
  type ProactiveConfig,
} from '@anastomotic_ai/agent-core';
import { handle } from './utils';

export function registerProactiveHandlers(): void {
  // File watchers
  handle(
    'proactive:watcher:create',
    async (_event: IpcMainInvokeEvent, input: FileWatcherCreateInput) => {
      return createFileWatcher(input);
    },
  );

  handle('proactive:watcher:list', async () => {
    return listFileWatchers();
  });

  handle(
    'proactive:watcher:updateStatus',
    async (_event: IpcMainInvokeEvent, id: string, status: WatcherStatus) => {
      updateFileWatcherStatus(id, status);
    },
  );

  handle('proactive:watcher:delete', async (_event: IpcMainInvokeEvent, id: string) => {
    return deleteFileWatcher(id);
  });

  // Alerts
  handle(
    'proactive:alert:list',
    async (_event: IpcMainInvokeEvent, status?: AlertStatus, limit?: number) => {
      return listAlerts(status, limit);
    },
  );

  handle('proactive:alert:dismiss', async (_event: IpcMainInvokeEvent, id: string) => {
    dismissAlert(id);
  });

  handle('proactive:alert:clearDismissed', async () => {
    clearDismissedAlerts();
  });

  // Agent control
  handle(
    'proactive:start',
    async (_event: IpcMainInvokeEvent, config?: Partial<ProactiveConfig>) => {
      startProactiveAgent(config);
    },
  );

  handle('proactive:stop', async () => {
    stopProactiveAgent();
  });

  handle('proactive:defaultConfig', async () => {
    return getDefaultProactiveConfig();
  });
}
