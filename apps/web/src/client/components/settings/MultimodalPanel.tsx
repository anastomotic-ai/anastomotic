import { useState, useEffect, useCallback, useMemo } from 'react';
import { getAnastomotic } from '@/lib/anastomotic';
import { Image, Trash, FileText } from '@phosphor-icons/react';
import type { MediaAttachment, StructuredOutput } from '@anastomotic_ai/agent-core/common';

type Tab = 'attachments' | 'outputs';

export function MultimodalPanel() {
  const api = useMemo(() => getAnastomotic(), []);
  const [tab, setTab] = useState<Tab>('attachments');
  const [taskId, setTaskId] = useState('');
  const [attachments, setAttachments] = useState<MediaAttachment[]>([]);
  const [outputs, setOutputs] = useState<StructuredOutput[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAttachments = useCallback(async () => {
    setLoading(true);
    try {
      setAttachments(await api.listMediaAttachments());
    } finally {
      setLoading(false);
    }
  }, [api]);

  const loadOutputs = useCallback(
    async (tid: string) => {
      if (!tid) {
        return;
      }
      setLoading(true);
      try {
        setOutputs(await api.listStructuredOutputs(tid));
      } finally {
        setLoading(false);
      }
    },
    [api],
  );

  useEffect(() => {
    if (tab === 'attachments') {
      loadAttachments();
    } else {
      loadOutputs(taskId);
    }
  }, [tab, taskId, loadAttachments, loadOutputs]);

  const handleDeleteAttachment = useCallback(
    async (id: string) => {
      await api.deleteMediaAttachment(id);
      await loadAttachments();
    },
    [api, loadAttachments],
  );

  const handleDeleteOutput = useCallback(
    async (id: string) => {
      await api.deleteStructuredOutput(id);
      await loadOutputs(taskId);
    },
    [api, taskId, loadOutputs],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Image size={20} className="text-white/60" />
        <h3 className="text-base font-medium text-white">Multi-Modal Input/Output</h3>
      </div>

      <p className="text-xs text-white/50">
        Attach images, audio, and files to tasks. View structured outputs like charts and tables.
      </p>

      <div className="flex gap-2 border-b border-white/10 pb-1">
        {(['attachments', 'outputs'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-xs rounded-t transition-colors ${
              tab === t ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
            }`}
          >
            {t === 'attachments' ? 'Attachments' : 'Structured Outputs'}
          </button>
        ))}
      </div>

      {loading && <div className="text-sm text-white/40">Loading...</div>}

      {!loading && tab === 'attachments' && (
        <AttachmentList items={attachments} onDelete={handleDeleteAttachment} />
      )}

      {!loading && tab === 'outputs' && (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-white/50 mb-1 block">Task ID</label>
            <input
              type="text"
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              placeholder="Enter task ID to view outputs"
              className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30"
            />
          </div>
          <OutputList items={outputs} onDelete={handleDeleteOutput} />
        </div>
      )}
    </div>
  );
}

function AttachmentList({
  items,
  onDelete,
}: {
  items: MediaAttachment[];
  onDelete: (id: string) => void;
}) {
  if (items.length === 0) {
    return <p className="text-xs text-white/30">No attachments for this task.</p>;
  }

  return (
    <div className="space-y-2">
      {items.map((a) => (
        <div
          key={a.id}
          className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3"
        >
          <div className="flex items-center gap-3">
            <FileText size={16} className="text-white/40" />
            <div>
              <p className="text-sm text-white">{a.name}</p>
              <p className="text-xs text-white/40">
                {a.type} &middot; {a.mimeType}
              </p>
            </div>
          </div>
          <button onClick={() => onDelete(a.id)} className="text-red-400 hover:text-red-300">
            <Trash size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

function OutputList({
  items,
  onDelete,
}: {
  items: StructuredOutput[];
  onDelete: (id: string) => void;
}) {
  if (items.length === 0) {
    return <p className="text-xs text-white/30">No structured outputs for this task.</p>;
  }

  return (
    <div className="space-y-2">
      {items.map((o) => (
        <div key={o.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm text-white">{o.title}</p>
              <p className="text-xs text-white/40">{o.outputType}</p>
            </div>
            <button onClick={() => onDelete(o.id)} className="text-red-400 hover:text-red-300">
              <Trash size={16} />
            </button>
          </div>
          <pre className="text-xs text-white/60 bg-black/20 rounded p-2 overflow-auto max-h-40">
            {o.data}
          </pre>
        </div>
      ))}
    </div>
  );
}
