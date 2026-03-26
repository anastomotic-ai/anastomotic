import type { Migration } from './index.js';

export const migration: Migration = {
  version: 25,
  up: (db) => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        owner_id TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS team_members (
        id TEXT PRIMARY KEY,
        team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'member',
        joined_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
      CREATE TABLE IF NOT EXISTS shared_workspaces (
        id TEXT PRIMARY KEY,
        team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        workspace_id TEXT NOT NULL,
        shared_by TEXT NOT NULL,
        shared_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_shared_ws_team ON shared_workspaces(team_id);
      CREATE TABLE IF NOT EXISTS audit_log (
        id TEXT PRIMARY KEY,
        team_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        action TEXT NOT NULL,
        resource TEXT NOT NULL,
        details TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_audit_log_team ON audit_log(team_id);
      CREATE INDEX IF NOT EXISTS idx_audit_log_time ON audit_log(created_at);
    `);
  },
  down: (db) => {
    db.exec(`
      DROP TABLE IF EXISTS audit_log;
      DROP TABLE IF EXISTS shared_workspaces;
      DROP TABLE IF EXISTS team_members;
      DROP TABLE IF EXISTS teams;
    `);
  },
};
