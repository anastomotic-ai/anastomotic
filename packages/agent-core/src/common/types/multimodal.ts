/**
 * Multi-Modal I/O types — image analysis, media previews, and structured outputs.
 */

export type MediaType = 'image' | 'audio' | 'video' | 'document' | 'chart';

export interface MediaAttachment {
  id: string;
  type: MediaType;
  /** File path or data URI */
  source: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  durationMs?: number;
  thumbnailUri?: string;
  createdAt: string;
}

export interface MediaAttachmentInput {
  type: MediaType;
  source: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  durationMs?: number;
}

export interface StructuredOutput {
  id: string;
  taskId: string;
  outputType: 'table' | 'chart' | 'json' | 'markdown' | 'html';
  title: string;
  data: string;
  createdAt: string;
}

export interface StructuredOutputInput {
  taskId: string;
  outputType: StructuredOutput['outputType'];
  title: string;
  data: string;
}

export interface ImageAnalysisRequest {
  imageSource: string;
  prompt: string;
}

export interface ImageAnalysisResult {
  description: string;
  labels: string[];
  confidence: number;
}
