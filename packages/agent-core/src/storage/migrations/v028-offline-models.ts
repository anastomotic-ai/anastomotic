import type { Migration } from './index.js';

export const migration: Migration = {
  version: 28,
  up: (db) => {
    db.exec(`
    CREATE TABLE IF NOT EXISTS local_models (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      provider TEXT NOT NULL CHECK(provider IN ('ollama','lmstudio','custom')),
      model_id TEXT NOT NULL,
      endpoint TEXT NOT NULL,
      context_length INTEGER NOT NULL DEFAULT 4096,
      is_default INTEGER NOT NULL DEFAULT 0,
      enabled INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS offline_queue (
      id TEXT PRIMARY KEY,
      task_prompt TEXT NOT NULL,
      priority INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'queued' CHECK(status IN ('queued','processing','completed','failed')),
      local_model_id TEXT,
      error_message TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      processed_at TEXT,
      FOREIGN KEY (local_model_id) REFERENCES local_models(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_offline_queue_status ON offline_queue(status);
    CREATE INDEX IF NOT EXISTS idx_local_models_provider ON local_models(provider);
  `);
  },
};
