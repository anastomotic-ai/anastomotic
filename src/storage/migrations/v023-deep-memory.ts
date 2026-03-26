import type { Database } from 'better-sqlite3';
import type { Migration } from './index.js';

export const migration: Migration = {
  version: 23,
  up: (db: Database) => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS memory_entries (
        id TEXT PRIMARY KEY,
        workspace_id TEXT,
        scope TEXT NOT NULL CHECK (scope IN ('workspace', 'global')),
        category TEXT NOT NULL CHECK (category IN ('task_context', 'preference', 'pattern', 'fact', 'workflow')),
        content TEXT NOT NULL,
        keywords TEXT NOT NULL DEFAULT '',
        relevance_score REAL NOT NULL DEFAULT 1.0,
        access_count INTEGER NOT NULL DEFAULT 0,
        last_accessed_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_memory_scope ON memory_entries(scope);
      CREATE INDEX IF NOT EXISTS idx_memory_workspace ON memory_entries(workspace_id);
      CREATE INDEX IF NOT EXISTS idx_memory_category ON memory_entries(category);

      CREATE TABLE IF NOT EXISTS behavioral_preferences (
        id TEXT PRIMARY KEY,
        workspace_id TEXT,
        key TEXT NOT NULL CHECK (key IN ('naming_convention', 'folder_structure', 'writing_style', 'approval_pattern', 'code_style', 'communication_tone', 'tool_preference', 'custom')),
        label TEXT NOT NULL,
        value TEXT NOT NULL,
        confidence REAL NOT NULL DEFAULT 0.5,
        observed_count INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_pref_key ON behavioral_preferences(key);
      CREATE INDEX IF NOT EXISTS idx_pref_workspace ON behavioral_preferences(workspace_id);
    `);
  },
  down: (db: Database) => {
    db.exec(`
      DROP TABLE IF EXISTS behavioral_preferences;
      DROP TABLE IF EXISTS memory_entries;
    `);
  },
};
