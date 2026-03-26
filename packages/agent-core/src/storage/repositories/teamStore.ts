import { getDatabase } from '../database.js';
import type {
  Team,
  TeamCreateInput,
  TeamMember,
  TeamMemberCreateInput,
  SharedWorkspace,
  AuditLogEntry,
  AuditLogCreateInput,
} from '../../common/types/team.js';

function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// --- Teams ---

export function createTeam(input: TeamCreateInput): Team {
  const db = getDatabase();
  const id = createId('team');
  const now = new Date().toISOString();
  db.prepare(
    'INSERT INTO teams (id, name, description, owner_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
  ).run(id, input.name, input.description, input.ownerId, now, now);
  return { id, ...input, createdAt: now, updatedAt: now };
}

export function getTeam(id: string): Team | null {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM teams WHERE id = ?').get(id) as
    | Record<string, unknown>
    | undefined;
  if (!row) {
    return null;
  }
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string,
    ownerId: row.owner_id as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function listTeams(): Team[] {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM teams ORDER BY created_at DESC').all() as Record<
    string,
    unknown
  >[];
  return rows.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    description: row.description as string,
    ownerId: row.owner_id as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }));
}

export function deleteTeam(id: string): boolean {
  const db = getDatabase();
  const result = db.prepare('DELETE FROM teams WHERE id = ?').run(id);
  return result.changes > 0;
}

// --- Team Members ---

export function addTeamMember(input: TeamMemberCreateInput): TeamMember {
  const db = getDatabase();
  const id = createId('member');
  const now = new Date().toISOString();
  db.prepare(
    'INSERT INTO team_members (id, team_id, name, email, role, joined_at) VALUES (?, ?, ?, ?, ?, ?)',
  ).run(id, input.teamId, input.name, input.email, input.role, now);
  return { id, ...input, joinedAt: now };
}

export function listTeamMembers(teamId: string): TeamMember[] {
  const db = getDatabase();
  const rows = db
    .prepare('SELECT * FROM team_members WHERE team_id = ? ORDER BY joined_at')
    .all(teamId) as Record<string, unknown>[];
  return rows.map((row) => ({
    id: row.id as string,
    teamId: row.team_id as string,
    name: row.name as string,
    email: row.email as string,
    role: row.role as string as TeamMember['role'],
    joinedAt: row.joined_at as string,
  }));
}

export function removeTeamMember(id: string): boolean {
  const db = getDatabase();
  const result = db.prepare('DELETE FROM team_members WHERE id = ?').run(id);
  return result.changes > 0;
}

// --- Shared Workspaces ---

export function shareWorkspace(
  teamId: string,
  workspaceId: string,
  sharedBy: string,
): SharedWorkspace {
  const db = getDatabase();
  const id = createId('share');
  const now = new Date().toISOString();
  db.prepare(
    'INSERT INTO shared_workspaces (id, team_id, workspace_id, shared_by, shared_at) VALUES (?, ?, ?, ?, ?)',
  ).run(id, teamId, workspaceId, sharedBy, now);
  return { id, teamId, workspaceId, sharedBy, sharedAt: now };
}

export function listSharedWorkspaces(teamId: string): SharedWorkspace[] {
  const db = getDatabase();
  const rows = db
    .prepare('SELECT * FROM shared_workspaces WHERE team_id = ?')
    .all(teamId) as Record<string, unknown>[];
  return rows.map((row) => ({
    id: row.id as string,
    teamId: row.team_id as string,
    workspaceId: row.workspace_id as string,
    sharedBy: row.shared_by as string,
    sharedAt: row.shared_at as string,
  }));
}

export function unshareWorkspace(id: string): boolean {
  const db = getDatabase();
  const result = db.prepare('DELETE FROM shared_workspaces WHERE id = ?').run(id);
  return result.changes > 0;
}

// --- Audit Log ---

export function addAuditLog(input: AuditLogCreateInput): AuditLogEntry {
  const db = getDatabase();
  const id = createId('audit');
  const now = new Date().toISOString();
  db.prepare(
    'INSERT INTO audit_log (id, team_id, user_id, action, resource, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
  ).run(id, input.teamId, input.userId, input.action, input.resource, input.details, now);
  return { id, ...input, createdAt: now };
}

export function listAuditLog(teamId: string, limit = 100): AuditLogEntry[] {
  const db = getDatabase();
  const rows = db
    .prepare('SELECT * FROM audit_log WHERE team_id = ? ORDER BY created_at DESC LIMIT ?')
    .all(teamId, limit) as Record<string, unknown>[];
  return rows.map((row) => ({
    id: row.id as string,
    teamId: row.team_id as string,
    userId: row.user_id as string,
    action: row.action as string,
    resource: row.resource as string,
    details: row.details as string,
    createdAt: row.created_at as string,
  }));
}
