'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { getAnastomotic } from '@/lib/anastomotic';
import type { ScheduledTask } from '@anastomotic_ai/agent-core/common';

const CRON_PRESETS = [
  { label: 'Every hour', cron: '0 * * * *' },
  { label: 'Daily at 9 AM', cron: '0 9 * * *' },
  { label: 'Weekdays at 9 AM', cron: '0 9 * * 1-5' },
  { label: 'Every Monday at 9 AM', cron: '0 9 * * 1' },
  { label: 'Every 6 hours', cron: '0 */6 * * *' },
];

export function SchedulePanel() {
  const api = useMemo(() => getAnastomotic(), []);
  const [schedules, setSchedules] = useState<ScheduledTask[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [cronInput, setCronInput] = useState('0 9 * * *');
  const [promptInput, setPromptInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadSchedules = useCallback(async () => {
    try {
      const list = await api.listSchedules();
      setSchedules(list);
    } catch {
      setError('Failed to load schedules');
    }
  }, [api]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSchedules();
  }, [loadSchedules]);

  const handleCreate = useCallback(async () => {
    if (!cronInput.trim() || !promptInput.trim()) {
      return;
    }
    setError(null);
    try {
      await api.createSchedule(cronInput.trim(), promptInput.trim());
      setCronInput('0 9 * * *');
      setPromptInput('');
      setShowAddForm(false);
      await loadSchedules();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create schedule');
    }
  }, [api, cronInput, promptInput, loadSchedules]);

  const handleCancel = useCallback(
    async (id: string) => {
      try {
        await api.cancelSchedule(id);
        await loadSchedules();
      } catch {
        setError('Failed to cancel schedule');
      }
    },
    [api, loadSchedules],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-foreground">Scheduled Tasks</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Automate recurring tasks with cron expressions
          </p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Schedule
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      {showAddForm && (
        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Cron Expression
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={cronInput}
                onChange={(e) => setCronInput(e.target.value)}
                placeholder="0 9 * * *"
                className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {CRON_PRESETS.map((preset) => (
                <button
                  key={preset.cron}
                  onClick={() => setCronInput(preset.cron)}
                  className={`rounded-md px-2 py-1 text-xs transition-colors ${
                    cronInput === preset.cron
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Task Prompt</label>
            <textarea
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="Describe the task to run on this schedule..."
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setShowAddForm(false);
                setError(null);
              }}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!cronInput.trim() || !promptInput.trim()}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Create Schedule
            </button>
          </div>
        </div>
      )}

      {schedules.length === 0 && !showAddForm && (
        <div className="rounded-lg border border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">No scheduled tasks yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Create a schedule to automate recurring tasks
          </p>
        </div>
      )}

      {schedules.length > 0 && (
        <div className="space-y-2">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="rounded-lg border border-border bg-card p-3 flex items-start justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{schedule.prompt}</p>
                <div className="flex items-center gap-3 mt-1">
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                    {schedule.cron}
                  </code>
                  <span
                    className={`text-xs ${schedule.enabled ? 'text-green-500' : 'text-muted-foreground'}`}
                  >
                    {schedule.enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
                {schedule.nextRunAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Next: {new Date(schedule.nextRunAt).toLocaleString()}
                  </p>
                )}
                {schedule.lastRunAt && (
                  <p className="text-xs text-muted-foreground">
                    Last: {new Date(schedule.lastRunAt).toLocaleString()}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleCancel(schedule.id)}
                className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                title="Remove schedule"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
