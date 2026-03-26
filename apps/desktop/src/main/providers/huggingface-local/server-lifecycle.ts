/**
 * Server lifecycle management for the HuggingFace Local inference server.
 */

import http from 'http';
import { getStorage } from '../../store/storage';
import { getLogCollector } from '../../logging';
import {
  state,
  startServerPromise,
  setStartServerPromise,
  loadModelPromise,
  activeGenerations,
} from './server-state';
import { loadModel } from './model-loader';
import { createRequestHandler } from './http-handler';

export async function startServer(
  modelId: string,
): Promise<{ success: boolean; port?: number; error?: string }> {
  if (startServerPromise) {
    await startServerPromise;
    if (state.loadedModelId === modelId && state.port !== null) {
      return { success: true, port: state.port };
    }
    return startServer(modelId);
  }
  const promise = _startServerImpl(modelId).finally(() => {
    setStartServerPromise(null);
  });
  setStartServerPromise(promise);
  return promise;
}

async function _startServerImpl(
  modelId: string,
): Promise<{ success: boolean; port?: number; error?: string }> {
  if (state.server) {
    try {
      await loadModel(modelId);
      return { success: true, port: state.port! };
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return { success: false, error: 'Server stopped during model load' };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load model',
      };
    }
  }

  try {
    await loadModel(modelId);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return { success: false, error: 'Server stopped during model load' };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load model',
    };
  }

  return new Promise((resolve) => {
    const server = http.createServer(createRequestHandler());

    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (address && typeof address !== 'string') {
        state.server = server;
        state.port = address.port;
        getLogCollector().logEnv(
          'INFO',
          `[HF Server] Listening on http://127.0.0.1:${address.port}`,
        );
        try {
          const storage = getStorage();
          const existingConfig = storage.getHuggingFaceLocalConfig();
          if (existingConfig) {
            storage.setHuggingFaceLocalConfig({ ...existingConfig, serverPort: address.port });
          }
        } catch (err) {
          getLogCollector().logEnv('WARN', '[HF Server] Failed to persist port to config:', {
            error: String(err),
          });
        }
        resolve({ success: true, port: address.port });
      } else {
        resolve({ success: false, error: 'Failed to get server address' });
      }
    });

    server.on('error', (error) => {
      getLogCollector().logEnv('ERROR', '[HF Server] Server error:', { error: String(error) });
      resolve({ success: false, error: error.message });
    });
  });
}

export async function stopServer(): Promise<void> {
  state.isStopping = true;
  const pendingLoad = loadModelPromise;

  if (state.server) {
    await new Promise<void>((resolve) => {
      const srv = state.server!;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ('closeAllConnections' in srv && typeof (srv as any).closeAllConnections === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (srv as any).closeAllConnections();
      }
      srv.close(() => {
        getLogCollector().logEnv('INFO', '[HF Server] Server stopped');
        resolve();
      });
    });
  }

  const drainStart = Date.now();
  while (activeGenerations > 0 && Date.now() - drainStart < 10000) {
    await new Promise((r) => setTimeout(r, 100));
  }

  if (state.model) {
    try {
      await state.model.dispose?.();
    } catch {
      // Ignore dispose errors
    }
  }

  state.server = null;
  state.port = null;
  state.loadedModelId = null;
  state.pipeline = null;
  state.tokenizer = null;
  state.model = null;
  state.isLoading = false;

  if (pendingLoad) {
    await pendingLoad.catch(() => {
      // Ignore errors from the aborted load
    });
  }
  state.isStopping = false;
}

export function getServerStatus(): {
  running: boolean;
  port: number | null;
  loadedModel: string | null;
  isLoading: boolean;
} {
  return {
    running: state.server !== null,
    port: state.port,
    loadedModel: state.loadedModelId,
    isLoading: state.isLoading,
  };
}

export async function testConnection(): Promise<{ success: boolean; error?: string }> {
  if (!state.server || !state.port) {
    return { success: false, error: 'Server is not running' };
  }

  try {
    const response = await fetch(`http://127.0.0.1:${state.port}/health`);
    if (response.ok) {
      return { success: true };
    }
    return { success: false, error: `Health check failed with status ${response.status}` };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Connection failed' };
  }
}
