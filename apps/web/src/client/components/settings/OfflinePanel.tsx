import { useState, useEffect, useCallback, useMemo } from 'react';
import { getAnastomotic } from '@/lib/anastomotic';
import { WifiHigh, WifiSlash, Trash, Plus, Power } from '@phosphor-icons/react';
import type { LocalModelConfig, OfflineQueueItem } from '@anastomotic_ai/agent-core/common';

type Tab = 'models' | 'queue';

export function OfflinePanel() {
  const api = useMemo(() => getAnastomotic(), []);
  const [tab, setTab] = useState<Tab>('models');
  const [models, setModels] = useState<LocalModelConfig[]>([]);
  const [queue, setQueue] = useState<OfflineQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: '',
    provider: 'ollama' as const,
    modelId: '',
    endpoint: 'http://localhost:11434',
  });

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'models') {
        setModels(await api.listLocalModels());
      } else {
        setQueue(await api.listOfflineQueue());
      }
    } finally {
      setLoading(false);
    }
  }, [api, tab]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleAdd = useCallback(async () => {
    if (!form.name || !form.modelId) {
      return;
    }
    await api.addLocalModel(form);
    setForm({ name: '', provider: 'ollama', modelId: '', endpoint: 'http://localhost:11434' });
    setShowAdd(false);
    await refresh();
  }, [api, form, refresh]);

  const handleToggle = useCallback(
    async (m: LocalModelConfig) => {
      await api.toggleLocalModel(m.id, !m.enabled);
      await refresh();
    },
    [api, refresh],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await api.deleteLocalModel(id);
      await refresh();
    },
    [api, refresh],
  );

  const handleClearQueue = useCallback(async () => {
    await api.clearCompletedQueue();
    await refresh();
  }, [api, refresh]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <WifiHigh size={20} className="text-white/60" />
        <h3 className="text-base font-medium text-white">Offline-First &amp; Local Models</h3>
      </div>

      <p className="text-xs text-white/50">
        Configure local AI models for offline use. Tasks queued while offline will process when
        connectivity is restored.
      </p>

      <div className="flex gap-2 border-b border-white/10 pb-1">
        {(['models', 'queue'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-xs rounded-t transition-colors ${
              tab === t ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
            }`}
          >
            {t === 'models' ? 'Local Models' : 'Offline Queue'}
          </button>
        ))}
      </div>

      {loading && <div className="text-sm text-white/40">Loading...</div>}

      {!loading && tab === 'models' && (
        <ModelsList
          models={models}
          showAdd={showAdd}
          form={form}
          onToggleAdd={() => setShowAdd(!showAdd)}
          onFormChange={setForm}
          onAdd={handleAdd}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      )}

      {!loading && tab === 'queue' && <QueueList items={queue} onClear={handleClearQueue} />}
    </div>
  );
}

function ModelsList({
  models,
  showAdd,
  form,
  onToggleAdd,
  onFormChange,
  onAdd,
  onToggle,
  onDelete,
}: {
  models: LocalModelConfig[];
  showAdd: boolean;
  form: { name: string; provider: 'ollama'; modelId: string; endpoint: string };
  onToggleAdd: () => void;
  onFormChange: (f: {
    name: string;
    provider: 'ollama';
    modelId: string;
    endpoint: string;
  }) => void;
  onAdd: () => void;
  onToggle: (m: LocalModelConfig) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <button
        onClick={onToggleAdd}
        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
      >
        <Plus size={14} /> Add Local Model
      </button>

      {showAdd && (
        <div className="space-y-2 rounded-lg border border-white/10 bg-white/5 p-3">
          <input
            value={form.name}
            onChange={(e) => onFormChange({ ...form, name: e.target.value })}
            placeholder="Model name"
            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white placeholder:text-white/30"
          />
          <input
            value={form.modelId}
            onChange={(e) => onFormChange({ ...form, modelId: e.target.value })}
            placeholder="Model ID (e.g. llama3)"
            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white placeholder:text-white/30"
          />
          <input
            value={form.endpoint}
            onChange={(e) => onFormChange({ ...form, endpoint: e.target.value })}
            placeholder="Endpoint URL"
            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white placeholder:text-white/30"
          />
          <button
            onClick={onAdd}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-500"
          >
            Add
          </button>
        </div>
      )}

      {models.length === 0 && <p className="text-xs text-white/30">No local models configured.</p>}

      {models.map((m) => (
        <div
          key={m.id}
          className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3"
        >
          <div>
            <p className="text-sm text-white">{m.name}</p>
            <p className="text-xs text-white/40">
              {m.provider} &middot; {m.modelId}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggle(m)}
              className={m.enabled ? 'text-green-400' : 'text-white/30'}
            >
              <Power size={16} />
            </button>
            <button onClick={() => onDelete(m.id)} className="text-red-400 hover:text-red-300">
              <Trash size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function QueueList({ items, onClear }: { items: OfflineQueueItem[]; onClear: () => void }) {
  const statusColors: Record<string, string> = {
    queued: 'text-yellow-400',
    processing: 'text-blue-400',
    completed: 'text-green-400',
    failed: 'text-red-400',
  };

  return (
    <div className="space-y-3">
      {items.length > 0 && (
        <button onClick={onClear} className="text-xs text-white/40 hover:text-white/60">
          Clear completed
        </button>
      )}

      {items.length === 0 && <p className="text-xs text-white/30">Offline queue is empty.</p>}

      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3"
        >
          <div className="flex items-center gap-3">
            <WifiSlash size={16} className="text-white/40" />
            <div>
              <p className="text-sm text-white truncate max-w-[300px]">{item.taskPrompt}</p>
              <p className={`text-xs ${statusColors[item.status] ?? 'text-white/40'}`}>
                {item.status}
              </p>
            </div>
          </div>
          <p className="text-xs text-white/30">{new Date(item.createdAt).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}
