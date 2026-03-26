/**
 * Team & Enterprise types — shared workspaces, team members, and audit logging.
 */

export type TeamRole = 'owner' | 'admin' | 'member' | 'viewer';
export type InviteStatus = 'pending' | 'accepted' | 'declined';

export interface TeamMember {
  id: string;
  teamId: string;
  name: string;
  email: string;
  role: TeamRole;
  joinedAt: string;
}

export interface TeamMemberCreateInput {
  teamId: string;
  name: string;
  email: string;
  role: TeamRole;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamCreateInput {
  name: string;
  description: string;
  ownerId: string;
}

export interface SharedWorkspace {
  id: string;
  teamId: string;
  workspaceId: string;
  sharedBy: string;
  sharedAt: string;
}

export interface AuditLogEntry {
  id: string;
  teamId: string;
  userId: string;
  action: string;
  resource: string;
  details: string;
  createdAt: string;
}

export interface AuditLogCreateInput {
  teamId: string;
  userId: string;
  action: string;
  resource: string;
  details: string;
}
