/** @vitest-environment node */

import { describe, it, expect, beforeAll, beforeEach, afterAll, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('Preferences store', () => {
  let testDir: string;
  let dbPath: string;
  let databaseModule: typeof import('../../../src/storage/database.js') | null = null;
  let prefsModule: typeof import('../../../src/storage/repositories/preferences.js') | null = null;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeAll(async () => {
    databaseModule = await import('../../../src/storage/database.js');
    prefsModule = await import('../../../src/storage/repositories/preferences.js');
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  beforeEach(() => {
    if (!databaseModule || !prefsModule) {
      return;
    }
    testDir = path.join(
      os.tmpdir(),
      `pref-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
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

  it('should create a preference via upsert', () => {
    if (!prefsModule) {
      return;
    }

    const pref = prefsModule.upsertPreference({
      key: 'code_style',
      label: 'Code Style',
      value: 'functional',
    });

    expect(pref.id).toMatch(/^pref_/);
    expect(pref.key).toBe('code_style');
    expect(pref.label).toBe('Code Style');
    expect(pref.value).toBe('functional');
    expect(pref.confidence).toBe(0.5);
    expect(pref.observedCount).toBe(1);
  });

  it('should update existing preference on upsert', () => {
    if (!prefsModule) {
      return;
    }

    const first = prefsModule.upsertPreference({
      key: 'code_style',
      label: 'Code Style',
      value: 'functional',
    });

    const second = prefsModule.upsertPreference({
      key: 'code_style',
      label: 'Code Style',
      value: 'object-oriented',
    });

    expect(second.id).toBe(first.id);
    expect(second.value).toBe('object-oriented');
    expect(second.observedCount).toBe(2);
    expect(second.confidence).toBeGreaterThan(0.5);
  });

  it('should list all preferences', () => {
    if (!prefsModule) {
      return;
    }

    prefsModule.upsertPreference({ key: 'code_style', label: 'Style', value: 'fp' });
    prefsModule.upsertPreference({
      key: 'naming_convention',
      label: 'Naming',
      value: 'camelCase',
    });

    const all = prefsModule.listPreferences();
    expect(all).toHaveLength(2);
  });

  it('should filter preferences by workspace', () => {
    if (!prefsModule) {
      return;
    }

    prefsModule.upsertPreference({
      key: 'code_style',
      label: 'Style',
      value: 'fp',
      workspaceId: 'ws1',
    });
    prefsModule.upsertPreference({
      key: 'naming_convention',
      label: 'Naming',
      value: 'camelCase',
    });

    const wsPrefs = prefsModule.listPreferences('ws1');
    // Should include ws1 preference AND global preferences
    expect(wsPrefs.length).toBeGreaterThanOrEqual(1);
  });

  it('should get preference by id', () => {
    if (!prefsModule) {
      return;
    }

    const pref = prefsModule.upsertPreference({
      key: 'code_style',
      label: 'Style',
      value: 'fp',
    });

    const retrieved = prefsModule.getPreference(pref.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.key).toBe('code_style');
  });

  it('should return null for non-existent preference', () => {
    if (!prefsModule) {
      return;
    }

    const result = prefsModule.getPreference('pref_nonexistent');
    expect(result).toBeNull();
  });

  it('should delete preference', () => {
    if (!prefsModule) {
      return;
    }

    const pref = prefsModule.upsertPreference({
      key: 'code_style',
      label: 'Style',
      value: 'fp',
    });

    const deleted = prefsModule.deletePreference(pref.id);
    expect(deleted).toBe(true);
    expect(prefsModule.getPreference(pref.id)).toBeNull();
  });

  it('should generate preferences prompt text', () => {
    if (!prefsModule) {
      return;
    }

    prefsModule.upsertPreference({
      key: 'code_style',
      label: 'Code Style',
      value: 'functional',
    });

    const prompt = prefsModule.getPreferencesForPrompt('ws1');
    expect(prompt).toContain('User Preferences');
    expect(prompt).toContain('Code Style');
    expect(prompt).toContain('functional');
  });

  it('should return empty string for no qualifying preferences', () => {
    if (!prefsModule) {
      return;
    }

    const prompt = prefsModule.getPreferencesForPrompt('ws1');
    expect(prompt).toBe('');
  });
});
