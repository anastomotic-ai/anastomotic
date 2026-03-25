/**
 * Integration tests for Preload script
 *
 * Tests the REAL preload script by:
 * 1. Mocking electron APIs (external dependency)
 * 2. Importing the real preload module (triggers contextBridge.exposeInMainWorld)
 * 3. Verifying the exposed API calls the correct IPC channels
 *
 * This is a proper integration test - only external dependencies are mocked.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import pkg from '../../../package.json';

// Create mock functions for electron
const mockExposeInMainWorld = vi.fn();
const mockInvoke = vi.fn(() => Promise.resolve(undefined));
const mockOn = vi.fn();
const mockRemoveListener = vi.fn();

// Mock electron module before importing preload
vi.mock('electron', () => ({
  contextBridge: {
    exposeInMainWorld: mockExposeInMainWorld,
  },
  ipcRenderer: {
    invoke: mockInvoke,
    on: mockOn,
    removeListener: mockRemoveListener,
  },
}));

// Store captured APIs from exposeInMainWorld calls
let capturedAnastomoticAPI: Record<string, unknown> = {};
let capturedAnastomoticShell: Record<string, unknown> = {};

describe('Preload Script Integration', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    capturedAnastomoticAPI = {};
    capturedAnastomoticShell = {};

    // Set the package version env var (normally set by npm/pnpm when running scripts)
    process.env.npm_package_version = pkg.version;

    // Capture what the real preload exposes
    mockExposeInMainWorld.mockImplementation((name: string, api: unknown) => {
      if (name === 'anastomotic') {
        capturedAnastomoticAPI = api as Record<string, unknown>;
      } else if (name === 'anastomoticShell') {
        capturedAnastomoticShell = api as Record<string, unknown>;
      }
    });

    // Reset module cache and import the REAL preload module
    vi.resetModules();
    await import('../../../src/preload/index');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('API Exposure', () => {
    it('should expose Anastomotic API via contextBridge', () => {
      expect(mockExposeInMainWorld).toHaveBeenCalledWith('anastomotic', expect.any(Object));
      expect(capturedAnastomoticAPI).toBeDefined();
    });

    it('should expose anastomoticShell info via contextBridge', () => {
      expect(mockExposeInMainWorld).toHaveBeenCalledWith('anastomoticShell', expect.any(Object));
      expect(capturedAnastomoticShell).toBeDefined();
    });

    it('should expose shell info with isElectron=true', () => {
      expect(capturedAnastomoticShell.isElectron).toBe(true);
    });

    it('should expose shell info with platform', () => {
      expect(capturedAnastomoticShell.platform).toBe(process.platform);
    });

    it('should expose shell info with version matching package.json', () => {
      expect(capturedAnastomoticShell.version).toBe(pkg.version);
    });
  });

  describe('IPC Method Invocations', () => {
    describe('App Info', () => {
      it('getVersion should invoke app:version', async () => {
        await (capturedAnastomoticAPI.getVersion as () => Promise<string>)();
        expect(mockInvoke).toHaveBeenCalledWith('app:version');
      });

      it('getPlatform should invoke app:platform', async () => {
        await (capturedAnastomoticAPI.getPlatform as () => Promise<string>)();
        expect(mockInvoke).toHaveBeenCalledWith('app:platform');
      });
    });

    describe('Shell Operations', () => {
      it('openExternal should invoke shell:open-external with URL', async () => {
        const url = 'https://example.com';
        await (capturedAnastomoticAPI.openExternal as (url: string) => Promise<void>)(url);
        expect(mockInvoke).toHaveBeenCalledWith('shell:open-external', url);
      });
    });

    describe('Task Operations', () => {
      it('startTask should invoke task:start with config', async () => {
        const config = { description: 'Test task' };
        await (
          capturedAnastomoticAPI.startTask as (config: { description: string }) => Promise<unknown>
        )(config);
        expect(mockInvoke).toHaveBeenCalledWith('task:start', config);
      });

      it('cancelTask should invoke task:cancel with taskId', async () => {
        await (capturedAnastomoticAPI.cancelTask as (taskId: string) => Promise<void>)('task_123');
        expect(mockInvoke).toHaveBeenCalledWith('task:cancel', 'task_123');
      });

      it('interruptTask should invoke task:interrupt with taskId', async () => {
        await (capturedAnastomoticAPI.interruptTask as (taskId: string) => Promise<void>)(
          'task_123',
        );
        expect(mockInvoke).toHaveBeenCalledWith('task:interrupt', 'task_123');
      });

      it('getTask should invoke task:get with taskId', async () => {
        await (capturedAnastomoticAPI.getTask as (taskId: string) => Promise<unknown>)('task_123');
        expect(mockInvoke).toHaveBeenCalledWith('task:get', 'task_123');
      });

      it('listTasks should invoke task:list', async () => {
        await (capturedAnastomoticAPI.listTasks as () => Promise<unknown[]>)();
        expect(mockInvoke).toHaveBeenCalledWith('task:list');
      });

      it('deleteTask should invoke task:delete with taskId', async () => {
        await (capturedAnastomoticAPI.deleteTask as (taskId: string) => Promise<void>)('task_123');
        expect(mockInvoke).toHaveBeenCalledWith('task:delete', 'task_123');
      });

      it('clearTaskHistory should invoke task:clear-history', async () => {
        await (capturedAnastomoticAPI.clearTaskHistory as () => Promise<void>)();
        expect(mockInvoke).toHaveBeenCalledWith('task:clear-history');
      });

      it('addFavorite should invoke favorites:add with taskId', async () => {
        await (capturedAnastomoticAPI.addFavorite as (taskId: string) => Promise<void>)('task_123');
        expect(mockInvoke).toHaveBeenCalledWith('favorites:add', 'task_123');
      });

      it('removeFavorite should invoke favorites:remove with taskId', async () => {
        await (capturedAnastomoticAPI.removeFavorite as (taskId: string) => Promise<void>)(
          'task_123',
        );
        expect(mockInvoke).toHaveBeenCalledWith('favorites:remove', 'task_123');
      });

      it('listFavorites should invoke favorites:list', async () => {
        await (capturedAnastomoticAPI.listFavorites as () => Promise<unknown[]>)();
        expect(mockInvoke).toHaveBeenCalledWith('favorites:list');
      });

      it('isFavorite should invoke favorites:has with taskId', async () => {
        await (capturedAnastomoticAPI.isFavorite as (taskId: string) => Promise<boolean>)(
          'task_123',
        );
        expect(mockInvoke).toHaveBeenCalledWith('favorites:has', 'task_123');
      });
    });

    describe('Permission Operations', () => {
      it('respondToPermission should invoke permission:respond', async () => {
        const response = { taskId: 'task_123', allowed: true };
        await (
          capturedAnastomoticAPI.respondToPermission as (r: {
            taskId: string;
            allowed: boolean;
          }) => Promise<void>
        )(response);
        expect(mockInvoke).toHaveBeenCalledWith('permission:respond', response);
      });
    });

    describe('Session Operations', () => {
      it('resumeSession should invoke session:resume', async () => {
        await (
          capturedAnastomoticAPI.resumeSession as (
            s: string,
            p: string,
            t?: string,
            attachments?: unknown[],
          ) => Promise<unknown>
        )('session_123', 'Continue', 'task_456');
        expect(mockInvoke).toHaveBeenCalledWith(
          'session:resume',
          'session_123',
          'Continue',
          'task_456',
          undefined,
        );
      });
    });

    describe('Settings Operations', () => {
      it('getDebugMode should invoke settings:debug-mode', async () => {
        await (capturedAnastomoticAPI.getDebugMode as () => Promise<boolean>)();
        expect(mockInvoke).toHaveBeenCalledWith('settings:debug-mode');
      });

      it('setDebugMode should invoke settings:set-debug-mode', async () => {
        await (capturedAnastomoticAPI.setDebugMode as (enabled: boolean) => Promise<void>)(true);
        expect(mockInvoke).toHaveBeenCalledWith('settings:set-debug-mode', true);
      });

      it('getAppSettings should invoke settings:app-settings', async () => {
        await (capturedAnastomoticAPI.getAppSettings as () => Promise<unknown>)();
        expect(mockInvoke).toHaveBeenCalledWith('settings:app-settings');
      });

      it('getSlackMcpOauthStatus should invoke opencode:auth:slack:status', async () => {
        await (capturedAnastomoticAPI.getSlackMcpOauthStatus as () => Promise<unknown>)();
        expect(mockInvoke).toHaveBeenCalledWith('opencode:auth:slack:status');
      });

      it('loginSlackMcp should invoke opencode:auth:slack:login', async () => {
        await (capturedAnastomoticAPI.loginSlackMcp as () => Promise<unknown>)();
        expect(mockInvoke).toHaveBeenCalledWith('opencode:auth:slack:login');
      });

      it('logoutSlackMcp should invoke opencode:auth:slack:logout', async () => {
        await (capturedAnastomoticAPI.logoutSlackMcp as () => Promise<void>)();
        expect(mockInvoke).toHaveBeenCalledWith('opencode:auth:slack:logout');
      });
    });

    describe('API Key Operations', () => {
      it('hasApiKey should invoke api-key:exists', async () => {
        await (capturedAnastomoticAPI.hasApiKey as () => Promise<boolean>)();
        expect(mockInvoke).toHaveBeenCalledWith('api-key:exists');
      });

      it('setApiKey should invoke api-key:set', async () => {
        await (capturedAnastomoticAPI.setApiKey as (key: string) => Promise<void>)('sk-test');
        expect(mockInvoke).toHaveBeenCalledWith('api-key:set', 'sk-test');
      });

      it('getApiKey should invoke api-key:get', async () => {
        await (capturedAnastomoticAPI.getApiKey as () => Promise<string | null>)();
        expect(mockInvoke).toHaveBeenCalledWith('api-key:get');
      });

      it('validateApiKey should invoke api-key:validate', async () => {
        await (capturedAnastomoticAPI.validateApiKey as (key: string) => Promise<unknown>)(
          'sk-test',
        );
        expect(mockInvoke).toHaveBeenCalledWith('api-key:validate', 'sk-test');
      });

      it('clearApiKey should invoke api-key:clear', async () => {
        await (capturedAnastomoticAPI.clearApiKey as () => Promise<void>)();
        expect(mockInvoke).toHaveBeenCalledWith('api-key:clear');
      });

      it('getAllApiKeys should invoke api-keys:all', async () => {
        await (capturedAnastomoticAPI.getAllApiKeys as () => Promise<unknown>)();
        expect(mockInvoke).toHaveBeenCalledWith('api-keys:all');
      });

      it('hasAnyApiKey should invoke api-keys:has-any', async () => {
        await (capturedAnastomoticAPI.hasAnyApiKey as () => Promise<boolean>)();
        expect(mockInvoke).toHaveBeenCalledWith('api-keys:has-any');
      });
    });

    describe('Onboarding Operations', () => {
      it('getOnboardingComplete should invoke onboarding:complete', async () => {
        await (capturedAnastomoticAPI.getOnboardingComplete as () => Promise<boolean>)();
        expect(mockInvoke).toHaveBeenCalledWith('onboarding:complete');
      });

      it('setOnboardingComplete should invoke onboarding:set-complete', async () => {
        await (capturedAnastomoticAPI.setOnboardingComplete as (c: boolean) => Promise<void>)(true);
        expect(mockInvoke).toHaveBeenCalledWith('onboarding:set-complete', true);
      });
    });

    describe('Model Operations', () => {
      it('getSelectedModel should invoke model:get', async () => {
        await (capturedAnastomoticAPI.getSelectedModel as () => Promise<unknown>)();
        expect(mockInvoke).toHaveBeenCalledWith('model:get');
      });

      it('setSelectedModel should invoke model:set', async () => {
        const model = { provider: 'anthropic', model: 'claude-3-opus' };
        await (
          capturedAnastomoticAPI.setSelectedModel as (m: {
            provider: string;
            model: string;
          }) => Promise<void>
        )(model);
        expect(mockInvoke).toHaveBeenCalledWith('model:set', model);
      });
    });

    describe('Logging Operations', () => {
      it('logEvent should invoke log:event', async () => {
        const payload = { level: 'info', message: 'Test' };
        await (capturedAnastomoticAPI.logEvent as (p: unknown) => Promise<unknown>)(payload);
        expect(mockInvoke).toHaveBeenCalledWith('log:event', payload);
      });
    });

    describe('Skills Operations', () => {
      it('getUserSkillsPath should invoke skills:get-user-skills-path', async () => {
        await (capturedAnastomoticAPI.getUserSkillsPath as () => Promise<string>)();
        expect(mockInvoke).toHaveBeenCalledWith('skills:get-user-skills-path');
      });
    });
  });

  describe('Event Subscriptions', () => {
    it('onTaskUpdate should subscribe to task:update', () => {
      const callback = vi.fn();
      (capturedAnastomoticAPI.onTaskUpdate as (cb: (e: unknown) => void) => () => void)(callback);
      expect(mockOn).toHaveBeenCalledWith('task:update', expect.any(Function));
    });

    it('onTaskUpdate should return unsubscribe function', () => {
      const callback = vi.fn();
      const unsubscribe = (
        capturedAnastomoticAPI.onTaskUpdate as (cb: (e: unknown) => void) => () => void
      )(callback);
      unsubscribe();
      expect(mockRemoveListener).toHaveBeenCalledWith('task:update', expect.any(Function));
    });

    it('onTaskUpdateBatch should subscribe to task:update:batch', () => {
      const callback = vi.fn();
      (capturedAnastomoticAPI.onTaskUpdateBatch as (cb: (e: unknown) => void) => () => void)(
        callback,
      );
      expect(mockOn).toHaveBeenCalledWith('task:update:batch', expect.any(Function));
    });

    it('onPermissionRequest should subscribe to permission:request', () => {
      const callback = vi.fn();
      (capturedAnastomoticAPI.onPermissionRequest as (cb: (e: unknown) => void) => () => void)(
        callback,
      );
      expect(mockOn).toHaveBeenCalledWith('permission:request', expect.any(Function));
    });

    it('onTaskProgress should subscribe to task:progress', () => {
      const callback = vi.fn();
      (capturedAnastomoticAPI.onTaskProgress as (cb: (e: unknown) => void) => () => void)(callback);
      expect(mockOn).toHaveBeenCalledWith('task:progress', expect.any(Function));
    });

    it('onDebugLog should subscribe to debug:log', () => {
      const callback = vi.fn();
      (capturedAnastomoticAPI.onDebugLog as (cb: (e: unknown) => void) => () => void)(callback);
      expect(mockOn).toHaveBeenCalledWith('debug:log', expect.any(Function));
    });

    it('onTaskStatusChange should subscribe to task:status-change', () => {
      const callback = vi.fn();
      (capturedAnastomoticAPI.onTaskStatusChange as (cb: (e: unknown) => void) => () => void)(
        callback,
      );
      expect(mockOn).toHaveBeenCalledWith('task:status-change', expect.any(Function));
    });
  });

  describe('Event Callback Invocation', () => {
    it('onTaskUpdate callback should receive event data', () => {
      const callback = vi.fn();
      (capturedAnastomoticAPI.onTaskUpdate as (cb: (e: unknown) => void) => () => void)(callback);

      // Get the registered listener from mockOn calls
      const registeredListener = mockOn.mock.calls.find(
        (call: unknown[]) => call[0] === 'task:update',
      )?.[1] as (event: unknown, data: unknown) => void;

      // Simulate IPC event
      const eventData = { taskId: 'task_123', type: 'message' };
      registeredListener(null, eventData);

      expect(callback).toHaveBeenCalledWith(eventData);
    });

    it('onPermissionRequest callback should receive request data', () => {
      const callback = vi.fn();
      (capturedAnastomoticAPI.onPermissionRequest as (cb: (e: unknown) => void) => () => void)(
        callback,
      );

      const registeredListener = mockOn.mock.calls.find(
        (call: unknown[]) => call[0] === 'permission:request',
      )?.[1] as (event: unknown, data: unknown) => void;

      const requestData = { id: 'req_123', taskId: 'task_456' };
      registeredListener(null, requestData);

      expect(callback).toHaveBeenCalledWith(requestData);
    });
  });
});
