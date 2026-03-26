/** @vitest-environment node */

import { describe, it, expect, beforeAll, beforeEach, afterAll, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('Offline store', () => {
  let testDir: string;
  let dbPath: string;
  let databaseModule: typeof import('../../../src/storage/database.js') | null = null;
  let offlineModule: typeof import('../../../src/storage/repositories/offlineStore.js') | null =
    null;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeAll(async () => {
    databaseModule = await import('../../../src/storage/database.js');
    offlineModule = await import('../../../src/storage/repositories/offlineStore.js');
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  beforeEach(() => {
    if (!databaseModule || !offlineModule) {
      return;
    }
    testDir = path.join(
      os.tmpdir(),
      `offline-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
    fs.mkdirSync(testDir, { recursive: true });
    dbPath = path.join(testDir, 'test.db');
    databaseModule.initializeDatabase({ databasePath: dbPath });
  });

  afterEach(() => {
    if (databaseModule) {
      databaseModule.resetDatabaseInstance();
    }
    if (testDir && fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  // --- Local Models ---

  it('should add a local model', () => {
    if (!offlineModule) {
      return;
    }

    const model = offlineModule.addLocalModel({
      name: 'Llama 3',
      provider: 'ollama',
      modelId: 'llama3:8b',
      endpoint: 'http://localhost:11434',
      contextLength: 8192,
      isDefault: true,
    });

    expect(model.id).toMatch(/^lm_/);
    expect(model.name).toBe('Llama 3');
    expect(model.provider).toBe('ollama');
    expect(model.modelId).toBe('llama3:8b');
    expect(model.contextLength).toBe(8192);
    expect(model.isDefault).toBe(true);
    expect(model.enabled).toBe(true);
  });

  it('should get a model by id', () => {
    if (!offlineModule) {
      return;
    }

    const model = offlineModule.addLocalModel({
      name: 'CodeLlama',
      provider: 'lmstudio',
      modelId: 'codellama:7b',
      endpoint: 'http://localhost:1234',
    });

    const retrieved = offlineModule.getLocalModel(model.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.name).toBe('CodeLlama');
    expect(retrieved!.contextLength).toBe(4096); // default
  });

  it('should return null for non-existent model', () => {
    if (!offlineModule) {
      return;
    }

    expect(offlineModule.getLocalModel('lm_nonexistent')).toBeNull();
  });

  it('should list all local models', () => {
    if (!offlineModule) {
      return;
    }

    offlineModule.addLocalModel({
      name: 'Model A',
      provider: 'ollama',
      modelId: 'a',
      endpoint: 'http://localhost:11434',
    });
    offlineModule.addLocalModel({
      name: 'Model B',
      provider: 'lmstudio',
      modelId: 'b',
      endpoint: 'http://localhost:1234',
    });

    const models = offlineModule.listLocalModels();
    expect(models).toHaveLength(2);
  });

  it('should toggle model enabled state', () => {
    if (!offlineModule) {
      return;
    }

    const model = offlineModule.addLocalModel({
      name: 'Toggle Me',
      provider: 'custom',
      modelId: 'toggle',
      endpoint: 'http://localhost:8080',
    });

    expect(model.enabled).toBe(true);

    offlineModule.updateLocalModelEnabled(model.id, false);
    const disabled = offlineModule.getLocalModel(model.id);
    expect(disabled!.enabled).toBe(false);

    offlineModule.updateLocalModelEnabled(model.id, true);
    const enabled = offlineModule.getLocalModel(model.id);
    expect(enabled!.enabled).toBe(true);
  });

  it('should delete a local model', () => {
    if (!offlineModule) {
      return;
    }

    const model = offlineModule.addLocalModel({
      name: 'Del Me',
      provider: 'ollama',
      modelId: 'del',
      endpoint: 'http://localhost:11434',
    });

    const deleted = offlineModule.deleteLocalModel(model.id);
    expect(deleted).toBe(true);
    expect(offlineModule.getLocalModel(model.id)).toBeNull();
  });

  // --- Offline Queue ---

  it('should enqueue an offline task', () => {
    if (!offlineModule) {
      return;
    }

    const item = offlineModule.enqueueOfflineTask({
      taskPrompt: 'Summarize this document',
      priority: 5,
    });

    expect(item.id).toMatch(/^oq_/);
    expect(item.taskPrompt).toBe('Summarize this document');
    expect(item.priority).toBe(5);
    expect(item.status).toBe('queued');
    expect(item.processedAt).toBeNull();
  });

  it('should list queue items', () => {
    if (!offlineModule) {
      return;
    }

    offlineModule.enqueueOfflineTask({ taskPrompt: 'Task 1', priority: 1 });
    offlineModule.enqueueOfflineTask({ taskPrompt: 'Task 2', priority: 10 });

    const all = offlineModule.listOfflineQueue();
    expect(all).toHaveLength(2);
    // Higher priority first
    expect(all[0].priority).toBe(10);
  });

  it('should filter queue by status', () => {
    if (!offlineModule) {
      return;
    }

    const item = offlineModule.enqueueOfflineTask({ taskPrompt: 'Done Task' });
    offlineModule.enqueueOfflineTask({ taskPrompt: 'Pending Task' });

    offlineModule.updateQueueItemStatus(item.id, 'completed');

    const queued = offlineModule.listOfflineQueue('queued');
    expect(queued).toHaveLength(1);

    const completed = offlineModule.listOfflineQueue('completed');
    expect(completed).toHaveLength(1);
  });

  it('should update queue item status with error', () => {
    if (!offlineModule) {
      return;
    }

    const item = offlineModule.enqueueOfflineTask({ taskPrompt: 'Will fail' });

    offlineModule.updateQueueItemStatus(item.id, 'failed', 'Connection timeout');

    const updated = offlineModule.getQueueItem(item.id);
    expect(updated!.status).toBe('failed');
    expect(updated!.errorMessage).toBe('Connection timeout');
    expect(updated!.processedAt).not.toBeNull();
  });

  it('should clear completed and failed queue items', () => {
    if (!offlineModule) {
      return;
    }

    const i1 = offlineModule.enqueueOfflineTask({ taskPrompt: 'Completed' });
    const i2 = offlineModule.enqueueOfflineTask({ taskPrompt: 'Failed' });
    offlineModule.enqueueOfflineTask({ taskPrompt: 'Still queued' });

    offlineModule.updateQueueItemStatus(i1.id, 'completed');
    offlineModule.updateQueueItemStatus(i2.id, 'failed', 'error');

    offlineModule.clearCompletedQueue();

    const remaining = offlineModule.listOfflineQueue();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].taskPrompt).toBe('Still queued');
  });

  it('should enqueue with linked local model', () => {
    if (!offlineModule) {
      return;
    }

    const model = offlineModule.addLocalModel({
      name: 'Test Model',
      provider: 'ollama',
      modelId: 'test',
      endpoint: 'http://localhost:11434',
    });

    const item = offlineModule.enqueueOfflineTask({
      taskPrompt: 'Use local model',
      localModelId: model.id,
    });

    expect(item.localModelId).toBe(model.id);
  });
});
