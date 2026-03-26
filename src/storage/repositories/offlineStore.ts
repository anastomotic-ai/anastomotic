import { getDatabase } from '../database.js';
import type {
  LocalModelConfig,
  LocalModelCreateInput,
  OfflineQueueItem,
  OfflineQueueInput,
} from '../../common/types/offline.js';

function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function addLocalModel(input: LocalModelCreateInput): LocalModelConfig {
  const db = getDatabase();
  const id = createId('lm');
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO local_models (id, name, provider, model_id, endpoint, context_length, is_default, enabled, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
  ).run(
    id,
    input.name,
    input.provider,
    input.modelId,
    input.endpoint,
    input.contextLength ?? 4096,
    input.isDefault ? 1 : 0,
    now,
    now,
  );
  return getLocalModel(id)!;
}

export function getLocalModel(id: string): LocalModelConfig | null {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM local_models WHERE id = ?').get(id) as
    | Record<string, unknown>
    | undefined;
  return row ? mapModel(row) : null;
}

export function listLocalModels(): LocalModelConfig[] {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM local_models ORDER BY created_at DESC').all() as Record<
    string,
    unknown
  >[];
  return rows.map(mapModel);
}

export function updateLocalModelEnabled(id: string, enabled: boolean): void {
  const db = getDatabase();
  db.prepare("UPDATE local_models SET enabled = ?, updated_at = datetime('now') WHERE id = ?").run(
    enabled ? 1 : 0,
    id,
  );
}

export function deleteLocalModel(id: string): boolean {
  const db = getDatabase();
  const result = db.prepare('DELETE FROM local_models WHERE id = ?').run(id);
  return result.changes > 0;
}

export function enqueueOfflineTask(input: OfflineQueueInput): OfflineQueueItem {
  const db = getDatabase();
  const id = createId('oq');
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO offline_queue (id, task_prompt, priority, status, local_model_id, created_at)
     VALUES (?, ?, ?, 'queued', ?, ?)`,
  ).run(id, input.taskPrompt, input.priority ?? 0, input.localModelId ?? null, now);
  return getQueueItem(id)!;
}

export function getQueueItem(id: string): OfflineQueueItem | null {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM offline_queue WHERE id = ?').get(id) as
    | Record<string, unknown>
    | undefined;
  return row ? mapQueue(row) : null;
}

export function listOfflineQueue(status?: string): OfflineQueueItem[] {
  const db = getDatabase();
  if (status) {
    return (
      db
        .prepare(
          'SELECT * FROM offline_queue WHERE status = ? ORDER BY priority DESC, created_at ASC',
        )
        .all(status) as Record<string, unknown>[]
    ).map(mapQueue);
  }
  return (
    db
      .prepare('SELECT * FROM offline_queue ORDER BY priority DESC, created_at ASC')
      .all() as Record<string, unknown>[]
  ).map(mapQueue);
}

export function updateQueueItemStatus(id: string, status: string, errorMessage?: string): void {
  const db = getDatabase();
  const processed = status === 'completed' || status === 'failed' ? new Date().toISOString() : null;
  db.prepare(
    'UPDATE offline_queue SET status = ?, error_message = ?, processed_at = ? WHERE id = ?',
  ).run(status, errorMessage ?? null, processed, id);
}

export function clearCompletedQueue(): void {
  const db = getDatabase();
  db.prepare("DELETE FROM offline_queue WHERE status IN ('completed', 'failed')").run();
}

function mapModel(row: Record<string, unknown>): LocalModelConfig {
  return {
    id: row.id as string,
    name: row.name as string,
    provider: row.provider as LocalModelConfig['provider'],
    modelId: row.model_id as string,
    endpoint: row.endpoint as string,
    contextLength: row.context_length as number,
    isDefault: (row.is_default as number) === 1,
    enabled: (row.enabled as number) === 1,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapQueue(row: Record<string, unknown>): OfflineQueueItem {
  return {
    id: row.id as string,
    taskPrompt: row.task_prompt as string,
    priority: row.priority as number,
    status: row.status as OfflineQueueItem['status'],
    localModelId: row.local_model_id as string | null,
    errorMessage: row.error_message as string | null,
    createdAt: row.created_at as string,
    processedAt: row.processed_at as string | null,
  };
}
