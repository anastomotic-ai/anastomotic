import type { Database } from 'better-sqlite3';
import type { Migration } from './index.js';

export const migration: Migration = {
  version: 21,
  up(db: Database) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS pipelines (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        steps TEXT NOT NULL DEFAULT '[]',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS pipeline_runs (
        id TEXT PRIMARY KEY,
        pipeline_id TEXT NOT NULL,
        prompt TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        step_runs TEXT NOT NULL DEFAULT '[]',
        current_step_index INTEGER NOT NULL DEFAULT -1,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        completed_at TEXT,
        FOREIGN KEY (pipeline_id) REFERENCES pipelines(id) ON DELETE CASCADE
      );
    `);
  },
  down(db: Database) {
    db.exec(`
      DROP TABLE IF EXISTS pipeline_runs;
      DROP TABLE IF EXISTS pipelines;
    `);
  },
};
