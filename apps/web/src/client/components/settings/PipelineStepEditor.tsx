'use client';

import { Plus, Trash2, GripVertical } from 'lucide-react';
import type { AgentRolePreset } from '@anastomotic_ai/agent-core/common';
import { ROLE_PROMPTS } from '@anastomotic_ai/agent-core/common';

export interface StepDraft {
  role: AgentRolePreset;
  label: string;
  systemPrompt: string;
  order: number;
}

const ROLE_OPTIONS: { value: AgentRolePreset; label: string }[] = [
  { value: 'researcher', label: 'Researcher' },
  { value: 'coder', label: 'Coder' },
  { value: 'reviewer', label: 'Reviewer' },
  { value: 'tester', label: 'Tester' },
  { value: 'writer', label: 'Writer' },
  { value: 'custom', label: 'Custom' },
];

interface PipelineStepEditorProps {
  steps: StepDraft[];
  onChange: (steps: StepDraft[]) => void;
}

export function PipelineStepEditor({ steps, onChange }: PipelineStepEditorProps) {
  const addStep = () => {
    onChange([...steps, { role: 'coder', label: '', systemPrompt: '', order: steps.length }]);
  };

  const removeStep = (index: number) => {
    const next = steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i }));
    onChange(next);
  };

  const updateStep = (index: number, patch: Partial<StepDraft>) => {
    const next = steps.map((s, i) => (i === index ? { ...s, ...patch } : s));
    onChange(next);
  };

  const handleRoleChange = (index: number, role: AgentRolePreset) => {
    const label =
      role === 'custom'
        ? steps[index].label
        : `${role.charAt(0).toUpperCase()}${role.slice(1)} Step`;
    const systemPrompt = role === 'custom' ? steps[index].systemPrompt : (ROLE_PROMPTS[role] ?? '');
    updateStep(index, { role, label, systemPrompt });
  };

  return (
    <div className="space-y-3">
      {steps.map((step, i) => (
        <div
          key={i}
          className="flex items-start gap-2 rounded-lg border border-border bg-muted/20 p-3"
        >
          <GripVertical className="mt-2 h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="flex-1 space-y-2">
            <div className="flex gap-2">
              <select
                value={step.role}
                onChange={(e) => handleRoleChange(i, e.target.value as AgentRolePreset)}
                className="rounded-md border border-border bg-background px-2 py-1 text-sm"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={step.label}
                onChange={(e) => updateStep(i, { label: e.target.value })}
                placeholder="Step label..."
                className="flex-1 rounded-md border border-border bg-background px-2 py-1 text-sm"
              />
            </div>
            {step.role === 'custom' && (
              <textarea
                value={step.systemPrompt}
                onChange={(e) => updateStep(i, { systemPrompt: e.target.value })}
                placeholder="Custom system prompt for this step..."
                rows={2}
                className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm resize-none"
              />
            )}
          </div>
          <button
            onClick={() => removeStep(i)}
            className="mt-1 rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}

      <button
        onClick={addStep}
        className="flex items-center gap-1.5 rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30"
      >
        <Plus className="h-4 w-4" />
        Add Step
      </button>
    </div>
  );
}
