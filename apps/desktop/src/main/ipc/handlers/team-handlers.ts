import type { IpcMainInvokeEvent } from 'electron';
import {
  createTeam,
  listTeams,
  deleteTeam,
  addTeamMember,
  listTeamMembers,
  removeTeamMember,
  shareWorkspace,
  listSharedWorkspaces,
  unshareWorkspace,
  addAuditLog,
  listAuditLog,
  type TeamCreateInput,
  type TeamMemberCreateInput,
  type AuditLogCreateInput,
} from '@anastomotic_ai/agent-core';
import { handle } from './utils';

export function registerTeamHandlers(): void {
  handle('team:create', async (_event: IpcMainInvokeEvent, input: TeamCreateInput) => {
    return createTeam(input);
  });

  handle('team:list', async () => {
    return listTeams();
  });

  handle('team:delete', async (_event: IpcMainInvokeEvent, id: string) => {
    return deleteTeam(id);
  });

  handle('team:member:add', async (_event: IpcMainInvokeEvent, input: TeamMemberCreateInput) => {
    return addTeamMember(input);
  });

  handle('team:member:list', async (_event: IpcMainInvokeEvent, teamId: string) => {
    return listTeamMembers(teamId);
  });

  handle('team:member:remove', async (_event: IpcMainInvokeEvent, id: string) => {
    return removeTeamMember(id);
  });

  handle(
    'team:workspace:share',
    async (_event: IpcMainInvokeEvent, teamId: string, workspaceId: string, sharedBy: string) => {
      return shareWorkspace(teamId, workspaceId, sharedBy);
    },
  );

  handle('team:workspace:list', async (_event: IpcMainInvokeEvent, teamId: string) => {
    return listSharedWorkspaces(teamId);
  });

  handle('team:workspace:unshare', async (_event: IpcMainInvokeEvent, id: string) => {
    return unshareWorkspace(id);
  });

  handle('team:audit:add', async (_event: IpcMainInvokeEvent, input: AuditLogCreateInput) => {
    return addAuditLog(input);
  });

  handle('team:audit:list', async (_event: IpcMainInvokeEvent, teamId: string, limit?: number) => {
    return listAuditLog(teamId, limit);
  });
}
