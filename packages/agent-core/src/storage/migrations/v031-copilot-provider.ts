import type { Database } from 'better-sqlite3';
import type { Migration } from './index.js';

/**
 * Migration v031: GitHub Copilot provider support.
 *
 * No schema changes needed — Copilot credentials are stored in OpenCode's
 * auth.json file (not in SQLite), and provider settings use the existing
 * connected_providers JSON column.
 */
export const migration: Migration = {
  version: 31,
  up: (_db: Database) => {
    // No-op: Copilot auth is stored in auth.json, not SQLite
  },
};
