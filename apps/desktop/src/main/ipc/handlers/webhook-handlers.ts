import type { IpcMainInvokeEvent } from 'electron';
import {
  getWebhookUrls,
  setWebhookUrls,
  fireWebhooks,
  type WebhookConfig,
  type WebhookEvent,
} from '@anastomotic_ai/agent-core';
import { handle } from './utils';

export function registerWebhookHandlers(): void {
  handle('webhooks:list', async () => {
    return getWebhookUrls();
  });

  handle('webhooks:save', async (_event: IpcMainInvokeEvent, webhooks: WebhookConfig[]) => {
    setWebhookUrls(webhooks);
  });

  handle(
    'webhooks:test',
    async (_event: IpcMainInvokeEvent, url: string, events: WebhookEvent[]) => {
      await fireWebhooks({
        event: events[0] || 'task.completed',
        timestamp: new Date().toISOString(),
        task: {
          id: 'test-webhook',
          prompt: 'This is a test notification from Anastomotic',
          status: 'completed',
          result: 'Webhook test successful',
        },
      });
    },
  );
}
