/**
 * WhatsApp IPC handlers
 *
 * Registers handlers for WhatsApp connection lifecycle, config retrieval,
 * and bridges service events to the renderer over IPC push channels.
 */
import type { IpcMainInvokeEvent } from 'electron';
import { getStorage } from '../../store/storage';
import {
  getOrCreateWhatsAppService,
  getWhatsAppService,
  disposeWhatsAppService,
  setActiveWhatsAppBridge,
  getActiveWhatsAppBridge,
} from '../../services/whatsapp/singleton';
import { wireTaskBridge, wireStatusListeners } from '../../services/whatsapp/wireTaskBridge';
import type { MessagingConnectionStatus } from '@anastomotic_ai/agent-core/common';
import { handle } from './utils';

// Per-renderer named handler maps — keyed by webContents id
const _qrHandlers = new Map<number, (qr: string) => void>();
const _statusHandlers = new Map<number, (status: MessagingConnectionStatus) => void>();
const _phoneNumberHandlers = new Map<number, (phoneNumber: string) => void>();

export function registerWhatsAppHandlers(): void {
  const storage = getStorage();

  // Get persisted WhatsApp config
  handle('integrations:whatsapp:get-config', async (_event: IpcMainInvokeEvent) => {
    const config = storage.getMessagingConfig();
    const wa = config?.integrations?.whatsapp;
    if (!wa) {
      return null;
    }
    return {
      providerId: 'whatsapp',
      enabled: wa.enabled,
      status: wa.connectionStatus ?? 'disconnected',
      phoneNumber: wa.phoneNumber,
      lastConnectedAt: wa.lastConnectedAt,
    };
  });

  // Connect (start Baileys, wire events to renderer)
  handle('integrations:whatsapp:connect', async (event: IpcMainInvokeEvent) => {
    const service = getOrCreateWhatsAppService();

    const sender = event.sender;
    const senderId = sender.id;

    // Remove stale per-renderer listeners
    const prevQr = _qrHandlers.get(senderId);
    if (prevQr) {
      service.off('qr', prevQr);
      _qrHandlers.delete(senderId);
    }
    const prevStatus = _statusHandlers.get(senderId);
    if (prevStatus) {
      service.off('status', prevStatus);
      _statusHandlers.delete(senderId);
    }
    const prevPhone = _phoneNumberHandlers.get(senderId);
    if (prevPhone) {
      service.off('phoneNumber', prevPhone);
      _phoneNumberHandlers.delete(senderId);
    }

    const QR_EXPIRY_MS = 60_000;

    const qrHandler = (qr: string): void => {
      if (!sender.isDestroyed()) {
        sender.send('integrations:whatsapp:qr', { qr, expiresAt: Date.now() + QR_EXPIRY_MS });
      }
    };
    _qrHandlers.set(senderId, qrHandler);
    service.on('qr', qrHandler);

    const statusHandler = (status: MessagingConnectionStatus): void => {
      if (!sender.isDestroyed()) {
        const current = storage.getMessagingConfig();
        const phone = current?.integrations?.whatsapp?.phoneNumber;
        sender.send('integrations:whatsapp:status', { status, phone });
      }
      // Persist the updated status
      const current = storage.getMessagingConfig();
      storage.setMessagingConfig({
        integrations: {
          ...(current?.integrations ?? {}),
          whatsapp: {
            platform: 'whatsapp',
            enabled: true,
            tunnelEnabled: false,
            ...(current?.integrations?.whatsapp ?? {}),
            connectionStatus: status,
          },
        },
      });
    };
    _statusHandlers.set(senderId, statusHandler);
    service.on('status', statusHandler);

    const phoneNumberHandler = (phoneNumber: string): void => {
      const current = storage.getMessagingConfig();
      storage.setMessagingConfig({
        integrations: {
          ...(current?.integrations ?? {}),
          whatsapp: {
            platform: 'whatsapp',
            enabled: true,
            tunnelEnabled: false,
            ...(current?.integrations?.whatsapp ?? {}),
            phoneNumber,
            connectionStatus: 'connected',
            lastConnectedAt: Date.now(),
          },
        },
      });
    };
    _phoneNumberHandlers.set(senderId, phoneNumberHandler);
    service.on('phoneNumber', phoneNumberHandler);

    // Wire the task bridge
    const existingBridge = getActiveWhatsAppBridge();
    if (!existingBridge) {
      const { bridge } = wireTaskBridge(service);
      bridge.setEnabled(storage.getMessagingConfig()?.integrations?.whatsapp?.enabled ?? true);
      wireStatusListeners(service, storage, bridge);
      setActiveWhatsAppBridge(bridge);
    }

    await service.connect();
  });

  // Disconnect
  handle('integrations:whatsapp:disconnect', async (_event: IpcMainInvokeEvent) => {
    const service = getWhatsAppService();
    if (service) {
      await service.disconnect();
    }
    disposeWhatsAppService();

    // Clear persisted config
    const current = storage.getMessagingConfig();
    if (current?.integrations?.whatsapp) {
      const { whatsapp: _removed, ...rest } = current.integrations;
      storage.setMessagingConfig({ integrations: rest });
    }
  });

  // Toggle enabled flag
  handle(
    'integrations:whatsapp:set-enabled',
    async (_event: IpcMainInvokeEvent, enabled: boolean) => {
      const current = storage.getMessagingConfig();
      storage.setMessagingConfig({
        integrations: {
          ...(current?.integrations ?? {}),
          whatsapp: {
            ...(current?.integrations?.whatsapp ?? {}),
            platform: 'whatsapp',
            enabled,
            tunnelEnabled: false,
          },
        },
      });
      getActiveWhatsAppBridge()?.setEnabled(enabled);
    },
  );
}
