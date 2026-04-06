import type {
  Routine,
  RoutineEntry,
  RoutineEntryStatus,
  RoutineFrequency,
  RoutineRepository,
} from '@progress-state/shared';

import type { SqliteDatabase } from './database';

type RoutineRow = {
  id: string;
  title: string;
  description: string | null;
  frequency: RoutineFrequency;
  target_per_period: number;
  created_at: string;
  updated_at: string;
};

type RoutineEntryRow = {
  id: string;
  routine_id: string;
  entry_date: string;
  status: RoutineEntryStatus;
  note: string | null;
  created_at: string;
  updated_at: string;
};

const mapRoutineRow = (row: RoutineRow): Routine => ({
  id: row.id,
  title: row.title,
  description: row.description,
  frequency: row.frequency,
  targetPerPeriod: row.target_per_period,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapRoutineEntryRow = (row: RoutineEntryRow): RoutineEntry => ({
  id: row.id,
  routineId: row.routine_id,
  date: row.entry_date,
  status: row.status,
  note: row.note,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export class SqliteRoutineRepository implements RoutineRepository {
  public constructor(private readonly database: SqliteDatabase) {}

  public async create(routine: Routine) {
    this.database
      .prepare(
        `
          INSERT INTO routines (
            id,
            title,
            description,
            frequency,
            target_per_period,
            created_at,
            updated_at
          )
          VALUES (
            @id,
            @title,
            @description,
            @frequency,
            @targetPerPeriod,
            @createdAt,
            @updatedAt
          )
        `,
      )
      .run(routine);
  }

  public async list() {
    const rows = this.database
      .prepare(
        `
          SELECT id, title, description, frequency, target_per_period, created_at, updated_at
          FROM routines
          ORDER BY created_at DESC
        `,
      )
      .all() as RoutineRow[];

    return rows.map(mapRoutineRow);
  }

  public async findById(id: string) {
    const row = this.database
      .prepare(
        `
          SELECT id, title, description, frequency, target_per_period, created_at, updated_at
          FROM routines
          WHERE id = ?
        `,
      )
      .get(id) as RoutineRow | undefined;

    return row ? mapRoutineRow(row) : null;
  }

  public async update(routine: Routine) {
    this.database
      .prepare(
        `
          UPDATE routines
          SET title = @title,
              description = @description,
              frequency = @frequency,
              target_per_period = @targetPerPeriod,
              updated_at = @updatedAt
          WHERE id = @id
        `,
      )
      .run(routine);
  }

  public async delete(id: string) {
    this.database.prepare('DELETE FROM routines WHERE id = ?').run(id);
  }

  public async upsertEntry(entry: RoutineEntry) {
    this.database
      .prepare(
        `
          INSERT INTO routine_entries (
            id,
            routine_id,
            entry_date,
            status,
            note,
            created_at,
            updated_at
          )
          VALUES (
            @id,
            @routineId,
            @date,
            @status,
            @note,
            @createdAt,
            @updatedAt
          )
          ON CONFLICT(routine_id, entry_date)
          DO UPDATE SET
            status = excluded.status,
            note = excluded.note,
            updated_at = excluded.updated_at
        `,
      )
      .run(entry);
  }

  public async findEntryByRoutineAndDate(routineId: string, date: string) {
    const row = this.database
      .prepare(
        `
          SELECT id, routine_id, entry_date, status, note, created_at, updated_at
          FROM routine_entries
          WHERE routine_id = ? AND entry_date = ?
        `,
      )
      .get(routineId, date) as RoutineEntryRow | undefined;

    return row ? mapRoutineEntryRow(row) : null;
  }

  public async listEntriesByDate(date: string) {
    const rows = this.database
      .prepare(
        `
          SELECT id, routine_id, entry_date, status, note, created_at, updated_at
          FROM routine_entries
          WHERE entry_date = ?
        `,
      )
      .all(date) as RoutineEntryRow[];

    return rows.map(mapRoutineEntryRow);
  }

  public async listEntriesInRange(startDate: string, endDate: string) {
    const rows = this.database
      .prepare(
        `
          SELECT id, routine_id, entry_date, status, note, created_at, updated_at
          FROM routine_entries
          WHERE entry_date >= ? AND entry_date <= ?
          ORDER BY entry_date ASC
        `,
      )
      .all(startDate, endDate) as RoutineEntryRow[];

    return rows.map(mapRoutineEntryRow);
  }
}
