/**
 * Unit tests for Anastomotic API library
 *
 * Tests the Electron detection and shell utilities:
 * - isRunningInElectron() detection
 * - getShellVersion() retrieval
 * - getShellPlatform() retrieval
 * - getAnastomotic() and useAnastomotic() API access
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Store original window
const originalWindow = globalThis.window;

describe('Anastomotic API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    (globalThis as unknown as { window: Record<string, unknown> }).window = {};
  });

  afterEach(() => {
    vi.clearAllMocks();
    (globalThis as unknown as { window: typeof window }).window = originalWindow;
  });

  describe('isRunningInElectron', () => {
    it('should return true when anastomoticShell.isElectron is true', async () => {
      (globalThis as unknown as { window: { anastomoticShell: { isElectron: boolean } } }).window =
        {
          anastomoticShell: { isElectron: true },
        };

      const { isRunningInElectron } = await import('@/lib/anastomotic');
      expect(isRunningInElectron()).toBe(true);
    });

    it('should return false when anastomoticShell.isElectron is false', async () => {
      (globalThis as unknown as { window: { anastomoticShell: { isElectron: boolean } } }).window =
        {
          anastomoticShell: { isElectron: false },
        };

      const { isRunningInElectron } = await import('@/lib/anastomotic');
      expect(isRunningInElectron()).toBe(false);
    });

    it('should return false when anastomoticShell is unavailable', async () => {
      // Test undefined, null, missing property, and empty object
      const unavailableScenarios = [
        { anastomoticShell: undefined },
        { anastomoticShell: null },
        { anastomoticShell: { version: '1.0.0' } }, // missing isElectron
        {}, // no anastomoticShell at all
      ];

      for (const scenario of unavailableScenarios) {
        vi.resetModules();
        (globalThis as unknown as { window: Record<string, unknown> }).window = scenario;
        const { isRunningInElectron } = await import('@/lib/anastomotic');
        expect(isRunningInElectron()).toBe(false);
      }
    });

    it('should use strict equality for isElectron check', async () => {
      // Truthy but not true should return false
      (globalThis as unknown as { window: { anastomoticShell: { isElectron: number } } }).window = {
        anastomoticShell: { isElectron: 1 },
      };

      const { isRunningInElectron } = await import('@/lib/anastomotic');
      expect(isRunningInElectron()).toBe(false);
    });
  });

  describe('getShellVersion', () => {
    it('should return version when available', async () => {
      (globalThis as unknown as { window: { anastomoticShell: { version: string } } }).window = {
        anastomoticShell: { version: '1.2.3' },
      };

      const { getShellVersion } = await import('@/lib/anastomotic');
      expect(getShellVersion()).toBe('1.2.3');
    });

    it('should return null when version is unavailable', async () => {
      const unavailableScenarios = [
        { anastomoticShell: undefined },
        { anastomoticShell: { isElectron: true } }, // no version property
        {},
      ];

      for (const scenario of unavailableScenarios) {
        vi.resetModules();
        (globalThis as unknown as { window: Record<string, unknown> }).window = scenario;
        const { getShellVersion } = await import('@/lib/anastomotic');
        expect(getShellVersion()).toBeNull();
      }
    });

    it('should handle various version formats', async () => {
      const versions = ['0.0.1', '1.0.0', '2.5.10', '1.0.0-beta.1', '1.0.0-rc.2'];

      for (const version of versions) {
        vi.resetModules();
        (globalThis as unknown as { window: { anastomoticShell: { version: string } } }).window = {
          anastomoticShell: { version },
        };
        const { getShellVersion } = await import('@/lib/anastomotic');
        expect(getShellVersion()).toBe(version);
      }
    });
  });

  describe('getShellPlatform', () => {
    it('should return platform when available', async () => {
      const platforms = ['darwin', 'linux', 'win32'];

      for (const platform of platforms) {
        vi.resetModules();
        (globalThis as unknown as { window: { anastomoticShell: { platform: string } } }).window = {
          anastomoticShell: { platform },
        };
        const { getShellPlatform } = await import('@/lib/anastomotic');
        expect(getShellPlatform()).toBe(platform);
      }
    });

    it('should return null when platform is unavailable', async () => {
      const unavailableScenarios = [
        { anastomoticShell: undefined },
        { anastomoticShell: { isElectron: true } }, // no platform property
        {},
      ];

      for (const scenario of unavailableScenarios) {
        vi.resetModules();
        (globalThis as unknown as { window: Record<string, unknown> }).window = scenario;
        const { getShellPlatform } = await import('@/lib/anastomotic');
        expect(getShellPlatform()).toBeNull();
      }
    });
  });

  describe('getAnastomotic', () => {
    it('should return Anastomotic API when available', async () => {
      const mockApi = {
        getVersion: vi.fn(),
        startTask: vi.fn(),
        validateBedrockCredentials: vi.fn(),
        saveBedrockCredentials: vi.fn(),
        getBedrockCredentials: vi.fn(),
      };
      (globalThis as unknown as { window: { anastomotic: typeof mockApi } }).window = {
        anastomotic: mockApi,
      };

      const { getAnastomotic } = await import('@/lib/anastomotic');
      const result = getAnastomotic();
      // getAnastomotic returns a wrapper object with spread methods + Bedrock wrappers
      expect(result.getVersion).toBeDefined();
      expect(result.startTask).toBeDefined();
      expect(result.validateBedrockCredentials).toBeDefined();
      expect(result.saveBedrockCredentials).toBeDefined();
      expect(result.getBedrockCredentials).toBeDefined();
    });

    it('should throw when Anastomotic API is not available', async () => {
      const unavailableScenarios = [{ anastomotic: undefined }, {}];

      for (const scenario of unavailableScenarios) {
        vi.resetModules();
        (globalThis as unknown as { window: Record<string, unknown> }).window = scenario;
        const { getAnastomotic } = await import('@/lib/anastomotic');
        expect(() => getAnastomotic()).toThrow(
          'Anastomotic API not available - not running in Electron',
        );
      }
    });
  });

  describe('useAnastomotic', () => {
    it('should return Anastomotic API when available', async () => {
      const mockApi = { getVersion: vi.fn(), startTask: vi.fn() };
      (globalThis as unknown as { window: { anastomotic: typeof mockApi } }).window = {
        anastomotic: mockApi,
      };

      const { useAnastomotic } = await import('@/lib/anastomotic');
      expect(useAnastomotic()).toBe(mockApi);
    });

    it('should throw when Anastomotic API is not available', async () => {
      (globalThis as unknown as { window: { anastomotic?: unknown } }).window = {
        anastomotic: undefined,
      };

      const { useAnastomotic } = await import('@/lib/anastomotic');
      expect(() => useAnastomotic()).toThrow(
        'Anastomotic API not available - not running in Electron',
      );
    });
  });

  describe('Complete Shell Object', () => {
    it('should recognize complete shell object with all properties', async () => {
      const completeShell = {
        version: '1.0.0',
        platform: 'darwin',
        isElectron: true as const,
      };
      (globalThis as unknown as { window: { anastomoticShell: typeof completeShell } }).window = {
        anastomoticShell: completeShell,
      };

      const { isRunningInElectron, getShellVersion, getShellPlatform } =
        await import('@/lib/anastomotic');

      expect(isRunningInElectron()).toBe(true);
      expect(getShellVersion()).toBe('1.0.0');
      expect(getShellPlatform()).toBe('darwin');
    });

    it('should handle partial shell object gracefully', async () => {
      const partialShell = { version: '1.0.0', isElectron: true as const };
      (globalThis as unknown as { window: { anastomoticShell: typeof partialShell } }).window = {
        anastomoticShell: partialShell,
      };

      const { isRunningInElectron, getShellVersion, getShellPlatform } =
        await import('@/lib/anastomotic');

      expect(isRunningInElectron()).toBe(true);
      expect(getShellVersion()).toBe('1.0.0');
      expect(getShellPlatform()).toBeNull();
    });
  });
});
