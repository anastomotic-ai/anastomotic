import { getDatabase } from '../database.js';
import type {
  MemoryEntry,
  MemoryCreateInput,
  MemorySearchResult,
  MemoryCategory,
  MemoryScope,
  MemoryStats,
} from '../../common/types/memory.js';

const MAX_MEMORY_ENTRIES = 500;
const MAX_CONTENT_LENGTH = 2000;

function createMemoryId(): string {
  return `mem_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function rowToMemory(row: Record<string, unknown>): MemoryEntry {
  return {
    id: row.id as string,
    workspaceId: (row.workspace_id as string) || null,
    scope: row.scope as MemoryScope,
    category: row.category as MemoryCategory,
    content: row.content as string,
    keywords: (row.keywords as string) || '',
    relevanceScore: row.relevance_score as number,
    accessCount: row.access_count as number,
    lastAccessedAt: row.last_accessed_at as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function createMemoryEntry(input: MemoryCreateInput): MemoryEntry {
  const db = getDatabase();
  const count = db.prepare('SELECT COUNT(*) as cnt FROM memory_entries').get() as { cnt: number };

  if (count.cnt >= MAX_MEMORY_ENTRIES) {
    // Remove oldest low-relevance entry
    db.prepare(
      `DELETE FROM memory_entries WHERE id = (
        SELECT id FROM memory_entries ORDER BY relevance_score ASC, last_accessed_at ASC LIMIT 1
      )`,
    ).run();
  }

  const content = input.content.slice(0, MAX_CONTENT_LENGTH);
  const keywords = (input.keywords || extractKeywords(content)).slice(0, 500);
  const id = createMemoryId();
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO memory_entries (id, workspace_id, scope, category, content, keywords, relevance_score, access_count, last_accessed_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 1.0, 0, ?, ?, ?)`,
  ).run(
    id,
    input.workspaceId || null,
    input.scope,
    input.category,
    content,
    keywords,
    now,
    now,
    now,
  );

  return getMemoryEntry(id)!;
}

export function getMemoryEntry(id: string): MemoryEntry | null {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM memory_entries WHERE id = ?').get(id) as
    | Record<string, unknown>
    | undefined;
  return row ? rowToMemory(row) : null;
}

export function listMemoryEntries(
  workspaceId?: string,
  scope?: MemoryScope,
  category?: MemoryCategory,
  limit = 50,
): MemoryEntry[] {
  const db = getDatabase();
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (workspaceId) {
    conditions.push('(workspace_id = ? OR scope = ?)');
    params.push(workspaceId, 'global');
  }
  if (scope) {
    conditions.push('scope = ?');
    params.push(scope);
  }
  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  params.push(limit);

  const rows = db
    .prepare(
      `SELECT * FROM memory_entries ${where} ORDER BY relevance_score DESC, updated_at DESC LIMIT ?`,
    )
    .all(...params) as Record<string, unknown>[];
  return rows.map(rowToMemory);
}

export function searchMemory(
  query: string,
  workspaceId?: string,
  limit = 10,
): MemorySearchResult[] {
  const db = getDatabase();
  const queryTerms = extractKeywords(query).toLowerCase().split(' ').filter(Boolean);
  if (queryTerms.length === 0) {
    return [];
  }

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (workspaceId) {
    conditions.push('(workspace_id = ? OR scope = ?)');
    params.push(workspaceId, 'global');
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = db
    .prepare(
      `SELECT * FROM memory_entries ${where} ORDER BY relevance_score DESC, updated_at DESC LIMIT 200`,
    )
    .all(...params) as Record<string, unknown>[];

  const scored = rows
    .map((row) => {
      const entry = rowToMemory(row);
      const matchScore = computeMatchScore(entry, queryTerms);
      return { entry, matchScore };
    })
    .filter((r) => r.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);

  // Bump access count for top results
  for (const result of scored.slice(0, 3)) {
    touchMemoryEntry(result.entry.id);
  }

  return scored;
}

export function deleteMemoryEntry(id: string): boolean {
  const db = getDatabase();
  const result = db.prepare('DELETE FROM memory_entries WHERE id = ?').run(id);
  return result.changes > 0;
}

export function clearMemoryEntries(workspaceId?: string): void {
  const db = getDatabase();
  if (workspaceId) {
    db.prepare('DELETE FROM memory_entries WHERE workspace_id = ?').run(workspaceId);
  } else {
    db.prepare('DELETE FROM memory_entries').run();
  }
}

function touchMemoryEntry(id: string): void {
  const db = getDatabase();
  const now = new Date().toISOString();
  db.prepare(
    'UPDATE memory_entries SET access_count = access_count + 1, last_accessed_at = ?, relevance_score = MIN(relevance_score + 0.1, 5.0) WHERE id = ?',
  ).run(now, id);
}

function extractKeywords(text: string): string {
  const stopWords = new Set([
    'the',
    'a',
    'an',
    'is',
    'are',
    'was',
    'were',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'and',
    'or',
    'but',
    'not',
    'it',
    'this',
    'that',
    'with',
    'from',
    'by',
    'as',
  ]);
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w))
    .slice(0, 30)
    .join(' ');
}

function computeMatchScore(entry: MemoryEntry, queryTerms: string[]): number {
  const contentLower = entry.content.toLowerCase();
  const keywordsLower = entry.keywords.toLowerCase();
  let score = 0;
  for (const term of queryTerms) {
    if (contentLower.includes(term)) {
      score += 2;
    }
    if (keywordsLower.includes(term)) {
      score += 3;
    }
  }
  return score * entry.relevanceScore;
}

export function getMemoryStats(workspaceId?: string): MemoryStats {
  const db = getDatabase();
  const total = db.prepare('SELECT COUNT(*) as cnt FROM memory_entries').get() as { cnt: number };
  const global = db
    .prepare("SELECT COUNT(*) as cnt FROM memory_entries WHERE scope = 'global'")
    .get() as { cnt: number };
  const wsCount = workspaceId
    ? (
        db
          .prepare('SELECT COUNT(*) as cnt FROM memory_entries WHERE workspace_id = ?')
          .get(workspaceId) as { cnt: number }
      ).cnt
    : total.cnt - global.cnt;
  const cats = db
    .prepare(
      'SELECT category, COUNT(*) as cnt FROM memory_entries GROUP BY category ORDER BY cnt DESC',
    )
    .all() as Array<{ category: string; cnt: number }>;
  const prefCount = db.prepare('SELECT COUNT(*) as cnt FROM behavioral_preferences').get() as {
    cnt: number;
  };

  return {
    totalEntries: total.cnt,
    globalEntries: global.cnt,
    workspaceEntries: wsCount,
    preferences: prefCount.cnt,
    topCategories: cats.map((c) => ({ category: c.category as MemoryCategory, count: c.cnt })),
  };
}

export function getMemoryForPrompt(workspaceId: string): string {
  const entries = listMemoryEntries(workspaceId, undefined, undefined, 20);
  if (entries.length === 0) {
    return '';
  }

  const grouped: Record<string, string[]> = {};
  for (const entry of entries) {
    const key = entry.category;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(`- ${entry.content}`);
  }

  const sections = Object.entries(grouped)
    .map(([cat, items]) => `### ${cat.replace('_', ' ')}\n${items.join('\n')}`)
    .join('\n\n');

  return `\n## Deep Memory\n${sections}`;
}
