/** @vitest-environment node */

import { describe, it, expect, beforeAll, beforeEach, afterAll, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('Memory store', () => {
  let testDir: string;
  let dbPath: string;
  let databaseModule: typeof import('../../../src/storage/database.js') | null = null;
  let memoryModule: typeof import('../../../src/storage/repositories/memoryStore.js') | null = null;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeAll(async () => {
    databaseModule = await import('../../../src/storage/database.js');
    memoryModule = await import('../../../src/storage/repositories/memoryStore.js');
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  beforeEach(() => {
    if (!databaseModule || !memoryModule) {
      return;
    }
    testDir = path.join(
      os.tmpdir(),
      `mem-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
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

  it('should create and retrieve a memory entry', () => {
    if (!memoryModule) {
      return;
    }

    const entry = memoryModule.createMemoryEntry({
      scope: 'global',
      category: 'fact',
      content: 'TypeScript is a superset of JavaScript',
    });

    expect(entry.id).toMatch(/^mem_/);
    expect(entry.scope).toBe('global');
    expect(entry.category).toBe('fact');
    expect(entry.content).toBe('TypeScript is a superset of JavaScript');
    expect(entry.relevanceScore).toBe(1.0);
    expect(entry.accessCount).toBe(0);

    const retrieved = memoryModule.getMemoryEntry(entry.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.id).toBe(entry.id);
  });

  it('should return null for non-existent entry', () => {
    if (!memoryModule) {
      return;
    }

    const result = memoryModule.getMemoryEntry('mem_nonexistent');
    expect(result).toBeNull();
  });

  it('should list memory entries with default limit', () => {
    if (!memoryModule) {
      return;
    }

    memoryModule.createMemoryEntry({ scope: 'global', category: 'fact', content: 'Fact one' });
    memoryModule.createMemoryEntry({
      scope: 'global',
      category: 'pattern',
      content: 'Pattern one',
    });
    memoryModule.createMemoryEntry({
      scope: 'workspace',
      category: 'task_context',
      content: 'Task context',
      workspaceId: 'ws1',
    });

    const all = memoryModule.listMemoryEntries();
    expect(all).toHaveLength(3);
  });

  it('should filter entries by scope', () => {
    if (!memoryModule) {
      return;
    }

    memoryModule.createMemoryEntry({ scope: 'global', category: 'fact', content: 'Global fact' });
    memoryModule.createMemoryEntry({
      scope: 'workspace',
      category: 'fact',
      content: 'WS fact',
      workspaceId: 'ws1',
    });

    const globals = memoryModule.listMemoryEntries(undefined, 'global');
    expect(globals).toHaveLength(1);
    expect(globals[0].scope).toBe('global');
  });

  it('should filter entries by category', () => {
    if (!memoryModule) {
      return;
    }

    memoryModule.createMemoryEntry({ scope: 'global', category: 'fact', content: 'A fact' });
    memoryModule.createMemoryEntry({
      scope: 'global',
      category: 'pattern',
      content: 'A pattern',
    });

    const facts = memoryModule.listMemoryEntries(undefined, undefined, 'fact');
    expect(facts).toHaveLength(1);
    expect(facts[0].category).toBe('fact');
  });

  it('should search memory by keyword matching', () => {
    if (!memoryModule) {
      return;
    }

    memoryModule.createMemoryEntry({
      scope: 'global',
      category: 'fact',
      content: 'Python uses indentation for blocks',
    });
    memoryModule.createMemoryEntry({
      scope: 'global',
      category: 'fact',
      content: 'TypeScript has static types',
    });

    const results = memoryModule.searchMemory('python indentation');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].entry.content).toContain('Python');
  });

  it('should return empty for search with no matches', () => {
    if (!memoryModule) {
      return;
    }

    memoryModule.createMemoryEntry({
      scope: 'global',
      category: 'fact',
      content: 'Hello world example',
    });

    const results = memoryModule.searchMemory('zzz_nonexistent_term');
    expect(results).toHaveLength(0);
  });

  it('should delete a memory entry', () => {
    if (!memoryModule) {
      return;
    }

    const entry = memoryModule.createMemoryEntry({
      scope: 'global',
      category: 'fact',
      content: 'To be deleted',
    });

    const deleted = memoryModule.deleteMemoryEntry(entry.id);
    expect(deleted).toBe(true);

    const result = memoryModule.getMemoryEntry(entry.id);
    expect(result).toBeNull();
  });

  it('should return false when deleting non-existent entry', () => {
    if (!memoryModule) {
      return;
    }

    const deleted = memoryModule.deleteMemoryEntry('mem_nonexistent');
    expect(deleted).toBe(false);
  });

  it('should clear all memory entries', () => {
    if (!memoryModule) {
      return;
    }

    memoryModule.createMemoryEntry({ scope: 'global', category: 'fact', content: 'One' });
    memoryModule.createMemoryEntry({ scope: 'global', category: 'fact', content: 'Two' });

    memoryModule.clearMemoryEntries();

    const all = memoryModule.listMemoryEntries();
    expect(all).toHaveLength(0);
  });

  it('should clear entries by workspace', () => {
    if (!memoryModule) {
      return;
    }

    memoryModule.createMemoryEntry({
      scope: 'workspace',
      category: 'fact',
      content: 'WS entry',
      workspaceId: 'ws1',
    });
    memoryModule.createMemoryEntry({ scope: 'global', category: 'fact', content: 'Global entry' });

    memoryModule.clearMemoryEntries('ws1');

    const all = memoryModule.listMemoryEntries();
    expect(all).toHaveLength(1);
    expect(all[0].scope).toBe('global');
  });

  it('should get memory stats', () => {
    if (!memoryModule) {
      return;
    }

    memoryModule.createMemoryEntry({ scope: 'global', category: 'fact', content: 'Fact' });
    memoryModule.createMemoryEntry({
      scope: 'workspace',
      category: 'pattern',
      content: 'Pattern',
      workspaceId: 'ws1',
    });

    const stats = memoryModule.getMemoryStats();
    expect(stats.totalEntries).toBe(2);
    expect(stats.globalEntries).toBe(1);
    expect(stats.topCategories.length).toBeGreaterThan(0);
  });

  it('should truncate content exceeding max length', () => {
    if (!memoryModule) {
      return;
    }

    const longContent = 'x'.repeat(3000);
    const entry = memoryModule.createMemoryEntry({
      scope: 'global',
      category: 'fact',
      content: longContent,
    });

    expect(entry.content.length).toBeLessThanOrEqual(2000);
  });
});
