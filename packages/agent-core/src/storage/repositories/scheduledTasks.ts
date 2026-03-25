import { getDatabase } from '../database.js';
import type { ScheduledTask } from '../../common/types/daemon.js';

function rowToScheduled(row: Record<string, unknown>): ScheduledTask {
  return {
    id: row.id as string,
    cron: row.cron as string,
    prompt: row.prompt as string,
    enabled: (row.enabled as number) === 1,
    createdAt: row.created_at as string,
    lastRunAt: (row.last_run_at as string) ?? undefined,
    nextRunAt: (row.next_run_at as string) ?? undefined,
  };
}

export function getAllScheduledTasks(): ScheduledTask[] {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM scheduled_tasks ORDER BY created_at ASC').all() as Record<
    string,
    unknown
  >[];
  return rows.map(rowToScheduled);
}

export function getScheduledTask(id: string): ScheduledTask | null {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM scheduled_tasks WHERE id = ?').get(id) as
    | Record<string, unknown>
    | undefined;
  return row ? rowToScheduled(row) : null;
}

export function saveScheduledTask(task: ScheduledTask): void {
  const db = getDatabase();
  db.prepare(
    `INSERT OR REPLACE INTO scheduled_tasks (id, cron, prompt, enabled, created_at, last_run_at, next_run_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    task.id,
    task.cron,
    task.prompt,
    task.enabled ? 1 : 0,
    task.createdAt,
    task.lastRunAt ?? null,
    task.nextRunAt ?? null,
  );
}

export function updateScheduledTaskRun(id: string, lastRunAt: string, nextRunAt?: string): void {
  const db = getDatabase();
  db.prepare('UPDATE scheduled_tasks SET last_run_at = ?, next_run_at = ? WHERE id = ?').run(
    lastRunAt,
    nextRunAt ?? null,
    id,
  );
}

export function deleteScheduledTask(id: string): boolean {
  const db = getDatabase();
  const result = db.prepare('DELETE FROM scheduled_tasks WHERE id = ?').run(id);
  return result.changes > 0;
}

export function setScheduledTaskEnabled(id: string, enabled: boolean): void {
  const db = getDatabase();
  db.prepare('UPDATE scheduled_tasks SET enabled = ? WHERE id = ?').run(enabled ? 1 : 0, id);
}
