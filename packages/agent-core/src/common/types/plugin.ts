/**
 * Plugin API/SDK types — extensible plugin system for third-party integrations.
 */

export type PluginStatus = 'installed' | 'active' | 'disabled' | 'error';

export interface PluginHook {
  event: string;
  handler: string;
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  homepage?: string;
  entryPoint: string;
  hooks: PluginHook[];
  permissions: string[];
}

export interface InstalledPlugin {
  id: string;
  manifestId: string;
  name: string;
  version: string;
  description: string;
  author: string;
  status: PluginStatus;
  entryPoint: string;
  hooks: string;
  permissions: string;
  installedAt: string;
  updatedAt: string;
}

export interface PluginInstallInput {
  manifestId: string;
  name: string;
  version: string;
  description: string;
  author: string;
  entryPoint: string;
  hooks: PluginHook[];
  permissions: string[];
}

export interface PluginEvent {
  id: string;
  pluginId: string;
  event: string;
  payload: string;
  result?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}
