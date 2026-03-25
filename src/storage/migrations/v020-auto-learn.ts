import type { Database } from 'better-sqlite3';

export const migration = {
  version: 20,
  up(db: Database) {
    db.exec(`ALTER TABLE app_settings ADD COLUMN auto_learn_enabled INTEGER NOT NULL DEFAULT 0`);
  },
};
