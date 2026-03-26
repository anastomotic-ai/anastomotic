import type { Database } from 'better-sqlite3';
import type { Migration } from './index.js';

export const migration: Migration = {
  version: 24,
  up: (db: Database) => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS file_watchers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        path TEXT NOT NULL,
        patterns TEXT NOT NULL DEFAULT '[]',
        action TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error')),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS proactive_alerts (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL CHECK (type IN ('file_change', 'disk_space', 'schedule_reminder', 'anomaly', 'suggestion')),
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'dismissed', 'acted')),
        suggested_action TEXT,
        metadata TEXT,
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_alerts_status ON proactive_alerts(status);
      CREATE INDEX IF NOT EXISTS idx_alerts_type ON proactive_alerts(type);
      CREATE INDEX IF NOT EXISTS idx_watchers_status ON file_watchers(status);
    `);
  },
  down: (db: Database) => {
    db.exec(`
      DROP TABLE IF EXISTS proactive_alerts;
      DROP TABLE IF EXISTS file_watchers;
    `);
  },
};
