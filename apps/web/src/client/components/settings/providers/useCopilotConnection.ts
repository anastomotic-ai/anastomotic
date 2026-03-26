import { useState, useEffect } from 'react';
import type { ConnectedProvider } from '@anastomotic_ai/agent-core/common';
import { COPILOT_MODELS } from '@anastomotic_ai/agent-core/common';
import { getAnastomotic } from '@/lib/anastomotic';
import { createLogger } from '@/lib/logger';

const logger = createLogger('useCopilotConnection');

interface UseCopilotConnectionOptions {
  isConnected: boolean;
  onConnect: (provider: ConnectedProvider) => void;
  onDisconnect: () => void;
}

function buildCopilotProvider(): ConnectedProvider {
  return {
    providerId: 'copilot',
    connectionStatus: 'connected',
    credentials: { type: 'copilot-oauth' },
    selectedModelId: 'copilot/gpt-4o',
    lastConnectedAt: new Date().toISOString(),
    availableModels: COPILOT_MODELS.map((m) => ({
      id: m.id,
      name: m.displayName,
    })),
  };
}

export function useCopilotConnection({
  isConnected,
  onConnect,
  onDisconnect,
}: UseCopilotConnectionOptions) {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userCode, setUserCode] = useState<string | null>(null);
  const [verificationUri, setVerificationUri] = useState<string | null>(null);

  // Check initial status on mount
  useEffect(() => {
    const anastomotic = getAnastomotic();
    anastomotic
      .getCopilotOAuthStatus()
      .then((status) => {
        if (status.connected && !isConnected) {
          onConnect(buildCopilotProvider());
        }
      })
      .catch((err) => {
        logger.error('Failed to check Copilot status:', err);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConnect = async () => {
    setConnecting(true);
    setError(null);
    setUserCode(null);
    setVerificationUri(null);

    let pollStarted = false;

    try {
      const anastomotic = getAnastomotic();
      const result = await anastomotic.loginGithubCopilot();

      if (!result.ok) {
        setError('Failed to start GitHub Copilot login flow.');
        setConnecting(false);
        return;
      }

      if (result.userCode) {
        setUserCode(result.userCode);
      }
      if (result.verificationUri) {
        setVerificationUri(result.verificationUri);
      }

      // Start background polling for completion
      pollStarted = true;
      const expiresIn = result.expiresIn ?? 900;
      const deadline = Date.now() + expiresIn * 1000;

      const poll = async () => {
        while (Date.now() < deadline) {
          await new Promise<void>((resolve) => setTimeout(resolve, 5000));

          try {
            const status = await anastomotic.getCopilotOAuthStatus();
            if (status.connected) {
              onConnect(buildCopilotProvider());
              setUserCode(null);
              setVerificationUri(null);
              setConnecting(false);
              return;
            }
          } catch (err) {
            logger.error('Error checking Copilot status:', err);
          }
        }
        setError('Timed out waiting for GitHub authorization. Please try again.');
        setUserCode(null);
        setVerificationUri(null);
        setConnecting(false);
      };

      void poll().catch((err) => {
        logger.error('Error polling Copilot status:', err);
        setError(err instanceof Error ? err.message : 'Connection failed');
        setConnecting(false);
      });

      return;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      if (!pollStarted) {
        setConnecting(false);
      }
    }
  };

  const handleDisconnect = async () => {
    try {
      const anastomotic = getAnastomotic();
      await anastomotic.logoutGithubCopilot();
    } catch (err) {
      logger.error('Failed to logout from Copilot:', err);
    }
    setUserCode(null);
    setVerificationUri(null);
    onDisconnect();
  };

  return {
    connecting,
    error,
    userCode,
    verificationUri,
    handleConnect,
    handleDisconnect,
  };
}
