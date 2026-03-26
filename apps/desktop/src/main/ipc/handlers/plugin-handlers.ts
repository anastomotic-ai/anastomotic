import type { IpcMainInvokeEvent } from 'electron';
import {
  installPlugin,
  listPlugins,
  getPlugin,
  updatePluginStatus,
  uninstallPlugin,
  listPluginEvents,
  type PluginInstallInput,
  type PluginStatus,
} from '@anastomotic_ai/agent-core';
import { handle } from './utils';

export function registerPluginHandlers(): void {
  handle('plugin:install', async (_event: IpcMainInvokeEvent, input: PluginInstallInput) => {
    return installPlugin(input);
  });

  handle('plugin:list', async () => {
    return listPlugins();
  });

  handle('plugin:get', async (_event: IpcMainInvokeEvent, id: string) => {
    return getPlugin(id);
  });

  handle(
    'plugin:updateStatus',
    async (_event: IpcMainInvokeEvent, id: string, status: PluginStatus) => {
      updatePluginStatus(id, status);
    },
  );

  handle('plugin:uninstall', async (_event: IpcMainInvokeEvent, id: string) => {
    return uninstallPlugin(id);
  });

  handle('plugin:events', async (_event: IpcMainInvokeEvent, pluginId: string, limit?: number) => {
    return listPluginEvents(pluginId, limit);
  });
}
