import type { IpcMainInvokeEvent } from 'electron';
import { sanitizeString } from '@anastomotic_ai/agent-core';
import { handle } from './utils';
import { getGitRepoInfo } from './git-utils';

export interface GitRepoInfo {
  branch: string;
  remoteUrl: string | null;
  isDirty: boolean;
  uncommittedCount: number;
  recentCommits: string[];
}

export function registerGitHandlers(): void {
  handle(
    'git:repo-info',
    async (_event: IpcMainInvokeEvent, directory: string): Promise<GitRepoInfo | null> => {
      const dir = sanitizeString(directory, 'directory', 1024);
      return getGitRepoInfo(dir);
    },
  );
}
