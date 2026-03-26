/** @vitest-environment node */

import { describe, it, expect, beforeAll, beforeEach, afterAll, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('Multimodal store', () => {
  let testDir: string;
  let dbPath: string;
  let databaseModule: typeof import('../../../src/storage/database.js') | null = null;
  let multimodalModule:
    | typeof import('../../../src/storage/repositories/multimodalStore.js')
    | null = null;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeAll(async () => {
    databaseModule = await import('../../../src/storage/database.js');
    multimodalModule = await import('../../../src/storage/repositories/multimodalStore.js');
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  beforeEach(() => {
    if (!databaseModule || !multimodalModule) {
      return;
    }
    testDir = path.join(
      os.tmpdir(),
      `mm-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
    fs.mkdirSync(testDir, { recursive: true });
    dbPath = path.join(testDir, 'test.db');
    databaseModule.initializeDatabase({ databasePath: dbPath });
  });

  afterEach(() => {
    if (databaseModule) {
      databaseModule.resetDatabaseInstance();
    }
    if (testDir && fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  // --- Media Attachments ---

  it('should add a media attachment', () => {
    if (!multimodalModule) {
      return;
    }

    const attachment = multimodalModule.addMediaAttachment({
      type: 'image',
      source: '/tmp/photo.jpg',
      name: 'photo.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 102400,
      width: 1920,
      height: 1080,
    });

    expect(attachment.id).toMatch(/^media_/);
    expect(attachment.type).toBe('image');
    expect(attachment.name).toBe('photo.jpg');
    expect(attachment.mimeType).toBe('image/jpeg');
    expect(attachment.sizeBytes).toBe(102400);
    expect(attachment.width).toBe(1920);
    expect(attachment.height).toBe(1080);
  });

  it('should get a media attachment by id', () => {
    if (!multimodalModule) {
      return;
    }

    const attachment = multimodalModule.addMediaAttachment({
      type: 'audio',
      source: '/tmp/voice.mp3',
      name: 'voice.mp3',
      mimeType: 'audio/mpeg',
      sizeBytes: 204800,
    });

    const retrieved = multimodalModule.getMediaAttachment(attachment.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.name).toBe('voice.mp3');
  });

  it('should return null for non-existent attachment', () => {
    if (!multimodalModule) {
      return;
    }

    expect(multimodalModule.getMediaAttachment('media_nonexistent')).toBeNull();
  });

  it('should list media attachments with limit', () => {
    if (!multimodalModule) {
      return;
    }

    for (let i = 0; i < 5; i++) {
      multimodalModule.addMediaAttachment({
        type: 'image',
        source: `/tmp/img${i}.png`,
        name: `img${i}.png`,
        mimeType: 'image/png',
        sizeBytes: 1024 * (i + 1),
      });
    }

    const all = multimodalModule.listMediaAttachments();
    expect(all).toHaveLength(5);

    const limited = multimodalModule.listMediaAttachments(3);
    expect(limited).toHaveLength(3);
  });

  it('should delete a media attachment', () => {
    if (!multimodalModule) {
      return;
    }

    const attachment = multimodalModule.addMediaAttachment({
      type: 'document',
      source: '/tmp/doc.pdf',
      name: 'doc.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 51200,
    });

    const deleted = multimodalModule.deleteMediaAttachment(attachment.id);
    expect(deleted).toBe(true);
    expect(multimodalModule.getMediaAttachment(attachment.id)).toBeNull();
  });

  // --- Structured Outputs ---

  it('should add a structured output', () => {
    if (!multimodalModule) {
      return;
    }

    const output = multimodalModule.addStructuredOutput({
      taskId: 'task_1',
      outputType: 'table',
      title: 'Results Table',
      data: JSON.stringify({
        rows: [
          [1, 2],
          [3, 4],
        ],
      }),
    });

    expect(output.id).toMatch(/^output_/);
    expect(output.taskId).toBe('task_1');
    expect(output.outputType).toBe('table');
    expect(output.title).toBe('Results Table');
  });

  it('should list structured outputs for a task', () => {
    if (!multimodalModule) {
      return;
    }

    multimodalModule.addStructuredOutput({
      taskId: 'task_1',
      outputType: 'chart',
      title: 'Chart 1',
      data: '{}',
    });
    multimodalModule.addStructuredOutput({
      taskId: 'task_1',
      outputType: 'table',
      title: 'Table 1',
      data: '{}',
    });
    multimodalModule.addStructuredOutput({
      taskId: 'task_2',
      outputType: 'code',
      title: 'Code 1',
      data: '{}',
    });

    const task1Outputs = multimodalModule.listStructuredOutputs('task_1');
    expect(task1Outputs).toHaveLength(2);

    const task2Outputs = multimodalModule.listStructuredOutputs('task_2');
    expect(task2Outputs).toHaveLength(1);
  });

  it('should delete a structured output', () => {
    if (!multimodalModule) {
      return;
    }

    const output = multimodalModule.addStructuredOutput({
      taskId: 'task_1',
      outputType: 'table',
      title: 'Temp',
      data: '{}',
    });

    const deleted = multimodalModule.deleteStructuredOutput(output.id);
    expect(deleted).toBe(true);

    const outputs = multimodalModule.listStructuredOutputs('task_1');
    expect(outputs).toHaveLength(0);
  });
});
