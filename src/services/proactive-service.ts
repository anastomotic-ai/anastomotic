/**
 * Proactive agent service — file system monitoring, anomaly detection,
 * and intelligent alert generation.
 */

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  createAlert,
  listFileWatchers,
  listAlerts,
} from '../storage/repositories/proactiveStore.js';
import type { ProactiveAlertCreateInput, ProactiveConfig } from '../common/types/proactive.js';
import { createConsoleLogger } from '../utils/logging.js';

const log = createConsoleLogger({ prefix: 'ProactiveAgent' });

const DEFAULT_CONFIG: ProactiveConfig = {
  enabled: false,
  watchDownloads: true,
  watchDesktop: true,
  diskSpaceThreshold: 90,
  checkIntervalMinutes: 30,
};

let intervalHandle: ReturnType<typeof setInterval> | null = null;
const activeWatchers = new Map<string, fs.FSWatcher>();

export function startProactiveAgent(config?: Partial<ProactiveConfig>): void {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  if (!mergedConfig.enabled) {
    return;
  }

  stopProactiveAgent();

  log.info('Starting proactive agent');
  runProactiveChecks(mergedConfig);
  startFileWatchers();

  intervalHandle = setInterval(
    () => runProactiveChecks(mergedConfig),
    mergedConfig.checkIntervalMinutes * 60 * 1000,
  );
}

export function stopProactiveAgent(): void {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
  for (const [_id, watcher] of activeWatchers) {
    watcher.close();
  }
  activeWatchers.clear();
}

export function runProactiveChecks(config: ProactiveConfig): void {
  checkDiskSpace(config.diskSpaceThreshold);
  checkDownloadsFolder(config.watchDownloads);
}

function checkDiskSpace(thresholdPercent: number): void {
  try {
    const homeDir = os.homedir();
    const stats = fs.statfsSync(homeDir);
    const totalBytes = stats.bsize * stats.blocks;
    const freeBytes = stats.bsize * stats.bfree;
    const usedPercent = Math.round(((totalBytes - freeBytes) / totalBytes) * 100);

    if (usedPercent >= thresholdPercent) {
      const freeGB = (freeBytes / (1024 * 1024 * 1024)).toFixed(1);
      raiseAlert({
        type: 'disk_space',
        title: 'Low Disk Space',
        message: `Disk usage is at ${usedPercent}%. Only ${freeGB} GB free. Want me to find large unused files?`,
        priority: usedPercent >= 95 ? 'high' : 'medium',
        suggestedAction: 'Find and clean up large unused files',
      });
    }
  } catch (err) {
    log.warn(`Disk space check failed: ${err}`);
  }
}

function checkDownloadsFolder(enabled: boolean): void {
  if (!enabled) {
    return;
  }
  try {
    const downloadsDir = path.join(os.homedir(), 'Downloads');
    if (!fs.existsSync(downloadsDir)) {
      return;
    }

    const files = fs.readdirSync(downloadsDir);
    const recentFiles = files.filter((f) => {
      try {
        const stat = fs.statSync(path.join(downloadsDir, f));
        const ageMs = Date.now() - stat.mtimeMs;
        return ageMs < 24 * 60 * 60 * 1000; // last 24 hours
      } catch {
        return false;
      }
    });

    if (recentFiles.length >= 10) {
      raiseAlert({
        type: 'file_change',
        title: 'New Downloads Detected',
        message: `${recentFiles.length} new files in Downloads folder today. Want me to organize them?`,
        priority: 'low',
        suggestedAction: `Sort and organize ${recentFiles.length} files in Downloads`,
        metadata: JSON.stringify({ count: recentFiles.length, path: downloadsDir }),
      });
    }
  } catch (err) {
    log.warn(`Downloads check failed: ${err}`);
  }
}

function startFileWatchers(): void {
  try {
    const watchers = listFileWatchers();
    for (const config of watchers) {
      if (config.status !== 'active') {
        continue;
      }
      if (!fs.existsSync(config.path)) {
        continue;
      }

      try {
        const watcher = fs.watch(config.path, { recursive: false }, (eventType, filename) => {
          if (!filename) {
            return;
          }
          const matchesPattern =
            config.patterns.length === 0 ||
            config.patterns.some((p) => filename.includes(p) || filename.endsWith(p));

          if (matchesPattern) {
            raiseAlert({
              type: 'file_change',
              title: `File ${eventType}: ${filename}`,
              message: `Detected ${eventType} on "${filename}" in ${config.path}. ${config.action || 'Would you like me to take action?'}`,
              priority: 'low',
              suggestedAction: config.action || undefined,
              metadata: JSON.stringify({ watcherId: config.id, filename, eventType }),
            });
          }
        });
        activeWatchers.set(config.id, watcher);
      } catch (err) {
        log.warn(`Failed to start watcher ${config.id}: ${err}`);
      }
    }
  } catch (err) {
    log.warn(`Failed to load file watchers: ${err}`);
  }
}

function raiseAlert(input: ProactiveAlertCreateInput): void {
  // Deduplicate: don't create if a similar pending alert exists
  const existing = listAlerts('pending', 20);
  const isDuplicate = existing.some((a) => a.type === input.type && a.title === input.title);
  if (isDuplicate) {
    return;
  }
  createAlert(input);
  log.info(`Proactive alert: ${input.title}`);
}

export function getDefaultProactiveConfig(): ProactiveConfig {
  return { ...DEFAULT_CONFIG };
}
