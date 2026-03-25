import type {
  Pipeline,
  PipelineRun,
  PipelineStepRun,
  PipelineStepRunStatus,
  PipelineRunStatus,
} from '../common/types/orchestration.js';
import { ROLE_PROMPTS } from '../common/types/orchestration.js';
import {
  createPipelineRun,
  updatePipelineRun,
  getPipelineRun,
} from '../storage/repositories/pipelines.js';
import { createTaskId } from '../common/utils/id.js';

/** Minimal interface that callers must provide to let the orchestrator start tasks. */
export interface OrchestratorTaskRunner {
  /**
   * Start a task and return once it completes (or fails).
   * Returns the concatenated assistant output for the task.
   */
  runTask(params: {
    taskId: string;
    prompt: string;
    systemPromptAppend: string;
    workingDirectory?: string;
  }): Promise<{ status: 'success' | 'error' | 'interrupted'; output: string }>;
}

export interface OrchestratorCallbacks {
  onStepStart?: (runId: string, stepIndex: number, stepLabel: string) => void;
  onStepComplete?: (runId: string, stepIndex: number, stepLabel: string, output: string) => void;
  onStepFailed?: (runId: string, stepIndex: number, stepLabel: string, error: string) => void;
  onRunComplete?: (runId: string, status: PipelineRunStatus) => void;
}

/**
 * Execute a pipeline run: iterate over steps sequentially, feed each step's
 * output into the next step's prompt as context.
 */
export async function executePipelineRun(
  pipeline: Pipeline,
  prompt: string,
  runner: OrchestratorTaskRunner,
  callbacks?: OrchestratorCallbacks,
  workingDirectory?: string,
): Promise<PipelineRun> {
  // Sort steps by order
  const steps = [...pipeline.steps].sort((a, b) => a.order - b.order);

  // Initialise step runs
  const initialStepRuns: PipelineStepRun[] = steps.map((step) => ({
    stepId: step.id,
    taskId: null,
    status: 'pending' as PipelineStepRunStatus,
    output: '',
    startedAt: null,
    completedAt: null,
  }));

  // Persist the run
  let run = createPipelineRun(pipeline.id, prompt, initialStepRuns);
  updatePipelineRun(run.id, { status: 'running', currentStepIndex: 0 });

  let accumulatedContext = '';

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const stepRuns = [...run.stepRuns];
    const taskId = createTaskId();

    // Mark step as running
    stepRuns[i] = {
      ...stepRuns[i],
      taskId,
      status: 'running',
      startedAt: new Date().toISOString(),
    };
    run = updatePipelineRun(run.id, { stepRuns, currentStepIndex: i }) ?? run;

    callbacks?.onStepStart?.(run.id, i, step.label);

    // Build the system prompt for this step's role
    const rolePrompt =
      step.role === 'custom'
        ? step.systemPrompt
        : `${ROLE_PROMPTS[step.role]}\n\n${step.systemPrompt}`.trim();

    // Build the full prompt: original user request + accumulated context from prior steps
    let fullPrompt = prompt;
    if (accumulatedContext) {
      fullPrompt = `## Original Request\n${prompt}\n\n## Context from Previous Steps\n${accumulatedContext}`;
    }

    try {
      const result = await runner.runTask({
        taskId,
        prompt: fullPrompt,
        systemPromptAppend: rolePrompt,
        workingDirectory,
      });

      if (result.status === 'success') {
        stepRuns[i] = {
          ...stepRuns[i],
          status: 'completed',
          output: result.output,
          completedAt: new Date().toISOString(),
        };
        accumulatedContext += `\n\n### ${step.label} (${step.role})\n${result.output}`;
        callbacks?.onStepComplete?.(run.id, i, step.label, result.output);
      } else {
        stepRuns[i] = {
          ...stepRuns[i],
          status: 'failed',
          output: result.output || `Step failed with status: ${result.status}`,
          completedAt: new Date().toISOString(),
        };

        // Mark remaining steps as skipped
        for (let j = i + 1; j < steps.length; j++) {
          stepRuns[j] = { ...stepRuns[j], status: 'skipped' };
        }

        run =
          updatePipelineRun(run.id, {
            status: 'failed',
            stepRuns,
            currentStepIndex: i,
            completedAt: new Date().toISOString(),
          }) ?? run;

        callbacks?.onStepFailed?.(run.id, i, step.label, result.output);
        callbacks?.onRunComplete?.(run.id, 'failed');
        return getPipelineRun(run.id) ?? run;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      stepRuns[i] = {
        ...stepRuns[i],
        status: 'failed',
        output: errorMsg,
        completedAt: new Date().toISOString(),
      };

      for (let j = i + 1; j < steps.length; j++) {
        stepRuns[j] = { ...stepRuns[j], status: 'skipped' };
      }

      run =
        updatePipelineRun(run.id, {
          status: 'failed',
          stepRuns,
          currentStepIndex: i,
          completedAt: new Date().toISOString(),
        }) ?? run;

      callbacks?.onStepFailed?.(run.id, i, step.label, errorMsg);
      callbacks?.onRunComplete?.(run.id, 'failed');
      return getPipelineRun(run.id) ?? run;
    }

    // Persist step progress
    run = updatePipelineRun(run.id, { stepRuns }) ?? run;
  }

  // All steps completed successfully
  run =
    updatePipelineRun(run.id, {
      status: 'completed',
      completedAt: new Date().toISOString(),
    }) ?? run;

  callbacks?.onRunComplete?.(run.id, 'completed');
  return getPipelineRun(run.id) ?? run;
}
