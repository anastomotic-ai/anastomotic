/**
 * Migration v030 — add huggingface_local_config column to app_settings
 *
 * Stores HuggingFace Local inference configuration (model selection, server port,
 * quantization preferences) as a JSON blob.
 */
import type { Database } from 'better-sqlite3';
import type { Migration } from './index.js';

export const migration: Migration = {
  version: 30,
  up: (db: Database) => {
    const columns = db.prepare(`PRAGMA table_info(app_settings)`).all() as Array<{
      name: string;
    }>;
    const hasColumn = columns.some((column) => {
      return column.name === 'huggingface_local_config';
    });
    if (!hasColumn) {
      db.exec(`ALTER TABLE app_settings ADD COLUMN huggingface_local_config TEXT DEFAULT NULL`);
    }
  },
};
