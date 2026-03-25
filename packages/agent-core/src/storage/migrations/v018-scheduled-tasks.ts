import type { Database } from 'better-sqlite3';
import type { Migration } from './index.js';

export const migration: Migration = {
  version: 18,
  up(db: Database): void {
    db.exec(`
      CREATE TABLE scheduled_tasks (
        id TEXT PRIMARY KEY,
        cron TEXT NOT NULL,
        prompt TEXT NOT NULL,
        enabled INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        last_run_at TEXT,
        next_run_at TEXT
      )
    `);
  },
};
