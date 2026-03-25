import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createLogger } from '@/lib/logger';

const logger = createLogger('WebhooksPanel');

interface WebhookConfig {
  url: string;
  label: string;
  events: string[];
  enabled: boolean;
}

const ALL_EVENTS = ['task.completed', 'task.failed', 'task.started'] as const;
const EVENT_LABELS: Record<string, string> = {
  'task.completed': 'Task Completed',
  'task.failed': 'Task Failed',
  'task.started': 'Task Started',
};

export function WebhooksPanel() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingIdx, setTestingIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!window.anastomotic?.getWebhooks) {
      setLoading(false);
      return;
    }
    window.anastomotic
      .getWebhooks()
      .then(setWebhooks)
      .catch((err: unknown) => logger.error('Failed to load webhooks:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = useCallback(async () => {
    if (!window.anastomotic?.saveWebhooks) {
      return;
    }
    setSaving(true);
    try {
      await window.anastomotic.saveWebhooks(webhooks);
    } catch (err) {
      logger.error('Failed to save webhooks:', err);
    } finally {
      setSaving(false);
    }
  }, [webhooks]);

  const handleAdd = useCallback(() => {
    setWebhooks((prev) => [
      ...prev,
      { url: '', label: '', events: ['task.completed', 'task.failed'], enabled: true },
    ]);
  }, []);

  const handleRemove = useCallback((index: number) => {
    setWebhooks((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleUpdate = useCallback((index: number, field: keyof WebhookConfig, value: unknown) => {
    setWebhooks((prev) =>
      prev.map((w, i) => (i === index ? { ...w, [field]: value } : w)),
    );
  }, []);

  const handleToggleEvent = useCallback((index: number, event: string) => {
    setWebhooks((prev) =>
      prev.map((w, i) => {
        if (i !== index) {
          return w;
        }
        const events = w.events.includes(event)
          ? w.events.filter((e) => e !== event)
          : [...w.events, event];
        return { ...w, events };
      }),
    );
  }, []);

  const handleTest = useCallback(
    async (index: number) => {
      const webhook = webhooks[index];
      if (!webhook?.url || !window.anastomotic?.testWebhook) {
        return;
      }
      setTestingIdx(index);
      try {
        await window.anastomotic.testWebhook(webhook.url, webhook.events);
      } catch (err) {
        logger.error('Webhook test failed:', err);
      } finally {
        setTestingIdx(null);
      }
    },
    [webhooks],
  );

  if (loading) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading webhooks...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Send HTTP POST notifications to Slack, Discord, or any webhook URL when tasks complete or fail.
        </p>
        <Button variant="outline" size="sm" onClick={handleAdd}>
          Add Webhook
        </Button>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {webhooks.map((webhook, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="rounded-lg border border-border bg-card p-4 space-y-3"
            >
              {/* Header row */}
              <div className="flex items-center gap-3">
                <Input
                  value={webhook.label}
                  onChange={(e) => handleUpdate(index, 'label', e.target.value)}
                  placeholder="Label (e.g. Slack #general)"
                  className="flex-1"
                />
                <button
                  onClick={() => handleUpdate(index, 'enabled', !webhook.enabled)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    webhook.enabled
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {webhook.enabled ? 'Active' : 'Disabled'}
                </button>
                <button
                  onClick={() => handleRemove(index)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* URL */}
              <Input
                value={webhook.url}
                onChange={(e) => handleUpdate(index, 'url', e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
                className="font-mono text-xs"
              />

              {/* Events */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Events:</span>
                {ALL_EVENTS.map((event) => (
                  <button
                    key={event}
                    onClick={() => handleToggleEvent(index, event)}
                    className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                      webhook.events.includes(event)
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {EVENT_LABELS[event]}
                  </button>
                ))}
                <div className="flex-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTest(index)}
                  disabled={!webhook.url || testingIdx === index}
                  className="text-xs"
                >
                  {testingIdx === index ? 'Sending...' : 'Test'}
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {webhooks.length === 0 && (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            No webhooks configured. Click "Add Webhook" to create one.
          </div>
        )}
      </div>

      {webhooks.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Webhooks'}
          </Button>
        </div>
      )}
    </div>
  );
}
