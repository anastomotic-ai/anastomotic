// Notification webhook service — fires HTTP POST on task events

import { validateHttpUrl } from '../utils/url.js';
import {
  getWebhookUrls,
  type WebhookConfig,
  type WebhookEvent,
} from '../storage/repositories/appSettings.js';
import { createConsoleLogger } from '../utils/logging.js';

const log = createConsoleLogger({ prefix: 'WebhookService' });

export type { WebhookConfig, WebhookEvent };

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  task: {
    id: string;
    prompt: string;
    status: string;
    result?: string;
    error?: string;
  };
}

export async function fireWebhooks(payload: WebhookPayload): Promise<void> {
  const webhooks = getWebhookUrls();
  const matching = webhooks.filter((w) => w.enabled && w.events.includes(payload.event));

  if (matching.length === 0) {
    return;
  }

  const results = await Promise.allSettled(
    matching.map((webhook) => sendWebhook(webhook, payload)),
  );

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === 'rejected') {
      log.error(`[WebhookService] Failed to send to ${matching[i].label}: ${result.reason}`);
    }
  }
}

async function sendWebhook(webhook: WebhookConfig, payload: WebhookPayload): Promise<void> {
  if (!validateHttpUrl(webhook.url)) {
    throw new Error(`Invalid webhook URL: ${webhook.url}`);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } finally {
    clearTimeout(timeout);
  }
}
