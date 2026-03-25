import { getDatabase } from '../database.js';
import type {
  CostRecord,
  CostRecordInput,
  CostSummary,
  CostBreakdown,
} from '../../common/types/cost.js';

function rowToCostRecord(row: Record<string, unknown>): CostRecord {
  return {
    id: row.id as number,
    taskId: row.task_id as string,
    provider: row.provider as string,
    model: row.model as string,
    inputTokens: row.input_tokens as number,
    outputTokens: row.output_tokens as number,
    costUsd: row.cost_usd as number,
    recordedAt: row.recorded_at as string,
  };
}

export function addCostRecord(input: CostRecordInput): CostRecord {
  const db = getDatabase();
  const now = new Date().toISOString();
  const result = db
    .prepare(
      `INSERT INTO cost_records (task_id, provider, model, input_tokens, output_tokens, cost_usd, recorded_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      input.taskId,
      input.provider,
      input.model,
      input.inputTokens,
      input.outputTokens,
      input.costUsd,
      now,
    );

  return {
    id: result.lastInsertRowid as number,
    taskId: input.taskId,
    provider: input.provider,
    model: input.model,
    inputTokens: input.inputTokens,
    outputTokens: input.outputTokens,
    costUsd: input.costUsd,
    recordedAt: now,
  };
}

export function getCostRecordsForTask(taskId: string): CostRecord[] {
  const db = getDatabase();
  const rows = db
    .prepare('SELECT * FROM cost_records WHERE task_id = ? ORDER BY recorded_at ASC')
    .all(taskId) as Record<string, unknown>[];
  return rows.map(rowToCostRecord);
}

export function getCostSummary(sinceDate?: string): CostSummary {
  const db = getDatabase();
  const query = sinceDate
    ? 'SELECT COALESCE(SUM(cost_usd), 0) as total_cost, COALESCE(SUM(input_tokens), 0) as total_input, COALESCE(SUM(output_tokens), 0) as total_output, COUNT(*) as cnt FROM cost_records WHERE recorded_at >= ?'
    : 'SELECT COALESCE(SUM(cost_usd), 0) as total_cost, COALESCE(SUM(input_tokens), 0) as total_input, COALESCE(SUM(output_tokens), 0) as total_output, COUNT(*) as cnt FROM cost_records';
  const row = (sinceDate ? db.prepare(query).get(sinceDate) : db.prepare(query).get()) as Record<
    string,
    unknown
  >;
  return {
    totalCostUsd: row.total_cost as number,
    totalInputTokens: row.total_input as number,
    totalOutputTokens: row.total_output as number,
    recordCount: row.cnt as number,
  };
}

export function getCostBreakdown(sinceDate?: string): CostBreakdown[] {
  const db = getDatabase();
  const query = sinceDate
    ? `SELECT provider, model, SUM(cost_usd) as total_cost, SUM(input_tokens) as total_input, SUM(output_tokens) as total_output, COUNT(*) as cnt
       FROM cost_records WHERE recorded_at >= ? GROUP BY provider, model ORDER BY total_cost DESC`
    : `SELECT provider, model, SUM(cost_usd) as total_cost, SUM(input_tokens) as total_input, SUM(output_tokens) as total_output, COUNT(*) as cnt
       FROM cost_records GROUP BY provider, model ORDER BY total_cost DESC`;
  const rows = (sinceDate ? db.prepare(query).all(sinceDate) : db.prepare(query).all()) as Record<
    string,
    unknown
  >[];
  return rows.map((row) => ({
    provider: row.provider as string,
    model: row.model as string,
    totalCostUsd: row.total_cost as number,
    totalInputTokens: row.total_input as number,
    totalOutputTokens: row.total_output as number,
    recordCount: row.cnt as number,
  }));
}
