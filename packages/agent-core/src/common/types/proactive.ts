/**
 * Proactive agent types — file watchers, alerts, and anomaly detection.
 */

export type AlertType =
  | 'file_change'
  | 'disk_space'
  | 'schedule_reminder'
  | 'anomaly'
  | 'suggestion';
export type AlertPriority = 'low' | 'medium' | 'high';
export type AlertStatus = 'pending' | 'dismissed' | 'acted';
export type WatcherStatus = 'active' | 'paused' | 'error';

export interface FileWatcherConfig {
  id: string;
  name: string;
  path: string;
  patterns: string[];
  action: string;
  status: WatcherStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FileWatcherCreateInput {
  name: string;
  path: string;
  patterns: string[];
  action: string;
}

export interface ProactiveAlert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  priority: AlertPriority;
  status: AlertStatus;
  suggestedAction?: string;
  metadata?: string;
  createdAt: string;
}

export interface ProactiveAlertCreateInput {
  type: AlertType;
  title: string;
  message: string;
  priority: AlertPriority;
  suggestedAction?: string;
  metadata?: string;
}

export interface ProactiveConfig {
  enabled: boolean;
  watchDownloads: boolean;
  watchDesktop: boolean;
  diskSpaceThreshold: number;
  checkIntervalMinutes: number;
}
