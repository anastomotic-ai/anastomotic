/**
 * HuggingFace Local Model Manager
 *
 * Downloads, caches, and manages ONNX-format HuggingFace models
 * for local inference via Transformers.js.
 */

import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import type { HuggingFaceLocalModelInfo } from '@anastomotic_ai/agent-core/common';

export interface DownloadProgress {
  modelId: string;
  status: 'downloading' | 'complete' | 'error';
  progress: number;
  downloadedBytes?: number;
  totalBytes?: number;
  error?: string;
}

export type ProgressCallback = (progress: DownloadProgress) => void;

function getDefaultCachePath(): string {
  return path.join(app.getPath('userData'), 'hf-models');
}

function ensureCacheDir(cachePath?: string): string {
  const dir = cachePath || getDefaultCachePath();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export const SUGGESTED_MODELS: HuggingFaceLocalModelInfo[] = [
  {
    id: 'onnx-community/Llama-3.2-1B-Instruct-ONNX',
    displayName: 'Llama 3.2 1B Instruct (ONNX)',
    downloaded: false,
  },
  {
    id: 'onnx-community/Phi-3.5-mini-instruct-onnx',
    displayName: 'Phi-3.5 Mini Instruct (ONNX)',
    downloaded: false,
  },
  {
    id: 'onnx-community/Qwen2.5-0.5B-Instruct',
    displayName: 'Qwen2.5 0.5B Instruct (ONNX)',
    downloaded: false,
  },
  {
    id: 'Xenova/distilgpt2',
    displayName: 'DistilGPT-2 (Tiny, for testing)',
    downloaded: false,
  },
];

const activeDownloads = new Map<string, { abort: AbortController }>();

export async function downloadModel(
  modelId: string,
  onProgress?: ProgressCallback,
  cachePath?: string,
): Promise<{ success: boolean; error?: string }> {
  const cacheDir = ensureCacheDir(cachePath);
  const abortController = new AbortController();
  activeDownloads.set(modelId, { abort: abortController });

  try {
    onProgress?.({
      modelId,
      status: 'downloading',
      progress: 0,
    });

    const { env, AutoTokenizer, AutoModelForCausalLM } = await import('@huggingface/transformers');

    env.cacheDir = cacheDir;
    env.allowLocalModels = true;

    onProgress?.({
      modelId,
      status: 'downloading',
      progress: 10,
    });

    await AutoTokenizer.from_pretrained(modelId, {
      cache_dir: cacheDir,
    });

    onProgress?.({
      modelId,
      status: 'downloading',
      progress: 30,
    });

    try {
      await AutoModelForCausalLM.from_pretrained(modelId, {
        cache_dir: cacheDir,
        dtype: 'q4',
      });
    } catch (err) {
      console.warn(`[HF Manager] Failed to download q4 model, trying fp32: ${err}`);
      onProgress?.({
        modelId,
        status: 'downloading',
        progress: 50,
      });
      await AutoModelForCausalLM.from_pretrained(modelId, {
        cache_dir: cacheDir,
        dtype: 'fp32',
      });
    }

    onProgress?.({
      modelId,
      status: 'complete',
      progress: 100,
    });

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown download error';
    onProgress?.({
      modelId,
      status: 'error',
      progress: 0,
      error: message,
    });
    return { success: false, error: message };
  } finally {
    activeDownloads.delete(modelId);
  }
}

export function cancelDownload(modelId: string): void {
  const download = activeDownloads.get(modelId);
  if (download) {
    download.abort.abort();
    activeDownloads.delete(modelId);
  }
}

export function listCachedModels(cachePath?: string): HuggingFaceLocalModelInfo[] {
  const cacheDir = cachePath || getDefaultCachePath();
  if (!fs.existsSync(cacheDir)) {
    return [];
  }

  const models: HuggingFaceLocalModelInfo[] = [];

  try {
    const entries = fs.readdirSync(cacheDir, { withFileTypes: true });
    for (const orgEntry of entries) {
      if (!orgEntry.isDirectory()) {
        continue;
      }
      const orgDir = path.join(cacheDir, orgEntry.name);
      const modelEntries = fs.readdirSync(orgDir, { withFileTypes: true });
      for (const modelEntry of modelEntries) {
        if (!modelEntry.isDirectory()) {
          continue;
        }
        const modelDir = path.join(orgDir, modelEntry.name);
        const modelId = `${orgEntry.name}/${modelEntry.name}`;
        const sizeBytes = getDirSize(modelDir);
        models.push({
          id: modelId,
          displayName: modelEntry.name,
          sizeBytes,
          downloaded: true,
        });
      }
    }
  } catch (error) {
    console.warn('[HF Local] Error listing cached models:', error);
  }

  return models;
}

export function deleteModel(
  modelId: string,
  cachePath?: string,
): { success: boolean; error?: string } {
  const cacheDir = cachePath || getDefaultCachePath();
  const resolvedCache = path.resolve(cacheDir);

  const normalizedId = path.normalize(modelId);
  if (
    !normalizedId ||
    normalizedId.includes('\0') ||
    path.isAbsolute(normalizedId) ||
    normalizedId.split(path.sep).includes('..')
  ) {
    return { success: false, error: 'Invalid model ID' };
  }

  const modelDir = path.resolve(resolvedCache, normalizedId);

  const rel = path.relative(resolvedCache, modelDir);
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) {
    return { success: false, error: 'Invalid model ID' };
  }

  if (!fs.existsSync(modelDir)) {
    return { success: false, error: 'Model not found in cache' };
  }

  try {
    fs.rmSync(modelDir, { recursive: true, force: true });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete model',
    };
  }
}

export function getCachePath(): string {
  return getDefaultCachePath();
}

function getDirSize(dirPath: string): number {
  let totalSize = 0;
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isFile()) {
        totalSize += fs.statSync(fullPath).size;
      } else if (entry.isDirectory()) {
        totalSize += getDirSize(fullPath);
      }
    }
  } catch {
    // Ignore errors
  }
  return totalSize;
}
