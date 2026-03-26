import { getDatabase } from '../database.js';
import type {
  FileWatcherConfig,
  FileWatcherCreateInput,
  ProactiveAlert,
  ProactiveAlertCreateInput,
  AlertStatus,
  WatcherStatus,
} from '../../common/types/proactive.js';

function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function rowToWatcher(row: Record<string, unknown>): FileWatcherConfig {
  return {
    id: row.id as string,
    name: row.name as string,
    path: row.path as string,
    patterns: JSON.parse((row.patterns as string) || '[]') as string[],
    action: row.action as string,
    status: row.status as WatcherStatus,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function rowToAlert(row: Record<string, unknown>): ProactiveAlert {
  return {
    id: row.id as string,
    type: row.type as ProactiveAlert['type'],
    title: row.title as string,
    message: row.message as string,
    priority: row.priority as ProactiveAlert['priority'],
    status: row.status as AlertStatus,
    suggestedAction: (row.suggested_action as string) || undefined,
    metadata: (row.metadata as string) || undefined,
    createdAt: row.created_at as string,
  };
}

export function createFileWatcher(input: FileWatcherCreateInput): FileWatcherConfig {
  const db = getDatabase();
  const id = createId('fw');
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO file_watchers (id, name, path, patterns, action, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'active', ?, ?)`,
  ).run(id, input.name, input.path, JSON.stringify(input.patterns), input.action, now, now);
  return getFileWatcher(id)!;
}

export function getFileWatcher(id: string): FileWatcherConfig | null {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM file_watchers WHERE id = ?').get(id) as
    | Record<string, unknown>
    | undefined;
  return row ? rowToWatcher(row) : null;
}

export function listFileWatchers(): FileWatcherConfig[] {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM file_watchers ORDER BY created_at DESC').all() as Record<
    string,
    unknown
  >[];
  return rows.map(rowToWatcher);
}

export function updateFileWatcherStatus(id: string, status: WatcherStatus): void {
  const db = getDatabase();
  const now = new Date().toISOString();
  db.prepare('UPDATE file_watchers SET status = ?, updated_at = ? WHERE id = ?').run(
    status,
    now,
    id,
  );
}

export function deleteFileWatcher(id: string): boolean {
  const db = getDatabase();
  return db.prepare('DELETE FROM file_watchers WHERE id = ?').run(id).changes > 0;
}

export function createAlert(input: ProactiveAlertCreateInput): ProactiveAlert {
  const db = getDatabase();
  const id = createId('alert');
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO proactive_alerts (id, type, title, message, priority, status, suggested_action, metadata, created_at)
     VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?)`,
  ).run(
    id,
    input.type,
    input.title,
    input.message,
    input.priority,
    input.suggestedAction || null,
    input.metadata || null,
    now,
  );
  return getAlert(id)!;
}

export function getAlert(id: string): ProactiveAlert | null {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM proactive_alerts WHERE id = ?').get(id) as
    | Record<string, unknown>
    | undefined;
  return row ? rowToAlert(row) : null;
}

export function listAlerts(status?: AlertStatus, limit = 50): ProactiveAlert[] {
  const db = getDatabase();
  if (status) {
    const rows = db
      .prepare('SELECT * FROM proactive_alerts WHERE status = ? ORDER BY created_at DESC LIMIT ?')
      .all(status, limit) as Record<string, unknown>[];
    return rows.map(rowToAlert);
  }
  const rows = db
    .prepare('SELECT * FROM proactive_alerts ORDER BY created_at DESC LIMIT ?')
    .all(limit) as Record<string, unknown>[];
  return rows.map(rowToAlert);
}

export function updateAlertStatus(id: string, status: AlertStatus): void {
  const db = getDatabase();
  db.prepare('UPDATE proactive_alerts SET status = ? WHERE id = ?').run(status, id);
}

export function dismissAlert(id: string): void {
  updateAlertStatus(id, 'dismissed');
}

export function clearDismissedAlerts(): void {
  const db = getDatabase();
  db.prepare("DELETE FROM proactive_alerts WHERE status = 'dismissed'").run();
}
