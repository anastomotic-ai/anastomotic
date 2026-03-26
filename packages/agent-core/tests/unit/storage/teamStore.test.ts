/** @vitest-environment node */

import { describe, it, expect, beforeAll, beforeEach, afterAll, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('Team store', () => {
  let testDir: string;
  let dbPath: string;
  let databaseModule: typeof import('../../../src/storage/database.js') | null = null;
  let teamModule: typeof import('../../../src/storage/repositories/teamStore.js') | null = null;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeAll(async () => {
    databaseModule = await import('../../../src/storage/database.js');
    teamModule = await import('../../../src/storage/repositories/teamStore.js');
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  beforeEach(() => {
    if (!databaseModule || !teamModule) {
      return;
    }
    testDir = path.join(
      os.tmpdir(),
      `team-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
    fs.mkdirSync(testDir, { recursive: true });
    dbPath = path.join(testDir, 'test.db');
    databaseModule.initializeDatabase({ databasePath: dbPath });
  });

  afterEach(() => {
    if (databaseModule) {
      databaseModule.resetDatabaseInstance();
    }
    if (testDir && fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  // --- Teams ---

  it('should create a team', () => {
    if (!teamModule) {
      return;
    }

    const team = teamModule.createTeam({
      name: 'Engineering',
      description: 'Dev team',
      ownerId: 'user_1',
    });

    expect(team.id).toMatch(/^team_/);
    expect(team.name).toBe('Engineering');
    expect(team.description).toBe('Dev team');
    expect(team.ownerId).toBe('user_1');
  });

  it('should get a team by id', () => {
    if (!teamModule) {
      return;
    }

    const team = teamModule.createTeam({
      name: 'QA',
      description: 'QA team',
      ownerId: 'user_2',
    });

    const retrieved = teamModule.getTeam(team.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.name).toBe('QA');
  });

  it('should return null for non-existent team', () => {
    if (!teamModule) {
      return;
    }

    expect(teamModule.getTeam('team_nonexistent')).toBeNull();
  });

  it('should list all teams', () => {
    if (!teamModule) {
      return;
    }

    teamModule.createTeam({ name: 'Team A', description: 'A', ownerId: 'u1' });
    teamModule.createTeam({ name: 'Team B', description: 'B', ownerId: 'u2' });

    const teams = teamModule.listTeams();
    expect(teams).toHaveLength(2);
  });

  it('should delete a team', () => {
    if (!teamModule) {
      return;
    }

    const team = teamModule.createTeam({ name: 'Temp', description: 'Del me', ownerId: 'u1' });
    const deleted = teamModule.deleteTeam(team.id);
    expect(deleted).toBe(true);
    expect(teamModule.getTeam(team.id)).toBeNull();
  });

  // --- Members ---

  it('should add and list team members', () => {
    if (!teamModule) {
      return;
    }

    const team = teamModule.createTeam({ name: 'Dev', description: '', ownerId: 'u1' });

    const member = teamModule.addTeamMember({
      teamId: team.id,
      name: 'Alice',
      email: 'alice@example.com',
      role: 'admin',
    });

    expect(member.id).toMatch(/^member_/);
    expect(member.name).toBe('Alice');
    expect(member.role).toBe('admin');

    const members = teamModule.listTeamMembers(team.id);
    expect(members).toHaveLength(1);
    expect(members[0].email).toBe('alice@example.com');
  });

  it('should remove a team member', () => {
    if (!teamModule) {
      return;
    }

    const team = teamModule.createTeam({ name: 'Dev', description: '', ownerId: 'u1' });
    const member = teamModule.addTeamMember({
      teamId: team.id,
      name: 'Bob',
      email: 'bob@example.com',
      role: 'member',
    });

    const removed = teamModule.removeTeamMember(member.id);
    expect(removed).toBe(true);

    const members = teamModule.listTeamMembers(team.id);
    expect(members).toHaveLength(0);
  });

  // --- Shared Workspaces ---

  it('should share and list workspaces', () => {
    if (!teamModule) {
      return;
    }

    const team = teamModule.createTeam({ name: 'Dev', description: '', ownerId: 'u1' });

    const shared = teamModule.shareWorkspace(team.id, 'ws_1', 'user_1');
    expect(shared.id).toMatch(/^share_/);
    expect(shared.teamId).toBe(team.id);
    expect(shared.workspaceId).toBe('ws_1');

    const list = teamModule.listSharedWorkspaces(team.id);
    expect(list).toHaveLength(1);
  });

  it('should unshare a workspace', () => {
    if (!teamModule) {
      return;
    }

    const team = teamModule.createTeam({ name: 'Dev', description: '', ownerId: 'u1' });
    const shared = teamModule.shareWorkspace(team.id, 'ws_1', 'user_1');

    const removed = teamModule.unshareWorkspace(shared.id);
    expect(removed).toBe(true);

    const list = teamModule.listSharedWorkspaces(team.id);
    expect(list).toHaveLength(0);
  });

  // --- Audit Log ---

  it('should add and list audit log entries', () => {
    if (!teamModule) {
      return;
    }

    const team = teamModule.createTeam({ name: 'Dev', description: '', ownerId: 'u1' });

    const entry = teamModule.addAuditLog({
      teamId: team.id,
      userId: 'user_1',
      action: 'member_added',
      resource: 'team_members',
      details: 'Added Alice',
    });

    expect(entry.id).toMatch(/^audit_/);
    expect(entry.action).toBe('member_added');

    const logs = teamModule.listAuditLog(team.id);
    expect(logs).toHaveLength(1);
    expect(logs[0].details).toBe('Added Alice');
  });
});
