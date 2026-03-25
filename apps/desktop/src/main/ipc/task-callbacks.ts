import { BrowserWindow } from 'electron';
import type {
  TaskMessage,
  TaskResult,
  TaskStatus,
  TodoItem,
  BrowserFramePayload,
} from '@anastomotic_ai/agent-core';
import {
  mapResultToStatus,
  addCostRecord,
  getAutoLearnEnabled,
  getTaskWorkspaceId,
  extractInsight,
  createKnowledgeNote,
  listKnowledgeNotes,
} from '@anastomotic_ai/agent-core';
import { getTaskManager, recoverDevBrowserServer } from '../opencode';
import type { TaskCallbacks } from '../opencode';
import { getStorage } from '../store/storage';
import { getApiKey } from '../store/secureStorage';
import { updateTray } from '../tray';
import { stopBrowserPreviewStream } from '../services/browserPreview';
import { notifyTaskCompletion } from '../services/task-notification';
import { getLogCollector } from '../logging';

const DEV_BROWSER_TOOL_PREFIXES = ['dev-browser-mcp_', 'dev_browser_mcp_', 'browser_'];
const BROWSER_FAILURE_WINDOW_MS = 12000;
const BROWSER_FAILURE_THRESHOLD = 2;
const BROWSER_CONNECTION_ERROR_PATTERNS = [
  /fetch failed/i,
  /\bECONNREFUSED\b/i,
  /\bECONNRESET\b/i,
  /\bUND_ERR\b/i,
  /socket hang up/i,
  /\bwebsocket\b/i,
  /browserType\.connectOverCDP/i,
  /Target closed/i,
  /Session closed/i,
  /Page closed/i,
];

function isDevBrowserToolCall(toolName: string): boolean {
  return DEV_BROWSER_TOOL_PREFIXES.some((prefix) => toolName.startsWith(prefix));
}

function isBrowserConnectionFailure(output: string): boolean {
  // Guard against false positives from successful outputs that mention words
  // like "WebSocket" while not being an actual error.
  const isExplicitErrorOutput = /^\s*Error:/i.test(output) || /"isError"\s*:\s*true/.test(output);
  if (!isExplicitErrorOutput) {
    return false;
  }

  return BROWSER_CONNECTION_ERROR_PATTERNS.some((pattern) => pattern.test(output));
}

const MAX_AUTO_NOTES = 20;

async function tryAutoLearn(taskId: string, storage: ReturnType<typeof getStorage>): Promise<void> {
  try {
    if (!getAutoLearnEnabled()) {
      return;
    }

    const workspaceId = getTaskWorkspaceId(taskId);
    if (!workspaceId) {
      return;
    }

    const existingNotes = listKnowledgeNotes(workspaceId);
    if (existingNotes.length >= MAX_AUTO_NOTES) {
      return;
    }

    const task = storage.getTask(taskId);
    if (!task || task.messages.length < 3) {
      return;
    }

    const insight = await extractInsight(task.prompt, task.messages, getApiKey);
    if (!insight) {
      return;
    }

    // Check for duplicate content
    const isDuplicate = existingNotes.some(
      (note) => note.content.toLowerCase() === insight.content.toLowerCase(),
    );
    if (isDuplicate) {
      return;
    }

    createKnowledgeNote({ ...insight, workspaceId });
  } catch (error) {
    try {
      const l = getLogCollector();
      if (l?.log) {
        l.log('WARN', 'ipc', '[AutoLearn] Failed to extract insight', {
          taskId,
          error: String(error),
        });
      }
    } catch (_e) {
      /* best-effort logging */
    }
  }
}

export interface TaskCallbacksOptions {
  taskId: string;
  window: BrowserWindow;
  sender: Electron.WebContents;
}

export function createTaskCallbacks(options: TaskCallbacksOptions): TaskCallbacks {
  const { taskId, window, sender } = options;

  const storage = getStorage();
  const taskManager = getTaskManager();
  let browserFailureCount = 0;
  let browserFailureWindowStart = 0;
  let browserRecoveryInFlight = false;
  let hasRendererSendFailure = false;

  const forwardToRenderer = (channel: string, data: unknown) => {
    if (hasRendererSendFailure) {
      return;
    }
    if (window.isDestroyed() || sender.isDestroyed()) {
      return;
    }
    try {
      sender.send(channel, data);
    } catch (error) {
      hasRendererSendFailure = true;
      const errorMessage = error instanceof Error ? error.message : String(error);
      try {
        const l = getLogCollector();
        if (l?.log) {
          l.log('ERROR', 'ipc', '[TaskCallbacks] Failed to send IPC event to renderer', {
            taskId,
            channel,
            error: errorMessage,
          });
        }
      } catch (_e) {
        /* best-effort logging */
      }
    }
  };

  const resetBrowserFailureState = () => {
    browserFailureCount = 0;
    browserFailureWindowStart = 0;
  };

  return {
    onBatchedMessages: (messages: TaskMessage[]) => {
      forwardToRenderer('task:update:batch', { taskId, messages });
      for (const msg of messages) {
        storage.addTaskMessage(taskId, msg);
      }
    },

    onProgress: (progress: { stage: string; message?: string }) => {
      forwardToRenderer('task:progress', {
        taskId,
        ...progress,
      });
    },

    onPermissionRequest: (request: unknown) => {
      forwardToRenderer('permission:request', request);
    },

    onComplete: (result: TaskResult) => {
      forwardToRenderer('task:update', {
        taskId,
        type: 'complete',
        result,
      });

      // Stop any active browser preview stream when the task completes.
      // Contributed by Dev0907 (PR #480) for ENG-695.
      void stopBrowserPreviewStream(taskId);

      const taskStatus = mapResultToStatus(result);
      storage.updateTaskStatus(taskId, taskStatus, new Date().toISOString());

      const sessionId = result.sessionId || taskManager.getSessionId(taskId);
      if (sessionId) {
        storage.updateTaskSessionId(taskId, sessionId);
      }

      if (result.status === 'success') {
        storage.clearTodosForTask(taskId);
      }

      if (result.status !== 'interrupted') {
        notifyTaskCompletion(window, storage, {
          status: result.status === 'success' ? 'success' : 'error',
          label: taskId.slice(0, 8),
        });
      }

      // Auto-learn: extract insights from successful tasks
      if (result.status === 'success') {
        void tryAutoLearn(taskId, storage);
      }
    },

    onError: (error: Error) => {
      forwardToRenderer('task:update', {
        taskId,
        type: 'error',
        error: error.message,
      });

      // Stop any active browser preview stream on task error.
      // Contributed by Dev0907 (PR #480) for ENG-695.
      void stopBrowserPreviewStream(taskId);

      storage.updateTaskStatus(taskId, 'failed', new Date().toISOString());
      notifyTaskCompletion(window, storage, {
        status: 'error',
        label: `Task ${taskId.slice(0, 8)} failed`,
      });
    },

    onDebug: (log: { type: string; message: string; data?: unknown }) => {
      if (storage.getDebugMode()) {
        forwardToRenderer('debug:log', {
          taskId,
          timestamp: new Date().toISOString(),
          ...log,
        });
      }
    },

    onStatusChange: (status: TaskStatus) => {
      forwardToRenderer('task:status-change', {
        taskId,
        status,
      });
      storage.updateTaskStatus(taskId, status, new Date().toISOString());
    },

    onTodoUpdate: (todos: TodoItem[]) => {
      storage.saveTodosForTask(taskId, todos);
      forwardToRenderer('todo:update', { taskId, todos });
    },

    onAuthError: (error: { providerId: string; message: string }) => {
      forwardToRenderer('auth:error', error);
    },

    /**
     * Forward browser preview frames to the renderer.
     * Dev-browser-mcp writes JSON frame lines to stdout; OpenCodeAdapter parses them
     * and emits 'browser-frame' events that reach here via TaskManager.
     *
     * Contributed by samarthsinh2660 (PR #414) for ENG-695.
     */
    onBrowserFrame: (data: BrowserFramePayload) => {
      forwardToRenderer('browser:frame', {
        taskId,
        ...data,
      });
    },

    onStepFinish: (data) => {
      if (data.cost != null && data.model) {
        const slashIdx = data.model.indexOf('/');
        const provider = slashIdx > 0 ? data.model.slice(0, slashIdx) : 'unknown';
        const model = slashIdx > 0 ? data.model.slice(slashIdx + 1) : data.model;
        try {
          addCostRecord({
            taskId,
            provider,
            model,
            inputTokens: data.tokens?.input ?? 0,
            outputTokens: data.tokens?.output ?? 0,
            costUsd: data.cost,
          });
        } catch (_e) {
          /* best-effort — don't break task flow */
        }
      }
    },

    onToolCallComplete: ({ toolName, toolOutput }) => {
      if (!isDevBrowserToolCall(toolName)) {
        return;
      }

      if (!isBrowserConnectionFailure(toolOutput)) {
        resetBrowserFailureState();
        return;
      }

      const now = Date.now();
      if (
        browserFailureWindowStart === 0 ||
        now - browserFailureWindowStart > BROWSER_FAILURE_WINDOW_MS
      ) {
        browserFailureWindowStart = now;
        browserFailureCount = 1;
      } else {
        browserFailureCount += 1;
      }

      if (browserFailureCount < BROWSER_FAILURE_THRESHOLD || browserRecoveryInFlight) {
        return;
      }

      browserRecoveryInFlight = true;
      const reason = `Detected repeated browser connection failures (${browserFailureCount} in ${Math.ceil(
        (now - browserFailureWindowStart) / 1000,
      )}s). Reconnecting browser...`;

      try {
        const l = getLogCollector();
        if (l?.log) {
          l.log('WARN', 'ipc', `[TaskCallbacks] ${reason}`);
        }
      } catch (_e) {
        /* best-effort logging */
      }

      void recoverDevBrowserServer(
        {
          onProgress: (progress) => {
            forwardToRenderer('task:progress', {
              taskId,
              ...progress,
            });
          },
        },
        { reason },
      )
        .catch((error) => {
          const errorMessage = error instanceof Error ? error.message : String(error);
          try {
            const l = getLogCollector();
            if (l?.log) {
              l.log('WARN', 'ipc', `[TaskCallbacks] Browser recovery failed: ${errorMessage}`);
            }
          } catch (_e) {
            /* best-effort logging */
          }
          if (storage.getDebugMode()) {
            forwardToRenderer('debug:log', {
              taskId,
              timestamp: new Date().toISOString(),
              type: 'warning',
              message: `Browser recovery failed: ${errorMessage}`,
            });
          }
        })
        .finally(() => {
          browserRecoveryInFlight = false;
          resetBrowserFailureState();
        });
    },
  };
}

// ── Daemon Task Callbacks (SaaiAravindhRaja / ChaiAndCode — PR #613) ───────────

export interface DaemonTaskCallbacksOptions {
  taskId: string;
  getWindow?: () => BrowserWindow | null;
}

export function createDaemonTaskCallbacks(options: DaemonTaskCallbacksOptions): TaskCallbacks {
  const { taskId, getWindow } = options;

  const storage = getStorage();
  const taskManager = getTaskManager();

  const forwardToRenderer = (channel: string, data: unknown) => {
    const win = getWindow?.() ?? BrowserWindow.getAllWindows()[0];
    if (!win || win.isDestroyed()) {
      return;
    }
    try {
      if (!win.webContents.isDestroyed()) {
        win.webContents.send(channel, data);
      }
    } catch {
      // Window or webContents torn down between check and send — safe to ignore
    }
  };

  return {
    onBatchedMessages: (messages: TaskMessage[]) => {
      forwardToRenderer('task:update:batch', { taskId, messages });
      for (const msg of messages) {
        storage.addTaskMessage(taskId, msg);
      }
    },

    onProgress: (progress: { stage: string; message?: string }) => {
      forwardToRenderer('task:progress', { taskId, ...progress });
    },

    onPermissionRequest: (request: unknown) => {
      forwardToRenderer('permission:request', request);
    },

    onComplete: (result: TaskResult) => {
      forwardToRenderer('task:update', { taskId, type: 'complete', result });

      const taskStatus = mapResultToStatus(result);
      storage.updateTaskStatus(taskId, taskStatus, new Date().toISOString());

      const sessionId = result.sessionId || taskManager.getSessionId(taskId);
      if (sessionId) {
        storage.updateTaskSessionId(taskId, sessionId);
      }

      if (result.status === 'success') {
        storage.clearTodosForTask(taskId);
      }

      if (result.status !== 'interrupted') {
        const win = getWindow?.() ?? BrowserWindow.getAllWindows()[0];
        if (win) {
          notifyTaskCompletion(win, storage, {
            status: result.status === 'success' ? 'success' : 'error',
            label: `Task ${taskId.slice(0, 8)}`,
          });
        }
      }

      updateTray();
    },

    onError: (error: Error) => {
      forwardToRenderer('task:update', { taskId, type: 'error', error: error.message });
      storage.updateTaskStatus(taskId, 'failed', new Date().toISOString());
      const win = getWindow?.() ?? BrowserWindow.getAllWindows()[0];
      if (win) {
        notifyTaskCompletion(win, storage, {
          status: 'error',
          label: `Task ${taskId.slice(0, 8)} failed`,
        });
      }
      updateTray();
    },

    onDebug: (log: { type: string; message: string; data?: unknown }) => {
      if (storage.getDebugMode()) {
        forwardToRenderer('debug:log', { taskId, timestamp: new Date().toISOString(), ...log });
      }
    },

    onStatusChange: (status: TaskStatus) => {
      forwardToRenderer('task:status-change', { taskId, status });
      storage.updateTaskStatus(taskId, status, new Date().toISOString());
      updateTray();
    },

    onTodoUpdate: (todos: TodoItem[]) => {
      storage.saveTodosForTask(taskId, todos);
      forwardToRenderer('todo:update', { taskId, todos });
    },

    onAuthError: (error: { providerId: string; message: string }) => {
      forwardToRenderer('auth:error', error);
    },
  };
}
