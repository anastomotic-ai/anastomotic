import { useState } from 'react';
import { useProactive } from './useProactive';
import { Eye, Plus, Trash, BellRinging } from '@phosphor-icons/react';
import type { ProactiveAlert } from '@anastomotic_ai/agent-core/common';

function AlertItem({
  alert,
  onDismiss,
}: {
  alert: ProactiveAlert;
  onDismiss: (id: string) => void;
}) {
  const priorityColor: Record<string, string> = {
    low: 'text-blue-400',
    medium: 'text-yellow-400',
    high: 'text-red-400',
  };

  return (
    <div className="flex items-start justify-between rounded-lg border border-white/10 bg-white/5 p-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${priorityColor[alert.priority] ?? ''}`}>
            {alert.priority.toUpperCase()}
          </span>
          <span className="text-sm font-medium text-white">{alert.title}</span>
        </div>
        <p className="mt-1 text-xs text-white/60">{alert.message}</p>
        {alert.suggestedAction && (
          <p className="mt-1 text-xs italic text-white/40">Suggestion: {alert.suggestedAction}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(alert.id)}
        className="ml-2 text-white/40 hover:text-white/80"
        title="Dismiss"
      >
        <Trash size={14} />
      </button>
    </div>
  );
}

export function ProactivePanel() {
  const { watchers, alerts, loading, addWatcher, removeWatcher, handleDismiss, toggleAgent } =
    useProactive();

  const [showAddForm, setShowAddForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formPath, setFormPath] = useState('');
  const [formPatterns, setFormPatterns] = useState('');
  const [formAction, setFormAction] = useState('');
  const [agentEnabled, setAgentEnabled] = useState(false);

  const handleSubmit = async () => {
    if (!formName.trim() || !formPath.trim()) {
      return;
    }
    await addWatcher({
      name: formName.trim(),
      path: formPath.trim(),
      patterns: formPatterns ? formPatterns.split(',').map((p) => p.trim()) : [],
      action: formAction.trim(),
    });
    setFormName('');
    setFormPath('');
    setFormPatterns('');
    setFormAction('');
    setShowAddForm(false);
  };

  const handleToggle = async () => {
    const next = !agentEnabled;
    setAgentEnabled(next);
    await toggleAgent(next);
  };

  if (loading) {
    return <div className="text-sm text-white/40">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye size={20} className="text-white/60" />
          <h3 className="text-base font-medium text-white">Proactive Agent</h3>
        </div>
        <button
          onClick={handleToggle}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            agentEnabled ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'
          }`}
        >
          {agentEnabled ? 'Enabled' : 'Disabled'}
        </button>
      </div>

      <p className="text-xs text-white/50">
        The proactive agent monitors files, disk space, and schedules to alert you before issues
        arise.
      </p>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BellRinging size={16} className="text-yellow-400" />
            <h4 className="text-sm font-medium text-white/80">Alerts ({alerts.length})</h4>
          </div>
          {alerts.map((a) => (
            <AlertItem key={a.id} alert={a} onDismiss={handleDismiss} />
          ))}
        </div>
      )}

      {/* File Watchers */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-white/80">File Watchers ({watchers.length})</h4>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1 text-xs text-white/40 hover:text-white/80"
          >
            <Plus size={14} />
            Add
          </button>
        </div>

        {showAddForm && (
          <div className="space-y-2 rounded-lg border border-white/10 bg-white/5 p-3">
            <input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Watcher name"
              className="w-full rounded bg-white/10 px-2 py-1 text-sm text-white placeholder-white/30"
            />
            <input
              value={formPath}
              onChange={(e) => setFormPath(e.target.value)}
              placeholder="Directory path"
              className="w-full rounded bg-white/10 px-2 py-1 text-sm text-white placeholder-white/30"
            />
            <input
              value={formPatterns}
              onChange={(e) => setFormPatterns(e.target.value)}
              placeholder="File patterns (comma-separated, e.g. .log,.tmp)"
              className="w-full rounded bg-white/10 px-2 py-1 text-sm text-white placeholder-white/30"
            />
            <input
              value={formAction}
              onChange={(e) => setFormAction(e.target.value)}
              placeholder="Suggested action"
              className="w-full rounded bg-white/10 px-2 py-1 text-sm text-white placeholder-white/30"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="rounded px-3 py-1 text-xs text-white/40 hover:text-white/80"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="rounded bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {watchers.map((w) => (
          <div
            key={w.id}
            className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3"
          >
            <div className="min-w-0 flex-1">
              <span className="text-sm font-medium text-white">{w.name}</span>
              <p className="text-xs text-white/50">{w.path}</p>
              {w.patterns.length > 0 && (
                <p className="text-xs text-white/40">Patterns: {w.patterns.join(', ')}</p>
              )}
            </div>
            <button
              onClick={() => removeWatcher(w.id)}
              className="ml-2 text-white/40 hover:text-red-400"
              title="Remove watcher"
            >
              <Trash size={14} />
            </button>
          </div>
        ))}

        {watchers.length === 0 && !showAddForm && (
          <p className="text-xs text-white/30">No file watchers configured.</p>
        )}
      </div>
    </div>
  );
}
