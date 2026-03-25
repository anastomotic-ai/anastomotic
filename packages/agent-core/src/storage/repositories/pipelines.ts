import { getDatabase } from '../database.js';
import { createTaskId } from '../../common/utils/id.js';
import type {
  Pipeline,
  PipelineCreateInput,
  PipelineUpdateInput,
  PipelineStep,
  PipelineRun,
  PipelineRunStatus,
  PipelineStepRun,
} from '../../common/types/orchestration.js';

interface PipelineRow {
  id: string;
  name: string;
  description: string;
  steps: string;
  created_at: string;
  updated_at: string;
}

interface PipelineRunRow {
  id: string;
  pipeline_id: string;
  prompt: string;
  status: string;
  step_runs: string;
  current_step_index: number;
  created_at: string;
  completed_at: string | null;
}

function rowToPipeline(row: PipelineRow): Pipeline {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    steps: JSON.parse(row.steps) as PipelineStep[],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToRun(row: PipelineRunRow): PipelineRun {
  return {
    id: row.id,
    pipelineId: row.pipeline_id,
    prompt: row.prompt,
    status: row.status as PipelineRunStatus,
    stepRuns: JSON.parse(row.step_runs) as PipelineStepRun[],
    currentStepIndex: row.current_step_index,
    createdAt: row.created_at,
    completedAt: row.completed_at,
  };
}

// ── Pipeline CRUD ──────────────────────────────────────────────

export function listPipelines(): Pipeline[] {
  const db = getDatabase();
  const rows = db
    .prepare('SELECT * FROM pipelines ORDER BY created_at DESC')
    .all() as PipelineRow[];
  return rows.map(rowToPipeline);
}

export function getPipeline(id: string): Pipeline | null {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM pipelines WHERE id = ?').get(id) as PipelineRow | undefined;
  return row ? rowToPipeline(row) : null;
}

export function createPipeline(input: PipelineCreateInput): Pipeline {
  const db = getDatabase();
  const id = createTaskId();
  const now = new Date().toISOString();

  const steps: PipelineStep[] = input.steps.map((s, i) => ({
    ...s,
    id: createTaskId(),
    order: i,
  }));

  db.prepare(
    `INSERT INTO pipelines (id, name, description, steps, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(id, input.name, input.description, JSON.stringify(steps), now, now);

  return {
    id,
    name: input.name,
    description: input.description,
    steps,
    createdAt: now,
    updatedAt: now,
  };
}

export function updatePipeline(id: string, input: PipelineUpdateInput): Pipeline | null {
  const db = getDatabase();
  const existing = getPipeline(id);
  if (!existing) {
    return null;
  }

  const now = new Date().toISOString();
  const name = input.name ?? existing.name;
  const description = input.description ?? existing.description;

  let steps = existing.steps;
  if (input.steps) {
    steps = input.steps.map((s, i) => ({
      ...s,
      id: createTaskId(),
      order: i,
    }));
  }

  db.prepare(
    `UPDATE pipelines SET name = ?, description = ?, steps = ?, updated_at = ? WHERE id = ?`,
  ).run(name, description, JSON.stringify(steps), now, id);

  return { ...existing, name, description, steps, updatedAt: now };
}

export function deletePipeline(id: string): boolean {
  const db = getDatabase();
  const result = db.prepare('DELETE FROM pipelines WHERE id = ?').run(id);
  return result.changes > 0;
}

// ── Pipeline Run CRUD ──────────────────────────────────────────

export function createPipelineRun(
  pipelineId: string,
  prompt: string,
  stepRuns: PipelineStepRun[],
): PipelineRun {
  const db = getDatabase();
  const id = createTaskId();
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO pipeline_runs (id, pipeline_id, prompt, status, step_runs, current_step_index, created_at)
     VALUES (?, ?, ?, 'pending', ?, -1, ?)`,
  ).run(id, pipelineId, prompt, JSON.stringify(stepRuns), now);

  return {
    id,
    pipelineId,
    prompt,
    status: 'pending',
    stepRuns,
    currentStepIndex: -1,
    createdAt: now,
    completedAt: null,
  };
}

export function getPipelineRun(id: string): PipelineRun | null {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM pipeline_runs WHERE id = ?').get(id) as
    | PipelineRunRow
    | undefined;
  return row ? rowToRun(row) : null;
}

export function listPipelineRuns(pipelineId?: string): PipelineRun[] {
  const db = getDatabase();
  if (pipelineId) {
    const rows = db
      .prepare('SELECT * FROM pipeline_runs WHERE pipeline_id = ? ORDER BY created_at DESC')
      .all(pipelineId) as PipelineRunRow[];
    return rows.map(rowToRun);
  }
  const rows = db
    .prepare('SELECT * FROM pipeline_runs ORDER BY created_at DESC LIMIT 50')
    .all() as PipelineRunRow[];
  return rows.map(rowToRun);
}

export function updatePipelineRun(
  id: string,
  update: {
    status?: PipelineRunStatus;
    stepRuns?: PipelineStepRun[];
    currentStepIndex?: number;
    completedAt?: string;
  },
): PipelineRun | null {
  const db = getDatabase();
  const existing = getPipelineRun(id);
  if (!existing) {
    return null;
  }

  const status = update.status ?? existing.status;
  const stepRuns = update.stepRuns ?? existing.stepRuns;
  const currentStepIndex = update.currentStepIndex ?? existing.currentStepIndex;
  const completedAt = update.completedAt ?? existing.completedAt;

  db.prepare(
    `UPDATE pipeline_runs SET status = ?, step_runs = ?, current_step_index = ?, completed_at = ? WHERE id = ?`,
  ).run(status, JSON.stringify(stepRuns), currentStepIndex, completedAt, id);

  return { ...existing, status, stepRuns, currentStepIndex, completedAt };
}

export function deletePipelineRun(id: string): boolean {
  const db = getDatabase();
  const result = db.prepare('DELETE FROM pipeline_runs WHERE id = ?').run(id);
  return result.changes > 0;
}
