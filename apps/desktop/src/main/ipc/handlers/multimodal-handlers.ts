import type { IpcMainInvokeEvent } from 'electron';
import {
  addMediaAttachment,
  listMediaAttachments,
  deleteMediaAttachment,
  addStructuredOutput,
  listStructuredOutputs,
  deleteStructuredOutput,
  type MediaAttachmentInput,
  type StructuredOutputInput,
} from '@anastomotic_ai/agent-core';
import { handle } from './utils';

export function registerMultimodalHandlers(): void {
  handle(
    'multimodal:media:add',
    async (_event: IpcMainInvokeEvent, input: MediaAttachmentInput) => {
      return addMediaAttachment(input);
    },
  );

  handle('multimodal:media:list', async (_event: IpcMainInvokeEvent, limit?: number) => {
    return listMediaAttachments(limit);
  });

  handle('multimodal:media:delete', async (_event: IpcMainInvokeEvent, id: string) => {
    return deleteMediaAttachment(id);
  });

  handle(
    'multimodal:output:add',
    async (_event: IpcMainInvokeEvent, input: StructuredOutputInput) => {
      return addStructuredOutput(input);
    },
  );

  handle('multimodal:output:list', async (_event: IpcMainInvokeEvent, taskId: string) => {
    return listStructuredOutputs(taskId);
  });

  handle('multimodal:output:delete', async (_event: IpcMainInvokeEvent, id: string) => {
    return deleteStructuredOutput(id);
  });
}
