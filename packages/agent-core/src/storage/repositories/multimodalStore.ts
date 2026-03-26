import { getDatabase } from '../database.js';
import type {
  MediaAttachment,
  MediaAttachmentInput,
  StructuredOutput,
  StructuredOutputInput,
} from '../../common/types/multimodal.js';

function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// --- Media Attachments ---

export function addMediaAttachment(input: MediaAttachmentInput): MediaAttachment {
  const db = getDatabase();
  const id = createId('media');
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO media_attachments (id, type, source, name, mime_type, size_bytes, width, height, duration_ms, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    input.type,
    input.source,
    input.name,
    input.mimeType,
    input.sizeBytes,
    input.width ?? null,
    input.height ?? null,
    input.durationMs ?? null,
    now,
  );
  return { id, ...input, createdAt: now };
}

export function getMediaAttachment(id: string): MediaAttachment | null {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM media_attachments WHERE id = ?').get(id) as
    | Record<string, unknown>
    | undefined;
  if (!row) {
    return null;
  }
  return rowToMedia(row);
}

export function listMediaAttachments(limit = 50): MediaAttachment[] {
  const db = getDatabase();
  const rows = db
    .prepare('SELECT * FROM media_attachments ORDER BY created_at DESC LIMIT ?')
    .all(limit) as Record<string, unknown>[];
  return rows.map(rowToMedia);
}

export function deleteMediaAttachment(id: string): boolean {
  const db = getDatabase();
  const result = db.prepare('DELETE FROM media_attachments WHERE id = ?').run(id);
  return result.changes > 0;
}

function rowToMedia(row: Record<string, unknown>): MediaAttachment {
  return {
    id: row.id as string,
    type: row.type as MediaAttachment['type'],
    source: row.source as string,
    name: row.name as string,
    mimeType: row.mime_type as string,
    sizeBytes: row.size_bytes as number,
    width: row.width as number | undefined,
    height: row.height as number | undefined,
    durationMs: row.duration_ms as number | undefined,
    thumbnailUri: row.thumbnail_uri as string | undefined,
    createdAt: row.created_at as string,
  };
}

// --- Structured Outputs ---

export function addStructuredOutput(input: StructuredOutputInput): StructuredOutput {
  const db = getDatabase();
  const id = createId('output');
  const now = new Date().toISOString();
  db.prepare(
    'INSERT INTO structured_outputs (id, task_id, output_type, title, data, created_at) VALUES (?, ?, ?, ?, ?, ?)',
  ).run(id, input.taskId, input.outputType, input.title, input.data, now);
  return { id, ...input, createdAt: now };
}

export function listStructuredOutputs(taskId: string): StructuredOutput[] {
  const db = getDatabase();
  const rows = db
    .prepare('SELECT * FROM structured_outputs WHERE task_id = ? ORDER BY created_at')
    .all(taskId) as Record<string, unknown>[];
  return rows.map((row) => ({
    id: row.id as string,
    taskId: row.task_id as string,
    outputType: row.output_type as StructuredOutput['outputType'],
    title: row.title as string,
    data: row.data as string,
    createdAt: row.created_at as string,
  }));
}

export function deleteStructuredOutput(id: string): boolean {
  const db = getDatabase();
  const result = db.prepare('DELETE FROM structured_outputs WHERE id = ?').run(id);
  return result.changes > 0;
}
