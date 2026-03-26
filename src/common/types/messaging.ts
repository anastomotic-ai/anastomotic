/**
 * Messaging integration types — WhatsApp, Slack, Telegram, Teams
 *
 * Defines the common interface for messaging platform integrations,
 * connection lifecycle status, and channel adapter contract.
 */

export type MessagingProviderId = 'whatsapp' | 'slack' | 'telegram' | 'teams';

export type MessagingConnectionStatus =
  | 'connecting'
  | 'qr_ready'
  | 'connected'
  | 'disconnected'
  | 'logged_out'
  | 'reconnecting';

export interface MessagingIntegrationConfig {
  platform: MessagingProviderId;
  enabled: boolean;
  tunnelEnabled: boolean;
  phoneNumber?: string;
  connectionStatus?: MessagingConnectionStatus;
  lastConnectedAt?: number;
}

export interface MessagingConfig {
  integrations: Record<string, MessagingIntegrationConfig>;
}

export interface MessagingQRCode {
  qrString: string;
  expiresAt: number;
}

export interface IncomingMessage {
  messageId: string;
  senderId: string;
  senderName?: string;
  text: string;
  timestamp: number;
  platform: MessagingProviderId;
  isGroup: boolean;
  isFromMe: boolean;
}

export interface ChannelAdapter {
  readonly channelType: MessagingProviderId;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  sendMessage(recipientId: string, text: string): Promise<void>;
  getStatus(): MessagingConnectionStatus;
  dispose(): void;
}
