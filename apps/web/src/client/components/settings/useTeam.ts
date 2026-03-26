import { useState, useEffect, useCallback } from 'react';
import { getAnastomotic } from '@/lib/anastomotic';
import type { Team, TeamMember, AuditLogEntry } from '@anastomotic_ai/agent-core/common';

export function useTeam() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const api = getAnastomotic();

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const t = await api.listTeams();
      setTeams(t);
    } finally {
      setLoading(false);
    }
  }, [api]);

  const loadTeamDetails = useCallback(
    async (teamId: string) => {
      const [m, a] = await Promise.all([api.listTeamMembers(teamId), api.listAuditLog(teamId, 50)]);
      setMembers(m);
      setAuditLog(a);
    },
    [api],
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (selectedTeamId) {
      loadTeamDetails(selectedTeamId);
    }
  }, [selectedTeamId, loadTeamDetails]);

  const createTeam = useCallback(
    async (name: string, description: string) => {
      await api.createTeam({ name, description, ownerId: 'local-user' });
      await refresh();
    },
    [api, refresh],
  );

  const deleteTeam = useCallback(
    async (id: string) => {
      await api.deleteTeam(id);
      if (selectedTeamId === id) {
        setSelectedTeamId(null);
        setMembers([]);
        setAuditLog([]);
      }
      await refresh();
    },
    [api, refresh, selectedTeamId],
  );

  const addMember = useCallback(
    async (input: { name: string; email: string; role: string }) => {
      if (!selectedTeamId) {
        return;
      }
      await api.addTeamMember({ teamId: selectedTeamId, ...input });
      await loadTeamDetails(selectedTeamId);
    },
    [api, selectedTeamId, loadTeamDetails],
  );

  const removeMember = useCallback(
    async (id: string) => {
      await api.removeTeamMember(id);
      if (selectedTeamId) {
        await loadTeamDetails(selectedTeamId);
      }
    },
    [api, selectedTeamId, loadTeamDetails],
  );

  return {
    teams,
    members,
    auditLog,
    loading,
    selectedTeamId,
    setSelectedTeamId,
    createTeam,
    deleteTeam,
    addMember,
    removeMember,
  };
}
