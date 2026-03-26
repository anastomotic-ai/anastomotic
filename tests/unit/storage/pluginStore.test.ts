/** @vitest-environment node */

import { describe, it, expect, beforeAll, beforeEach, afterAll, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('Plugin store', () => {
  let testDir: string;
  let dbPath: string;
  let databaseModule: typeof import('../../../src/storage/database.js') | null = null;
  let pluginModule: typeof import('../../../src/storage/repositories/pluginStore.js') | null = null;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeAll(async () => {
    databaseModule = await import('../../../src/storage/database.js');
    pluginModule = await import('../../../src/storage/repositories/pluginStore.js');
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  beforeEach(() => {
    if (!databaseModule || !pluginModule) {
      return;
    }
    testDir = path.join(
      os.tmpdir(),
      `plugin-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
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

  it('should install a plugin', () => {
    if (!pluginModule) {
      return;
    }

    const plugin = pluginModule.installPlugin({
      manifestId: 'com.example.test-plugin',
      name: 'Test Plugin',
      version: '1.0.0',
      description: 'A test plugin',
      author: 'Test Author',
      entryPoint: 'dist/index.js',
      hooks: ['onTaskStart', 'onTaskEnd'],
      permissions: ['filesystem:read'],
    });

    expect(plugin.id).toMatch(/^plugin_/);
    expect(plugin.manifestId).toBe('com.example.test-plugin');
    expect(plugin.name).toBe('Test Plugin');
    expect(plugin.status).toBe('installed');
  });

  it('should list all plugins', () => {
    if (!pluginModule) {
      return;
    }

    pluginModule.installPlugin({
      manifestId: 'plugin.a',
      name: 'Plugin A',
      version: '1.0.0',
      description: '',
      author: '',
      entryPoint: 'a.js',
      hooks: [],
      permissions: [],
    });
    pluginModule.installPlugin({
      manifestId: 'plugin.b',
      name: 'Plugin B',
      version: '2.0.0',
      description: '',
      author: '',
      entryPoint: 'b.js',
      hooks: [],
      permissions: [],
    });

    const plugins = pluginModule.listPlugins();
    expect(plugins).toHaveLength(2);
  });

  it('should get a plugin by id', () => {
    if (!pluginModule) {
      return;
    }

    const plugin = pluginModule.installPlugin({
      manifestId: 'plugin.x',
      name: 'Plugin X',
      version: '1.0.0',
      description: 'desc',
      author: 'auth',
      entryPoint: 'x.js',
      hooks: [],
      permissions: [],
    });

    const retrieved = pluginModule.getPlugin(plugin.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.name).toBe('Plugin X');
  });

  it('should return null for non-existent plugin', () => {
    if (!pluginModule) {
      return;
    }

    expect(pluginModule.getPlugin('plugin_nonexistent')).toBeNull();
  });

  it('should update plugin status', () => {
    if (!pluginModule) {
      return;
    }

    const plugin = pluginModule.installPlugin({
      manifestId: 'plugin.y',
      name: 'Plugin Y',
      version: '1.0.0',
      description: '',
      author: '',
      entryPoint: 'y.js',
      hooks: [],
      permissions: [],
    });

    pluginModule.updatePluginStatus(plugin.id, 'disabled');
    const updated = pluginModule.getPlugin(plugin.id);
    expect(updated!.status).toBe('disabled');
  });

  it('should uninstall a plugin', () => {
    if (!pluginModule) {
      return;
    }

    const plugin = pluginModule.installPlugin({
      manifestId: 'plugin.z',
      name: 'Plugin Z',
      version: '1.0.0',
      description: '',
      author: '',
      entryPoint: 'z.js',
      hooks: [],
      permissions: [],
    });

    const removed = pluginModule.uninstallPlugin(plugin.id);
    expect(removed).toBe(true);
    expect(pluginModule.getPlugin(plugin.id)).toBeNull();
  });

  it('should return false when uninstalling non-existent plugin', () => {
    if (!pluginModule) {
      return;
    }

    const result = pluginModule.uninstallPlugin('plugin_nonexistent');
    expect(result).toBe(false);
  });
});
