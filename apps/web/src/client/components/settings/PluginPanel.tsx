import { useState, useEffect, useCallback, useMemo } from 'react';
import { getAnastomotic } from '@/lib/anastomotic';
import { PuzzlePiece, Trash, Power } from '@phosphor-icons/react';
import type { InstalledPlugin } from '@anastomotic_ai/agent-core/common';

export function PluginPanel() {
  const api = useMemo(() => getAnastomotic(), []);
  const [plugins, setPlugins] = useState<InstalledPlugin[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setPlugins(await api.listPlugins());
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleToggle = useCallback(
    async (plugin: InstalledPlugin) => {
      const next = plugin.status === 'active' ? 'disabled' : 'active';
      await api.updatePluginStatus(plugin.id, next);
      await refresh();
    },
    [api, refresh],
  );

  const handleUninstall = useCallback(
    async (id: string) => {
      await api.uninstallPlugin(id);
      await refresh();
    },
    [api, refresh],
  );

  if (loading) {
    return <div className="text-sm text-white/40">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <PuzzlePiece size={20} className="text-white/60" />
        <h3 className="text-base font-medium text-white">Plugins</h3>
      </div>

      <p className="text-xs text-white/50">
        Install and manage plugins to extend Anastomotic with custom integrations and workflows.
      </p>

      <div className="space-y-2">
        {plugins.map((p) => {
          const statusColor =
            p.status === 'active'
              ? 'text-green-400'
              : p.status === 'error'
                ? 'text-red-400'
                : 'text-white/40';

          return (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{p.name}</span>
                  <span className="text-xs text-white/30">v{p.version}</span>
                  <span className={`text-[10px] font-medium ${statusColor}`}>
                    {p.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-white/50">{p.description}</p>
                <p className="text-[10px] text-white/30">by {p.author}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleToggle(p)}
                  className="rounded p-1.5 text-white/40 hover:text-white/80"
                  title={p.status === 'active' ? 'Disable' : 'Enable'}
                >
                  {p.status === 'active' ? <Power size={14} /> : <Power size={14} />}
                </button>
                <button
                  onClick={() => handleUninstall(p.id)}
                  className="rounded p-1.5 text-white/40 hover:text-red-400"
                  title="Uninstall"
                >
                  <Trash size={14} />
                </button>
              </div>
            </div>
          );
        })}
        {plugins.length === 0 && <p className="text-xs text-white/30">No plugins installed.</p>}
      </div>
    </div>
  );
}
