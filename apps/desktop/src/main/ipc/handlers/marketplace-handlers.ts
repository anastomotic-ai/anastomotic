import type { IpcMainInvokeEvent } from 'electron';
import {
  getMarketplaceCatalog,
  searchMarketplace,
  type MarketplaceCategory,
} from '@anastomotic_ai/agent-core';
import { skillsManager } from '../../skills';
import { handle } from './utils';

export function registerMarketplaceHandlers(): void {
  handle('marketplace:catalog', async () => {
    return getMarketplaceCatalog();
  });

  handle(
    'marketplace:search',
    async (_event: IpcMainInvokeEvent, query: string, category?: MarketplaceCategory) => {
      return searchMarketplace(query, category);
    },
  );

  handle('marketplace:install', async (_event: IpcMainInvokeEvent, githubUrl: string) => {
    return skillsManager.addFromGitHub(githubUrl);
  });
}
