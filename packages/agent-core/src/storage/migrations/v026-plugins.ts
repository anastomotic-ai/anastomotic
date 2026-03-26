import type { Migration } from './index.js';

export const migration: Migration = {
  version: 26,
  up: (db) => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS plugins (
        id TEXT PRIMARY KEY,
        manifest_id TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        version TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        author TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'installed',
        entry_point TEXT NOT NULL,
        hooks TEXT NOT NULL DEFAULT '[]',
        permissions TEXT NOT NULL DEFAULT '[]',
        installed_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_plugins_status ON plugins(status);
      CREATE TABLE IF NOT EXISTS plugin_events (
        id TEXT PRIMARY KEY,
        plugin_id TEXT NOT NULL REFERENCES plugins(id) ON DELETE CASCADE,
        event TEXT NOT NULL,
        payload TEXT NOT NULL DEFAULT '{}',
        result TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_plugin_events_plugin ON plugin_events(plugin_id);
    `);
  },
  down: (db) => {
    db.exec(`
      DROP TABLE IF EXISTS plugin_events;
      DROP TABLE IF EXISTS plugins;
    `);
  },
};
