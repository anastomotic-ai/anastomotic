import { BrowserWindow } from 'electron';
import type { IpcMainInvokeEvent } from 'electron';
import {
  listPipelines,
  getPipeline,
  createPipeline,
  updatePipeline,
  deletePipeline,
  listPipelineRuns,
  getPipelineRun,
  deletePipelineRun,
  executePipelineRun,
  sanitizeString,
  validateTaskConfig,
  createMessageId,
} from '@anastomotic_ai/agent-core';
import type {
  PipelineCreateInput,
  PipelineUpdateInput,
  Pipeline,
  PipelineRun,
} from '@anastomotic_ai/agent-core/common';
import { getTaskManager } from '../../opencode';
import { getStorage } from '../../store/storage';
import * as workspaceManager from '../../store/workspaceManager';
import { createTaskCallbacks } from '../../ipc/task-callbacks';
import { handle, assertTrustedWindow } from './utils';
import { getLogCollector } from '../../logging';

export function registerOrchestrationHandlers(): void {
  // ── Pipeline CRUD ──────────────────────────────────────────────

  handle('pipeline:list', async (_event: IpcMainInvokeEvent): Promise<Pipeline[]> => {
    return listPipelines();
  });

  handle(
    'pipeline:get',
    async (_event: IpcMainInvokeEvent, id: string): Promise<Pipeline | null> => {
      return getPipeline(sanitizeString(id, 'pipelineId', 128));
    },
  );

  handle(
    'pipeline:create',
    async (_event: IpcMainInvokeEvent, input: PipelineCreateInput): Promise<Pipeline> => {
      if (!input.name || typeof input.name !== 'string') {
        throw new Error('Pipeline name is required');
      }
      if (!Array.isArray(input.steps) || input.steps.length === 0) {
        throw new Error('Pipeline must have at least one step');
      }
      return createPipeline({
        name: sanitizeString(input.name, 'name', 200),
        description: sanitizeString(input.description || '', 'description', 1000),
        steps: input.steps.map((s) => ({
          role: s.role,
          label: sanitizeString(s.label, 'stepLabel', 200),
          systemPrompt: sanitizeString(s.systemPrompt || '', 'systemPrompt', 2000),
          order: s.order,
        })),
      });
    },
  );

  handle(
    'pipeline:update',
    async (
      _event: IpcMainInvokeEvent,
      id: string,
      input: PipelineUpdateInput,
    ): Promise<Pipeline | null> => {
      return updatePipeline(sanitizeString(id, 'pipelineId', 128), input);
    },
  );

  handle('pipeline:delete', async (_event: IpcMainInvokeEvent, id: string): Promise<boolean> => {
    return deletePipeline(sanitizeString(id, 'pipelineId', 128));
  });

  // ── Pipeline Run ───────────────────────────────────────────────

  handle(
    'pipeline:run:list',
    async (_event: IpcMainInvokeEvent, pipelineId?: string): Promise<PipelineRun[]> => {
      return listPipelineRuns(pipelineId);
    },
  );

  handle(
    'pipeline:run:get',
    async (_event: IpcMainInvokeEvent, runId: string): Promise<PipelineRun | null> => {
      return getPipelineRun(sanitizeString(runId, 'runId', 128));
    },
  );

  handle(
    'pipeline:run:delete',
    async (_event: IpcMainInvokeEvent, runId: string): Promise<boolean> => {
      return deletePipelineRun(sanitizeString(runId, 'runId', 128));
    },
  );

  handle(
    'pipeline:run:start',
    async (event: IpcMainInvokeEvent, pipelineId: string, prompt: string): Promise<PipelineRun> => {
      const window = assertTrustedWindow(BrowserWindow.fromWebContents(event.sender));
      const sender = event.sender;
      const taskManager = getTaskManager();
      const storage = getStorage();

      const pipeline = getPipeline(sanitizeString(pipelineId, 'pipelineId', 128));
      if (!pipeline) {
        throw new Error('Pipeline not found');
      }

      const validatedPrompt = sanitizeString(prompt, 'prompt');
      const workingDir = process.env.HOME || process.env.USERPROFILE || '.';

      // Notify the renderer that a pipeline run is starting
      sender.send('pipeline:run:status', { pipelineId, status: 'running' });

      // Build task runner that integrates with the existing TaskManager
      const runner = {
        async runTask(params: {
          taskId: string;
          prompt: string;
          systemPromptAppend: string;
          workingDirectory?: string;
        }): Promise<{ status: 'success' | 'error' | 'interrupted'; output: string }> {
          return new Promise((resolve) => {
            const config = validateTaskConfig({
              prompt: params.prompt,
              systemPromptAppend: params.systemPromptAppend,
              workingDirectory: params.workingDirectory || workingDir,
            });

            const activeModel = storage.getActiveProviderModel();
            const selectedModel = activeModel || storage.getSelectedModel();
            if (selectedModel?.model) {
              config.modelId = selectedModel.model;
            }

            let output = '';
            const callbacks = createTaskCallbacks({ taskId: params.taskId, window, sender });

            // Wrap onComplete to capture output and resolve
            const originalOnComplete = callbacks.onComplete;
            callbacks.onComplete = (result) => {
              originalOnComplete(result);
              resolve({
                status: result.status,
                output: output || `Task completed with status: ${result.status}`,
              });
            };

            // Capture assistant messages as output
            const originalOnBatchedMessages = callbacks.onBatchedMessages;
            callbacks.onBatchedMessages = (messages) => {
              if (originalOnBatchedMessages) {
                originalOnBatchedMessages(messages);
              }
              for (const msg of messages) {
                if (msg.type === 'assistant' && msg.content) {
                  output += msg.content + '\n';
                }
              }
            };

            // Wrap onError to resolve with failure
            const originalOnError = callbacks.onError;
            callbacks.onError = (error) => {
              originalOnError(error);
              resolve({ status: 'error', output: error.message });
            };

            const userMessage = {
              id: createMessageId(),
              type: 'user' as const,
              content: params.prompt,
              timestamp: new Date().toISOString(),
            };

            void taskManager
              .startTask(params.taskId, config, callbacks)
              .then((task) => {
                task.messages = [userMessage];
                storage.saveTask(task, workspaceManager.getActiveWorkspace());
              })
              .catch((err) => {
                resolve({
                  status: 'error',
                  output: err instanceof Error ? err.message : String(err),
                });
              });
          });
        },
      };

      const orchestratorCallbacks = {
        onStepStart: (runId: string, stepIndex: number, stepLabel: string) => {
          if (!window.isDestroyed() && !sender.isDestroyed()) {
            sender.send('pipeline:run:step', { runId, stepIndex, stepLabel, status: 'running' });
          }
        },
        onStepComplete: (runId: string, stepIndex: number, stepLabel: string) => {
          if (!window.isDestroyed() && !sender.isDestroyed()) {
            sender.send('pipeline:run:step', { runId, stepIndex, stepLabel, status: 'completed' });
          }
        },
        onStepFailed: (runId: string, stepIndex: number, stepLabel: string, error: string) => {
          if (!window.isDestroyed() && !sender.isDestroyed()) {
            sender.send('pipeline:run:step', {
              runId,
              stepIndex,
              stepLabel,
              status: 'failed',
              error,
            });
          }
        },
        onRunComplete: (runId: string, status: string) => {
          if (!window.isDestroyed() && !sender.isDestroyed()) {
            sender.send('pipeline:run:status', { pipelineId, runId, status });
          }
        },
      };

      // Launch execution — the orchestrator creates the run and returns it
      // We kick off async execution and return the first snapshot
      const initialRun = await new Promise<PipelineRun>((resolve, reject) => {
        let resolved = false;

        const wrappedCallbacks = {
          ...orchestratorCallbacks,
          onStepStart: (runId: string, stepIndex: number, stepLabel: string) => {
            orchestratorCallbacks.onStepStart(runId, stepIndex, stepLabel);
          },
          onRunComplete: (runId: string, status: string) => {
            orchestratorCallbacks.onRunComplete(runId, status);
          },
        };

        executePipelineRun(pipeline, validatedPrompt, runner, wrappedCallbacks, workingDir)
          .then((finalRun) => {
            if (!resolved) {
              resolved = true;
              resolve(finalRun);
            }
          })
          .catch((err) => {
            if (!resolved) {
              resolved = true;
              reject(err);
            }
            const collector = getLogCollector();
            collector?.log?.('ERROR', 'ipc', `Pipeline run failed: ${String(err)}`);
          });

        // Give the orchestrator a chance to create the run and start the first step,
        // then return the run ID. If the pipeline completes very quickly (< 200ms)
        // the promise above will resolve first.
        setTimeout(() => {
          if (!resolved) {
            // The run hasn't completed yet — look up the latest run for this pipeline
            const runs = listPipelineRuns(pipeline.id);
            if (runs.length > 0) {
              resolved = true;
              resolve(runs[0]);
            }
          }
        }, 200);
      });

      return initialRun;
    },
  );
}
