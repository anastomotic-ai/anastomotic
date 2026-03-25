/**
 * Lightweight git utilities that shell out to `git` and return parsed results.
 * All functions are safe to call on non-git directories — they return null.
 */

import { execFile } from 'node:child_process';

interface GitRepoInfo {
  branch: string;
  remoteUrl: string | null;
  isDirty: boolean;
  uncommittedCount: number;
  recentCommits: string[];
}

function run(cwd: string, args: string[]): Promise<string | null> {
  return new Promise((resolve) => {
    execFile('git', args, { cwd, timeout: 5000 }, (err, stdout) => {
      if (err) {
        resolve(null);
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

export async function getGitRepoInfo(cwd: string): Promise<GitRepoInfo | null> {
  // Check if this is a git repo
  const topLevel = await run(cwd, ['rev-parse', '--show-toplevel']);
  if (!topLevel) {
    return null;
  }

  const [branch, remoteUrl, status, log] = await Promise.all([
    run(cwd, ['rev-parse', '--abbrev-ref', 'HEAD']),
    run(cwd, ['remote', 'get-url', 'origin']),
    run(cwd, ['status', '--porcelain']),
    run(cwd, ['log', '--oneline', '-5', '--no-decorate']),
  ]);

  const statusLines = status ? status.split('\n').filter(Boolean) : [];

  return {
    branch: branch || 'HEAD',
    remoteUrl: remoteUrl || null,
    isDirty: statusLines.length > 0,
    uncommittedCount: statusLines.length,
    recentCommits: log ? log.split('\n').filter(Boolean) : [],
  };
}
