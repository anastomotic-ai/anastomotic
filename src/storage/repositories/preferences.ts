import { getDatabase } from '../database.js';
import type {
  BehavioralPreference,
  PreferenceCreateInput,
  PreferenceKey,
} from '../../common/types/memory.js';

function createPrefId(): string {
  return `pref_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function rowToPreference(row: Record<string, unknown>): BehavioralPreference {
  return {
    id: row.id as string,
    workspaceId: (row.workspace_id as string) || null,
    key: row.key as PreferenceKey,
    label: row.label as string,
    value: row.value as string,
    confidence: row.confidence as number,
    observedCount: row.observed_count as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function listPreferences(workspaceId?: string): BehavioralPreference[] {
  const db = getDatabase();
  if (workspaceId) {
    const rows = db
      .prepare(
        'SELECT * FROM behavioral_preferences WHERE workspace_id = ? OR workspace_id IS NULL ORDER BY confidence DESC',
      )
      .all(workspaceId) as Record<string, unknown>[];
    return rows.map(rowToPreference);
  }
  const rows = db
    .prepare('SELECT * FROM behavioral_preferences ORDER BY confidence DESC')
    .all() as Record<string, unknown>[];
  return rows.map(rowToPreference);
}

export function getPreference(id: string): BehavioralPreference | null {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM behavioral_preferences WHERE id = ?').get(id) as
    | Record<string, unknown>
    | undefined;
  return row ? rowToPreference(row) : null;
}

export function upsertPreference(input: PreferenceCreateInput): BehavioralPreference {
  const db = getDatabase();
  const wsId = input.workspaceId || null;

  // Check if similar preference exists
  const existing = db
    .prepare(
      'SELECT * FROM behavioral_preferences WHERE key = ? AND (workspace_id = ? OR (workspace_id IS NULL AND ? IS NULL))',
    )
    .get(input.key, wsId, wsId) as Record<string, unknown> | undefined;

  const now = new Date().toISOString();

  if (existing) {
    const newCount = (existing.observed_count as number) + 1;
    const newConfidence = Math.min((existing.confidence as number) + 0.1, 1.0);
    db.prepare(
      'UPDATE behavioral_preferences SET value = ?, label = ?, confidence = ?, observed_count = ?, updated_at = ? WHERE id = ?',
    ).run(input.value, input.label, newConfidence, newCount, now, existing.id as string);
    return getPreference(existing.id as string)!;
  }

  const id = createPrefId();
  db.prepare(
    `INSERT INTO behavioral_preferences (id, workspace_id, key, label, value, confidence, observed_count, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 0.5, 1, ?, ?)`,
  ).run(id, wsId, input.key, input.label, input.value, now, now);
  return getPreference(id)!;
}

export function deletePreference(id: string): boolean {
  const db = getDatabase();
  const result = db.prepare('DELETE FROM behavioral_preferences WHERE id = ?').run(id);
  return result.changes > 0;
}

export function getPreferencesForPrompt(workspaceId: string): string {
  const prefs = listPreferences(workspaceId).filter((p) => p.confidence >= 0.3);
  if (prefs.length === 0) {
    return '';
  }

  const lines = prefs.map(
    (p) => `- **${p.label}**: ${p.value} (confidence: ${Math.round(p.confidence * 100)}%)`,
  );

  return `\n## User Preferences\n${lines.join('\n')}`;
}
