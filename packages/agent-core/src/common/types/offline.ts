export type OfflineStatus = 'online' | 'offline' | 'degraded';

export type SyncState = 'synced' | 'pending' | 'failed';

export interface LocalModelConfig {
  id: string;
  name: string;
  provider: 'ollama' | 'lmstudio' | 'custom';
  modelId: string;
  endpoint: string;
  contextLength: number;
  isDefault: boolean;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LocalModelCreateInput {
  name: string;
  provider: 'ollama' | 'lmstudio' | 'custom';
  modelId: string;
  endpoint: string;
  contextLength?: number;
  isDefault?: boolean;
}

export interface OfflineQueueItem {
  id: string;
  taskPrompt: string;
  priority: number;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  localModelId: string | null;
  errorMessage: string | null;
  createdAt: string;
  processedAt: string | null;
}

export interface OfflineQueueInput {
  taskPrompt: string;
  priority?: number;
  localModelId?: string;
}

export interface OfflineConfig {
  autoFallback: boolean;
  preferLocal: boolean;
  syncOnReconnect: boolean;
  offlineStatus: OfflineStatus;
}
