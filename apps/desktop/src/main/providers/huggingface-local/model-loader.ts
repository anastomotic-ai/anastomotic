/**
 * Model loader for the HuggingFace Local inference server.
 * Handles loading/unloading Transformers.js models into shared state.
 */

import { app } from 'electron';
import path from 'path';
import { getLogCollector } from '../../logging';
import { getStorage } from '../../store/storage';
import {
  state,
  loadModelPromise,
  setLoadModelPromise,
  activeGenerations,
  type ChatMessage,
} from './server-state';

export async function loadModel(modelId: string): Promise<void> {
  if (!state.isStopping && state.loadedModelId === modelId && state.tokenizer && state.model) {
    getLogCollector().logEnv('INFO', `[HF Server] Model ${modelId} already loaded`);
    return;
  }

  if (loadModelPromise) {
    try {
      await loadModelPromise;
    } catch {
      // Previous load failed or was cancelled
    }
    if (!state.isStopping && state.loadedModelId === modelId && state.tokenizer && state.model) {
      return;
    }
  }

  const promise = (async () => {
    state.isLoading = true;
    const stoppedAtStart = state.isStopping;
    getLogCollector().logEnv('INFO', `[HF Server] Loading model: ${modelId}`);

    try {
      const { env, AutoTokenizer, AutoModelForCausalLM } =
        await import('@huggingface/transformers');

      const cacheDir = path.join(app.getPath('userData'), 'hf-models');
      env.cacheDir = cacheDir;
      env.allowLocalModels = true;

      const tokenizer = await AutoTokenizer.from_pretrained(modelId, {
        cache_dir: cacheDir,
        local_files_only: true,
      });

      const config = getStorage().getHuggingFaceLocalConfig();
      const quantization = config?.quantization ?? null;
      const devicePreference = config?.devicePreference ?? null;
      const deviceOption =
        devicePreference && devicePreference !== 'auto'
          ? { device: devicePreference as 'cpu' | 'cuda' | 'webgpu' }
          : {};

      const dtypesToTry: string[] = quantization ? [quantization] : ['q4'];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let model: any;
      for (const dtype of dtypesToTry) {
        try {
          model = await AutoModelForCausalLM.from_pretrained(modelId, {
            cache_dir: cacheDir,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            dtype: dtype as any,
            local_files_only: true,
            ...deviceOption,
          });
          break;
        } catch (err) {
          if (dtype === dtypesToTry[dtypesToTry.length - 1] && dtype !== 'fp32') {
            getLogCollector().logEnv(
              'WARN',
              `[HF Server] Failed to load ${dtype} model, trying fp32: ${err}`,
            );
            model = await AutoModelForCausalLM.from_pretrained(modelId, {
              cache_dir: cacheDir,
              dtype: 'fp32',
              local_files_only: true,
              ...deviceOption,
            });
          } else {
            throw err;
          }
        }
      }

      if (state.isStopping || stoppedAtStart) {
        getLogCollector().logEnv(
          'INFO',
          `[HF Server] Stop requested during load of ${modelId}; discarding.`,
        );
        try {
          await model?.dispose?.();
        } catch {
          // Ignore dispose errors
        }
        throw new DOMException('Load cancelled by stopServer()', 'AbortError');
      }

      if (state.model) {
        const start = Date.now();
        while (activeGenerations > 0 && Date.now() - start < 10000) {
          await new Promise((r) => setTimeout(r, 100));
        }
        try {
          await state.model.dispose?.();
        } catch {
          // Ignore dispose errors
        }
      }

      state.tokenizer = tokenizer;
      state.model = model;
      state.loadedModelId = modelId;
      getLogCollector().logEnv('INFO', `[HF Server] Model loaded: ${modelId}`);
    } catch (error) {
      const isAbort = error instanceof DOMException && error.name === 'AbortError';
      getLogCollector().logEnv(
        isAbort ? 'INFO' : 'ERROR',
        `[HF Server] ${isAbort ? 'Load cancelled' : 'Failed to load model'}: ${modelId}`,
        isAbort ? undefined : { error: String(error) },
      );
      throw error;
    } finally {
      state.isLoading = false;
      setLoadModelPromise(null);
    }
  })();

  setLoadModelPromise(promise);
  return promise;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatChatPrompt(messages: ChatMessage[], tokenizer: any): string {
  try {
    if (tokenizer.apply_chat_template) {
      const formatted = tokenizer.apply_chat_template(messages, {
        tokenize: false,
        add_generation_prompt: true,
      });
      return formatted;
    }
  } catch {
    // Fall through to manual formatting
  }

  return (
    messages
      .map((m) => {
        if (m.role === 'system') {
          return `System: ${m.content}`;
        }
        if (m.role === 'user') {
          return `User: ${m.content}`;
        }
        return `Assistant: ${m.content}`;
      })
      .join('\n') + '\nAssistant:'
  );
}
