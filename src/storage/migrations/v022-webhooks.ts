import type { Database } from 'better-sqlite3';
import type { Migration } from './index.js';

export const migration: Migration = {
  version: 22,
  up: (db: Database) => {
    db.exec(`
      ALTER TABLE app_settings ADD COLUMN webhook_urls TEXT NOT NULL DEFAULT '[]'
    `);
  },
};
