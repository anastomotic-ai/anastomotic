/**
 * Multi-Agent Orchestration types.
 *
 * A Pipeline connects multiple agent "steps" that run in sequence.
 * Each step has a role name and a system-prompt tailored to that role.
 * The orchestrator feeds the output of step N into step N+1 automatically.
 */

/** Predefined agent roles with sensible defaults. */
export type AgentRolePreset = 'researcher' | 'coder' | 'reviewer' | 'tester' | 'writer' | 'custom';

/** A single step inside a pipeline. */
export interface PipelineStep {
  id: string;
  role: AgentRolePreset;
  /** Human-readable label for this step (e.g. "Research Phase"). */
  label: string;
  /**
   * Extra instructions appended to the system prompt for this step.
   * For 'custom' roles this is the entire role description.
   */
  systemPrompt: string;
  /** Order within the pipeline (0-based). */
  order: number;
}

/** Persisted pipeline definition. */
export interface Pipeline {
  id: string;
  name: string;
  description: string;
  steps: PipelineStep[];
  createdAt: string;
  updatedAt: string;
}

export interface PipelineCreateInput {
  name: string;
  description: string;
  steps: Omit<PipelineStep, 'id'>[];
}

export interface PipelineUpdateInput {
  name?: string;
  description?: string;
  steps?: Omit<PipelineStep, 'id'>[];
}

/** Runtime status for a single step execution. */
export type PipelineStepRunStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

/** Runtime state for an individual step. */
export interface PipelineStepRun {
  stepId: string;
  taskId: string | null;
  status: PipelineStepRunStatus;
  output: string;
  startedAt: string | null;
  completedAt: string | null;
}

/** Overall pipeline run status. */
export type PipelineRunStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

/** A single execution of a pipeline. */
export interface PipelineRun {
  id: string;
  pipelineId: string;
  /** The original user prompt that kicked off this run. */
  prompt: string;
  status: PipelineRunStatus;
  stepRuns: PipelineStepRun[];
  /** Index of the step currently executing (or -1 if not started). */
  currentStepIndex: number;
  createdAt: string;
  completedAt: string | null;
}

/** Default system-prompt fragments for preset roles. */
export const ROLE_PROMPTS: Record<Exclude<AgentRolePreset, 'custom'>, string> = {
  researcher:
    'You are a Research Agent. Your job is to gather information, search codebases, read documentation, and produce a structured research summary. Do NOT write or modify code — only research and report findings.',
  coder:
    'You are a Coding Agent. Using the research and context provided, implement the required changes. Write clean, tested code. Follow existing project conventions.',
  reviewer:
    'You are a Code Review Agent. Review the code changes for bugs, security issues, style violations, and potential improvements. Provide specific, actionable feedback.',
  tester:
    'You are a Testing Agent. Write comprehensive tests for the code changes. Cover edge cases, error paths, and integration scenarios. Run existing tests to verify nothing is broken.',
  writer:
    'You are a Documentation Agent. Write clear documentation, README updates, and inline comments for the changes made. Ensure docs match the actual implementation.',
};
