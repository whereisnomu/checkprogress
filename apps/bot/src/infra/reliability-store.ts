import type { SqliteDatabase } from '@progress-state/shared-sqlite';

export const hasProcessedUpdate = (
  database: SqliteDatabase,
  updateId: number,
) => {
  const row = database
    .prepare('SELECT update_id FROM processed_updates WHERE update_id = ?')
    .get(updateId) as { update_id: number } | undefined;

  return Boolean(row);
};

export const markProcessedUpdate = (
  database: SqliteDatabase,
  updateId: number,
  processedAt: string,
) => {
  database
    .prepare(
      `
        INSERT OR IGNORE INTO processed_updates (update_id, processed_at)
        VALUES (?, ?)
      `,
    )
    .run(updateId, processedAt);
};

export const hasReminderRun = (
  database: SqliteDatabase,
  kind: string,
  runDate: string,
) => {
  const row = database
    .prepare('SELECT kind FROM reminder_runs WHERE kind = ? AND run_date = ?')
    .get(kind, runDate) as { kind: string } | undefined;

  return Boolean(row);
};

export const markReminderRun = (
  database: SqliteDatabase,
  kind: string,
  runDate: string,
  executedAt: string,
) => {
  database
    .prepare(
      `
        INSERT OR IGNORE INTO reminder_runs (kind, run_date, executed_at)
        VALUES (?, ?, ?)
      `,
    )
    .run(kind, runDate, executedAt);
};
