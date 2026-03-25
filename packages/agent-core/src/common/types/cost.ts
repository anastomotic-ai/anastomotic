/** A single cost record for token usage during a task. */
export interface CostRecord {
  id: number;
  taskId: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  recordedAt: string;
}

/** Input for creating a new cost record. */
export interface CostRecordInput {
  taskId: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}

/** Aggregated cost summary for a time period. */
export interface CostSummary {
  totalCostUsd: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  recordCount: number;
}

/** Cost breakdown by provider/model. */
export interface CostBreakdown {
  provider: string;
  model: string;
  totalCostUsd: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  recordCount: number;
}
