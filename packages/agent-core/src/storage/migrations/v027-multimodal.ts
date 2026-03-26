import type { Migration } from './index.js';

export const migration: Migration = {
  version: 27,
  up: (db) => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS media_attachments (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        source TEXT NOT NULL,
        name TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        size_bytes INTEGER NOT NULL DEFAULT 0,
        width INTEGER,
        height INTEGER,
        duration_ms INTEGER,
        thumbnail_uri TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS structured_outputs (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        output_type TEXT NOT NULL,
        title TEXT NOT NULL DEFAULT '',
        data TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_structured_outputs_task ON structured_outputs(task_id);
    `);
  },
  down: (db) => {
    db.exec(`
      DROP TABLE IF EXISTS structured_outputs;
      DROP TABLE IF EXISTS media_attachments;
    `);
  },
};
