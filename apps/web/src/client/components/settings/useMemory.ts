import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  MemoryEntry,
  MemoryStats,
  BehavioralPreference,
} from '@anastomotic_ai/agent-core/common';
import { getAnastomotic } from '@/lib/anastomotic';
import { useWorkspaceStore } from '@/stores/workspaceStore';

export function useMemory() {
  const api = useMemo(() => getAnastomotic(), []);
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [stats, setStats] = useState<MemoryStats | null>(null);
  const [preferences, setPreferences] = useState<BehavioralPreference[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MemoryEntry[]>([]);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  const loadMemories = useCallback(async () => {
    setIsLoading(true);
    try {
      const [mems, st, prefs] = await Promise.all([
        api.listMemories(activeWorkspaceId || undefined),
        api.getMemoryStats(activeWorkspaceId || undefined),
        api.listPreferences(activeWorkspaceId || undefined),
      ]);
      setMemories(mems);
      setStats(st);
      setPreferences(prefs);
    } finally {
      setIsLoading(false);
    }
  }, [api, activeWorkspaceId]);

  useEffect(() => {
    loadMemories();
  }, [loadMemories]);

  const search = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }
      const results = await api.searchMemory(query, activeWorkspaceId || undefined);
      setSearchResults(results.map((r: { entry: MemoryEntry }) => r.entry));
    },
    [api, activeWorkspaceId],
  );

  const deleteMemory = useCallback(
    async (id: string) => {
      await api.deleteMemory(id);
      await loadMemories();
    },
    [api, loadMemories],
  );

  const deletePreference = useCallback(
    async (id: string) => {
      await api.deletePreference(id);
      await loadMemories();
    },
    [api, loadMemories],
  );

  const clearAll = useCallback(async () => {
    await api.clearMemories(activeWorkspaceId || undefined);
    await loadMemories();
  }, [api, activeWorkspaceId, loadMemories]);

  return {
    memories,
    stats,
    preferences,
    isLoading,
    searchQuery,
    searchResults,
    search,
    deleteMemory,
    deletePreference,
    clearAll,
    refresh: loadMemories,
  };
}
