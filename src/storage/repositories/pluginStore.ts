import { getDatabase } from '../database.js';
import type {
  InstalledPlugin,
  PluginInstallInput,
  PluginStatus,
  PluginEvent,
} from '../../common/types/plugin.js';

function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function rowToPlugin(row: Record<string, unknown>): InstalledPlugin {
  return {
    id: row.id as string,
    manifestId: row.manifest_id as string,
    name: row.name as string,
    version: row.version as string,
    description: row.description as string,
    author: row.author as string,
    status: row.status as PluginStatus,
    entryPoint: row.entry_point as string,
    hooks: row.hooks as string,
    permissions: row.permissions as string,
    installedAt: row.installed_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function installPlugin(input: PluginInstallInput): InstalledPlugin {
  const db = getDatabase();
  const id = createId('plugin');
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO plugins (id, manifest_id, name, version, description, author, status, entry_point, hooks, permissions, installed_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 'installed', ?, ?, ?, ?, ?)`,
  ).run(
    id,
    input.manifestId,
    input.name,
    input.version,
    input.description,
    input.author,
    input.entryPoint,
    JSON.stringify(input.hooks),
    JSON.stringify(input.permissions),
    now,
    now,
  );
  return {
    id,
    manifestId: input.manifestId,
    name: input.name,
    version: input.version,
    description: input.description,
    author: input.author,
    status: 'installed',
    entryPoint: input.entryPoint,
    hooks: JSON.stringify(input.hooks),
    permissions: JSON.stringify(input.permissions),
    installedAt: now,
    updatedAt: now,
  };
}

export function listPlugins(): InstalledPlugin[] {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM plugins ORDER BY installed_at DESC').all() as Record<
    string,
    unknown
  >[];
  return rows.map(rowToPlugin);
}

export function getPlugin(id: string): InstalledPlugin | null {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM plugins WHERE id = ?').get(id) as
    | Record<string, unknown>
    | undefined;
  return row ? rowToPlugin(row) : null;
}

export function updatePluginStatus(id: string, status: PluginStatus): void {
  const db = getDatabase();
  db.prepare('UPDATE plugins SET status = ?, updated_at = ? WHERE id = ?').run(
    status,
    new Date().toISOString(),
    id,
  );
}

export function uninstallPlugin(id: string): boolean {
  const db = getDatabase();
  const result = db.prepare('DELETE FROM plugins WHERE id = ?').run(id);
  return result.changes > 0;
}

export function listPluginEvents(pluginId: string, limit = 50): PluginEvent[] {
  const db = getDatabase();
  const rows = db
    .prepare('SELECT * FROM plugin_events WHERE plugin_id = ? ORDER BY created_at DESC LIMIT ?')
    .all(pluginId, limit) as Record<string, unknown>[];
  return rows.map((row) => ({
    id: row.id as string,
    pluginId: row.plugin_id as string,
    event: row.event as string,
    payload: row.payload as string,
    result: row.result as string | undefined,
    status: row.status as PluginEvent['status'],
    createdAt: row.created_at as string,
  }));
}
