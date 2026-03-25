import type { Database } from 'better-sqlite3';
import type { Migration } from './index.js';

export const migration: Migration = {
  version: 19,
  up(db: Database): void {
    db.exec(`
      CREATE TABLE cost_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        provider TEXT NOT NULL,
        model TEXT NOT NULL,
        input_tokens INTEGER NOT NULL DEFAULT 0,
        output_tokens INTEGER NOT NULL DEFAULT 0,
        cost_usd REAL NOT NULL DEFAULT 0,
        recorded_at TEXT NOT NULL
      )
    `);

    db.exec(`CREATE INDEX idx_cost_records_task_id ON cost_records(task_id)`);
    db.exec(`CREATE INDEX idx_cost_records_recorded_at ON cost_records(recorded_at)`);
  },
};
