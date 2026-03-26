import { useState } from 'react';
import { useTeam } from './useTeam';
import { Users, Plus, Trash, UserPlus, ClockCounterClockwise } from '@phosphor-icons/react';

export function TeamPanel() {
  const {
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
  } = useTeam();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDesc, setTeamDesc] = useState('');
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('member');
  const [tab, setTab] = useState<'members' | 'audit'>('members');

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      return;
    }
    await createTeam(teamName.trim(), teamDesc.trim());
    setTeamName('');
    setTeamDesc('');
    setShowCreateForm(false);
  };

  const handleAddMember = async () => {
    if (!memberName.trim() || !memberEmail.trim()) {
      return;
    }
    await addMember({ name: memberName.trim(), email: memberEmail.trim(), role: memberRole });
    setMemberName('');
    setMemberEmail('');
    setMemberRole('member');
    setShowMemberForm(false);
  };

  if (loading) {
    return <div className="text-sm text-white/40">Loading...</div>;
  }

  const selectedTeam = teams.find((t) => t.id === selectedTeamId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-white/60" />
          <h3 className="text-base font-medium text-white">Teams</h3>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-1 text-xs text-white/40 hover:text-white/80"
        >
          <Plus size={14} />
          New Team
        </button>
      </div>

      {showCreateForm && (
        <div className="space-y-2 rounded-lg border border-white/10 bg-white/5 p-3">
          <input
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Team name"
            className="w-full rounded bg-white/10 px-2 py-1 text-sm text-white placeholder-white/30"
          />
          <input
            value={teamDesc}
            onChange={(e) => setTeamDesc(e.target.value)}
            placeholder="Description"
            className="w-full rounded bg-white/10 px-2 py-1 text-sm text-white placeholder-white/30"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowCreateForm(false)}
              className="rounded px-3 py-1 text-xs text-white/40 hover:text-white/80"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateTeam}
              className="rounded bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20"
            >
              Create
            </button>
          </div>
        </div>
      )}

      {/* Team list */}
      <div className="space-y-2">
        {teams.map((t) => (
          <div
            key={t.id}
            onClick={() => setSelectedTeamId(t.id)}
            className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition ${
              selectedTeamId === t.id
                ? 'border-white/30 bg-white/10'
                : 'border-white/10 bg-white/5 hover:bg-white/[0.07]'
            }`}
          >
            <div className="min-w-0 flex-1">
              <span className="text-sm font-medium text-white">{t.name}</span>
              {t.description && <p className="text-xs text-white/50">{t.description}</p>}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteTeam(t.id);
              }}
              className="ml-2 text-white/40 hover:text-red-400"
              title="Delete"
            >
              <Trash size={14} />
            </button>
          </div>
        ))}
        {teams.length === 0 && !showCreateForm && (
          <p className="text-xs text-white/30">No teams yet.</p>
        )}
      </div>

      {/* Team detail */}
      {selectedTeam && (
        <div className="space-y-4 rounded-lg border border-white/10 p-4">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-white">{selectedTeam.name}</h4>
          </div>

          {/* Tabs */}
          <div className="flex gap-3 border-b border-white/10 pb-1">
            <button
              onClick={() => setTab('members')}
              className={`text-xs pb-1 ${tab === 'members' ? 'text-white border-b border-white' : 'text-white/40'}`}
            >
              Members ({members.length})
            </button>
            <button
              onClick={() => setTab('audit')}
              className={`text-xs pb-1 ${tab === 'audit' ? 'text-white border-b border-white' : 'text-white/40'}`}
            >
              Audit Log
            </button>
          </div>

          {tab === 'members' && (
            <div className="space-y-2">
              {members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded border border-white/10 bg-white/5 p-2"
                >
                  <div>
                    <span className="text-sm text-white">{m.name}</span>
                    <span className="ml-2 text-xs text-white/40">{m.email}</span>
                    <span className="ml-2 rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">
                      {m.role}
                    </span>
                  </div>
                  <button
                    onClick={() => removeMember(m.id)}
                    className="text-white/40 hover:text-red-400"
                  >
                    <Trash size={12} />
                  </button>
                </div>
              ))}
              {showMemberForm ? (
                <div className="space-y-2 rounded border border-white/10 bg-white/5 p-2">
                  <input
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    placeholder="Name"
                    className="w-full rounded bg-white/10 px-2 py-1 text-xs text-white placeholder-white/30"
                  />
                  <input
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full rounded bg-white/10 px-2 py-1 text-xs text-white placeholder-white/30"
                  />
                  <select
                    value={memberRole}
                    onChange={(e) => setMemberRole(e.target.value)}
                    className="w-full rounded bg-white/10 px-2 py-1 text-xs text-white"
                  >
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowMemberForm(false)}
                      className="text-xs text-white/40"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddMember}
                      className="rounded bg-white/10 px-2 py-1 text-xs text-white"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowMemberForm(true)}
                  className="flex items-center gap-1 text-xs text-white/40 hover:text-white/80"
                >
                  <UserPlus size={14} /> Add member
                </button>
              )}
            </div>
          )}

          {tab === 'audit' && (
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {auditLog.length === 0 && <p className="text-xs text-white/30">No audit entries.</p>}
              {auditLog.map((entry) => (
                <div key={entry.id} className="flex items-start gap-2 py-1 text-xs">
                  <ClockCounterClockwise size={12} className="mt-0.5 text-white/30" />
                  <div className="min-w-0 flex-1">
                    <span className="text-white/60">{entry.action}</span>
                    <span className="ml-1 text-white/40">on {entry.resource}</span>
                    {entry.details && <p className="text-white/30">{entry.details}</p>}
                    <p className="text-white/20">{new Date(entry.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
