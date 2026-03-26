/**
 * Deep memory types — long-term semantic memory, behavioral preferences,
 * and cross-workspace knowledge transfer.
 */

export type MemoryCategory = 'task_context' | 'preference' | 'pattern' | 'fact' | 'workflow';
export type MemoryScope = 'workspace' | 'global';

export interface MemoryEntry {
  id: string;
  workspaceId: string | null;
  scope: MemoryScope;
  category: MemoryCategory;
  content: string;
  keywords: string;
  relevanceScore: number;
  accessCount: number;
  lastAccessedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemoryCreateInput {
  workspaceId?: string | null;
  scope: MemoryScope;
  category: MemoryCategory;
  content: string;
  keywords?: string;
}

export interface MemorySearchResult {
  entry: MemoryEntry;
  matchScore: number;
}

export type PreferenceKey =
  | 'naming_convention'
  | 'folder_structure'
  | 'writing_style'
  | 'approval_pattern'
  | 'code_style'
  | 'communication_tone'
  | 'tool_preference'
  | 'custom';

export interface BehavioralPreference {
  id: string;
  workspaceId: string | null;
  key: PreferenceKey;
  label: string;
  value: string;
  confidence: number;
  observedCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PreferenceCreateInput {
  workspaceId?: string | null;
  key: PreferenceKey;
  label: string;
  value: string;
}

export interface MemoryStats {
  totalEntries: number;
  globalEntries: number;
  workspaceEntries: number;
  preferences: number;
  topCategories: Array<{ category: MemoryCategory; count: number }>;
}
