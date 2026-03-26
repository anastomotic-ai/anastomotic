'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Plus, Trash2, ArrowDown } from 'lucide-react';
import type { AgentRolePreset } from '@anastomotic_ai/agent-core/common';
import { ROLE_PROMPTS } from '@anastomotic_ai/agent-core/common';
import type { StepDraft } from './PipelineStepEditor';

const ROLE_META: Record<AgentRolePreset, { color: string; emoji: string }> = {
  researcher: { color: 'bg-blue-500/20 border-blue-500/40 text-blue-300', emoji: '🔍' },
  coder: { color: 'bg-green-500/20 border-green-500/40 text-green-300', emoji: '💻' },
  reviewer: { color: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300', emoji: '📝' },
  tester: { color: 'bg-purple-500/20 border-purple-500/40 text-purple-300', emoji: '🧪' },
  writer: { color: 'bg-pink-500/20 border-pink-500/40 text-pink-300', emoji: '✍️' },
  custom: { color: 'bg-gray-500/20 border-gray-500/40 text-gray-300', emoji: '⚙️' },
};

const ROLE_LABELS: { value: AgentRolePreset; label: string }[] = [
  { value: 'researcher', label: 'Researcher' },
  { value: 'coder', label: 'Coder' },
  { value: 'reviewer', label: 'Reviewer' },
  { value: 'tester', label: 'Tester' },
  { value: 'writer', label: 'Writer' },
  { value: 'custom', label: 'Custom' },
];

interface VisualPipelineBuilderProps {
  steps: StepDraft[];
  onChange: (steps: StepDraft[]) => void;
}

export function VisualPipelineBuilder({ steps, onChange }: VisualPipelineBuilderProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const addStep = useCallback(() => {
    const newStep: StepDraft = {
      role: 'coder',
      label: 'New Step',
      systemPrompt: ROLE_PROMPTS.coder ?? '',
      order: steps.length,
    };
    onChange([...steps, newStep]);
    setExpandedIndex(steps.length);
  }, [steps, onChange]);

  const removeStep = useCallback(
    (index: number) => {
      const next = steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i }));
      onChange(next);
      if (expandedIndex === index) {
        setExpandedIndex(null);
      }
    },
    [steps, onChange, expandedIndex],
  );

  const updateStep = useCallback(
    (index: number, patch: Partial<StepDraft>) => {
      const next = steps.map((s, i) => (i === index ? { ...s, ...patch } : s));
      onChange(next);
    },
    [steps, onChange],
  );

  const handleRoleChange = useCallback(
    (index: number, role: AgentRolePreset) => {
      const label =
        role === 'custom'
          ? steps[index].label
          : `${role.charAt(0).toUpperCase()}${role.slice(1)} Step`;
      const systemPrompt =
        role === 'custom' ? steps[index].systemPrompt : (ROLE_PROMPTS[role] ?? '');
      updateStep(index, { role, label, systemPrompt });
    },
    [steps, updateStep],
  );

  const handleReorder = useCallback(
    (reordered: StepDraft[]) => {
      onChange(reordered.map((s, i) => ({ ...s, order: i })));
    },
    [onChange],
  );

  return (
    <div ref={containerRef} className="space-y-1">
      <Reorder.Group axis="y" values={steps} onReorder={handleReorder} className="space-y-1">
        <AnimatePresence initial={false}>
          {steps.map((step, i) => {
            const meta = ROLE_META[step.role];
            const isExpanded = expandedIndex === i;

            return (
              <Reorder.Item key={`step-${step.order}-${i}`} value={step} className="list-none">
                <motion.div
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="relative"
                >
                  {/* Connector arrow */}
                  {i > 0 && (
                    <div className="flex justify-center py-1">
                      <ArrowDown className="h-4 w-4 text-white/20" />
                    </div>
                  )}

                  {/* Step card */}
                  <div
                    className={`rounded-xl border p-3 transition-colors cursor-grab active:cursor-grabbing ${meta.color}`}
                    onClick={() => setExpandedIndex(isExpanded ? null : i)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{meta.emoji}</span>
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider opacity-60">
                            Step {i + 1}
                          </span>
                          <div className="text-sm font-medium">{step.label || step.role}</div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeStep(i);
                        }}
                        className="rounded p-1 opacity-40 hover:opacity-100 hover:text-red-400"
                        title="Remove step"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Expanded editor */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div
                            className="mt-3 space-y-2 border-t border-white/10 pt-3"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex gap-2">
                              <select
                                value={step.role}
                                onChange={(e) =>
                                  handleRoleChange(i, e.target.value as AgentRolePreset)
                                }
                                className="rounded border border-white/20 bg-black/30 px-2 py-1 text-xs text-white"
                              >
                                {ROLE_LABELS.map((r) => (
                                  <option key={r.value} value={r.value}>
                                    {r.label}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="text"
                                value={step.label}
                                onChange={(e) => updateStep(i, { label: e.target.value })}
                                placeholder="Step label"
                                className="flex-1 rounded border border-white/20 bg-black/30 px-2 py-1 text-xs text-white placeholder-white/30"
                              />
                            </div>
                            {step.role === 'custom' && (
                              <textarea
                                value={step.systemPrompt}
                                onChange={(e) => updateStep(i, { systemPrompt: e.target.value })}
                                placeholder="Custom system prompt..."
                                rows={3}
                                className="w-full rounded border border-white/20 bg-black/30 px-2 py-1 text-xs text-white placeholder-white/30 resize-none"
                              />
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </Reorder.Item>
            );
          })}
        </AnimatePresence>
      </Reorder.Group>

      {/* Add step button */}
      <div className="flex justify-center pt-2">
        <button
          onClick={addStep}
          className="flex items-center gap-1.5 rounded-full border border-dashed border-white/20 px-4 py-2 text-xs text-white/50 hover:border-white/40 hover:text-white/80 transition"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Step
        </button>
      </div>
    </div>
  );
}
