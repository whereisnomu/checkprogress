import type { Task, TaskRepository, TaskStatus } from '@progress-state/shared';

import type { SqliteDatabase } from './database';

type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

const mapTaskRow = (row: TaskRow): Task => ({
  id: row.id,
  title: row.title,
  description: row.description,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  completedAt: row.completed_at,
});

export class SqliteTaskRepository implements TaskRepository {
  public constructor(private readonly database: SqliteDatabase) {}

  public async create(task: Task) {
    this.database
      .prepare(
        `
          INSERT INTO tasks (id, title, description, status, created_at, updated_at, completed_at)
          VALUES (@id, @title, @description, @status, @createdAt, @updatedAt, @completedAt)
        `,
      )
      .run(task);
  }

  public async list() {
    const rows = this.database
      .prepare(
        `
          SELECT id, title, description, status, created_at, updated_at, completed_at
          FROM tasks
          ORDER BY created_at DESC
        `,
      )
      .all() as TaskRow[];

    return rows.map(mapTaskRow);
  }

  public async findById(id: string) {
    const row = this.database
      .prepare(
        `
          SELECT id, title, description, status, created_at, updated_at, completed_at
          FROM tasks
          WHERE id = ?
        `,
      )
      .get(id) as TaskRow | undefined;

    return row ? mapTaskRow(row) : null;
  }

  public async update(task: Task) {
    this.database
      .prepare(
        `
          UPDATE tasks
          SET title = @title,
              description = @description,
              status = @status,
              updated_at = @updatedAt,
              completed_at = @completedAt
          WHERE id = @id
        `,
      )
      .run(task);
  }

  public async delete(id: string) {
    this.database.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  }
}
