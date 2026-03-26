/** @vitest-environment node */

import { describe, it, expect, beforeAll, beforeEach, afterAll, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('Proactive store', () => {
  let testDir: string;
  let dbPath: string;
  let databaseModule: typeof import('../../../src/storage/database.js') | null = null;
  let proactiveModule: typeof import('../../../src/storage/repositories/proactiveStore.js') | null =
    null;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeAll(async () => {
    databaseModule = await import('../../../src/storage/database.js');
    proactiveModule = await import('../../../src/storage/repositories/proactiveStore.js');
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  beforeEach(() => {
    if (!databaseModule || !proactiveModule) {
      return;
    }
    testDir = path.join(
      os.tmpdir(),
      `proactive-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
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

  // --- File Watchers ---

  it('should create and retrieve a file watcher', () => {
    if (!proactiveModule) {
      return;
    }

    const watcher = proactiveModule.createFileWatcher({
      name: 'Test Watcher',
      path: '/src',
      patterns: ['*.ts'],
      action: 'notify',
    });

    expect(watcher.id).toMatch(/^fw_/);
    expect(watcher.name).toBe('Test Watcher');
    expect(watcher.path).toBe('/src');
    expect(watcher.patterns).toEqual(['*.ts']);
    expect(watcher.status).toBe('active');
  });

  it('should list file watchers', () => {
    if (!proactiveModule) {
      return;
    }

    proactiveModule.createFileWatcher({
      name: 'Watcher 1',
      path: '/src',
      patterns: ['*.ts'],
      action: 'lint',
    });
    proactiveModule.createFileWatcher({
      name: 'Watcher 2',
      path: '/tests',
      patterns: ['*.test.ts'],
      action: 'test',
    });

    const watchers = proactiveModule.listFileWatchers();
    expect(watchers).toHaveLength(2);
  });

  it('should get a watcher by id', () => {
    if (!proactiveModule) {
      return;
    }

    const watcher = proactiveModule.createFileWatcher({
      name: 'My Watcher',
      path: '/app',
      patterns: ['**/*'],
      action: 'build',
    });

    const retrieved = proactiveModule.getFileWatcher(watcher.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.name).toBe('My Watcher');
  });

  it('should return null for non-existent watcher', () => {
    if (!proactiveModule) {
      return;
    }

    const result = proactiveModule.getFileWatcher('fw_nonexistent');
    expect(result).toBeNull();
  });

  it('should update watcher status', () => {
    if (!proactiveModule) {
      return;
    }

    const watcher = proactiveModule.createFileWatcher({
      name: 'Watcher',
      path: '/src',
      patterns: ['*.ts'],
      action: 'lint',
    });

    proactiveModule.updateFileWatcherStatus(watcher.id, 'paused');
    const updated = proactiveModule.getFileWatcher(watcher.id);
    expect(updated!.status).toBe('paused');
  });

  it('should delete a file watcher', () => {
    if (!proactiveModule) {
      return;
    }

    const watcher = proactiveModule.createFileWatcher({
      name: 'Watcher',
      path: '/src',
      patterns: ['*.ts'],
      action: 'lint',
    });

    const deleted = proactiveModule.deleteFileWatcher(watcher.id);
    expect(deleted).toBe(true);
    expect(proactiveModule.getFileWatcher(watcher.id)).toBeNull();
  });

  // --- Alerts ---

  it('should create and retrieve an alert', () => {
    if (!proactiveModule) {
      return;
    }

    const alert = proactiveModule.createAlert({
      type: 'file_change',
      title: 'File Changed',
      message: 'src/index.ts was modified',
      priority: 'medium',
      suggestedAction: 'Run tests',
    });

    expect(alert.id).toMatch(/^alert_/);
    expect(alert.type).toBe('file_change');
    expect(alert.title).toBe('File Changed');
    expect(alert.status).toBe('pending');
    expect(alert.suggestedAction).toBe('Run tests');
  });

  it('should list alerts with filter', () => {
    if (!proactiveModule) {
      return;
    }

    proactiveModule.createAlert({
      type: 'anomaly',
      title: 'Error',
      message: 'Build failed',
      priority: 'high',
    });
    proactiveModule.createAlert({
      type: 'suggestion',
      title: 'Suggestion',
      message: 'Consider refactoring',
      priority: 'low',
    });

    const all = proactiveModule.listAlerts();
    expect(all).toHaveLength(2);

    const pending = proactiveModule.listAlerts('pending');
    expect(pending).toHaveLength(2);
  });

  it('should update alert status', () => {
    if (!proactiveModule) {
      return;
    }

    const alert = proactiveModule.createAlert({
      type: 'file_change',
      title: 'Test',
      message: 'Test message',
      priority: 'low',
    });

    proactiveModule.updateAlertStatus(alert.id, 'acted');
    const updated = proactiveModule.getAlert(alert.id);
    expect(updated!.status).toBe('acted');
  });

  it('should dismiss an alert', () => {
    if (!proactiveModule) {
      return;
    }

    const alert = proactiveModule.createAlert({
      type: 'suggestion',
      title: 'Test',
      message: 'Test',
      priority: 'low',
    });

    proactiveModule.dismissAlert(alert.id);
    const updated = proactiveModule.getAlert(alert.id);
    expect(updated!.status).toBe('dismissed');
  });

  it('should clear dismissed alerts', () => {
    if (!proactiveModule) {
      return;
    }

    const a1 = proactiveModule.createAlert({
      type: 'file_change',
      title: 'A1',
      message: 'M1',
      priority: 'low',
    });
    proactiveModule.createAlert({
      type: 'suggestion',
      title: 'A2',
      message: 'M2',
      priority: 'medium',
    });

    proactiveModule.dismissAlert(a1.id);
    proactiveModule.clearDismissedAlerts();

    const all = proactiveModule.listAlerts();
    expect(all).toHaveLength(1);
    expect(all[0].title).toBe('A2');
  });
});
