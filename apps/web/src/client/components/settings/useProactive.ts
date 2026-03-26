import { useState, useEffect, useCallback } from 'react';
import { getAnastomotic } from '@/lib/anastomotic';
import type {
  FileWatcherConfig,
  ProactiveAlert,
  ProactiveConfig,
} from '@anastomotic_ai/agent-core/common';

export function useProactive() {
  const [watchers, setWatchers] = useState<FileWatcherConfig[]>([]);
  const [alerts, setAlerts] = useState<ProactiveAlert[]>([]);
  const [config, setConfig] = useState<ProactiveConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const api = getAnastomotic();

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [w, a, c] = await Promise.all([
        api.listFileWatchers(),
        api.listAlerts('pending', 50),
        api.getDefaultProactiveConfig(),
      ]);
      setWatchers(w);
      setAlerts(a);
      setConfig(c);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addWatcher = useCallback(
    async (input: { name: string; path: string; patterns: string[]; action: string }) => {
      await api.createFileWatcher(input);
      await refresh();
    },
    [api, refresh],
  );

  const removeWatcher = useCallback(
    async (id: string) => {
      await api.deleteFileWatcher(id);
      await refresh();
    },
    [api, refresh],
  );

  const handleDismiss = useCallback(
    async (id: string) => {
      await api.dismissAlert(id);
      await refresh();
    },
    [api, refresh],
  );

  const toggleAgent = useCallback(
    async (enabled: boolean) => {
      if (enabled) {
        await api.startProactiveAgent({ enabled: true });
      } else {
        await api.stopProactiveAgent();
      }
    },
    [api],
  );

  return {
    watchers,
    alerts,
    config,
    loading,
    addWatcher,
    removeWatcher,
    handleDismiss,
    toggleAgent,
    refresh,
  };
}
