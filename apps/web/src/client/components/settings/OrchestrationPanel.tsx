'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Trash2, Play } from 'lucide-react';
import { getAnastomotic } from '@/lib/anastomotic';
import type { Pipeline, PipelineRun } from '@anastomotic_ai/agent-core/common';
import { PipelineStepEditor, type StepDraft } from './PipelineStepEditor';

export function OrchestrationPanel() {
  const api = useMemo(() => getAnastomotic(), []);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<StepDraft[]>([]);
  const [runPrompt, setRunPrompt] = useState('');
  const [selectedPipeline, setSelectedPipeline] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [p, r] = await Promise.all([api.listPipelines(), api.listPipelineRuns()]);
      setPipelines(p);
      setRuns(r);
    } catch {
      setError('Failed to load pipelines');
    }
  }, [api]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  // Subscribe to pipeline run status events
  useEffect(() => {
    const unsub = api.onPipelineRunStatus?.(() => {
      loadData();
    });
    return () => unsub?.();
  }, [api, loadData]);

  const handleCreate = useCallback(async () => {
    if (!name.trim() || steps.length === 0) {
      return;
    }
    setError(null);
    try {
      await api.createPipeline({
        name: name.trim(),
        description: description.trim(),
        steps: steps.map((s, i) => ({ ...s, order: i })),
      });
      setName('');
      setDescription('');
      setSteps([]);
      setShowForm(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create pipeline');
    }
  }, [api, name, description, steps, loadData]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await api.deletePipeline(id);
        await loadData();
      } catch {
        setError('Failed to delete pipeline');
      }
    },
    [api, loadData],
  );

  const handleRun = useCallback(async () => {
    if (!selectedPipeline || !runPrompt.trim()) {
      return;
    }
    setError(null);
    try {
      await api.startPipelineRun(selectedPipeline, runPrompt.trim());
      setRunPrompt('');
      setSelectedPipeline(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start pipeline run');
    }
  }, [api, selectedPipeline, runPrompt, loadData]);

  const recentRuns = runs.slice(0, 5);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Create multi-step agent pipelines where each step&apos;s output feeds into the next.
      </p>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Pipeline list */}
      <div className="space-y-2">
        {pipelines.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-4 py-3"
          >
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{p.name}</div>
              <div className="text-xs text-muted-foreground">
                {p.steps.length} step{p.steps.length !== 1 ? 's' : ''} &middot;{' '}
                {p.steps.map((s) => s.role).join(' → ')}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSelectedPipeline(selectedPipeline === p.id ? null : p.id)}
                className="rounded p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10"
                title="Run pipeline"
              >
                <Play className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                className="rounded p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                title="Delete pipeline"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {pipelines.length === 0 && !showForm && (
          <p className="text-sm text-muted-foreground italic">No pipelines yet.</p>
        )}
      </div>

      {/* Run prompt input */}
      {selectedPipeline && (
        <div className="flex gap-2">
          <input
            type="text"
            value={runPrompt}
            onChange={(e) => setRunPrompt(e.target.value)}
            placeholder="Enter a prompt for the pipeline..."
            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleRun();
              }
            }}
          />
          <button
            onClick={handleRun}
            disabled={!runPrompt.trim()}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            Run
          </button>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="space-y-3 rounded-lg border border-border bg-muted/10 p-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Pipeline name"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          <PipelineStepEditor steps={steps} onChange={setSteps} />
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleCreate}
              disabled={!name.trim() || steps.length === 0}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Create
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setSteps([]);
                setName('');
                setDescription('');
              }}
              className="rounded-md px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30"
        >
          <Plus className="h-4 w-4" />
          New Pipeline
        </button>
      )}

      {/* Recent runs */}
      {recentRuns.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium uppercase text-muted-foreground">Recent Runs</h4>
          {recentRuns.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
            >
              <span className="truncate text-muted-foreground">{r.prompt}</span>
              <span
                className={
                  r.status === 'completed'
                    ? 'text-green-500'
                    : r.status === 'failed'
                      ? 'text-destructive'
                      : 'text-yellow-500'
                }
              >
                {r.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
