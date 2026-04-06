import { z } from 'zod';

import { buildDashboardSummary } from '../domain/dashboard';
import {
  completeTask,
  createTask,
  TASK_STATUSES,
  updateTask,
} from '../domain/task';
import type { Clock, IdGenerator, TaskRepository } from './ports';

export class TaskNotFoundError extends Error {
  public constructor(taskId: string) {
    super(`Task ${taskId} was not found`);
    this.name = 'TaskNotFoundError';
  }
}

export const createTaskInputSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).optional(),
});

export const completeTaskInputSchema = z.object({
  taskId: z.string().min(1),
});

export const updateTaskInputSchema = z.object({
  taskId: z.string().min(1),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).optional(),
  status: z.enum(TASK_STATUSES),
});

export const deleteTaskInputSchema = z.object({
  taskId: z.string().min(1),
});

export type CreateTaskInput = z.infer<typeof createTaskInputSchema>;
export type CompleteTaskInput = z.infer<typeof completeTaskInputSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskInputSchema>;
export type DeleteTaskInput = z.infer<typeof deleteTaskInputSchema>;

export class TaskService {
  public constructor(
    private readonly repository: TaskRepository,
    private readonly idGenerator: IdGenerator,
    private readonly clock: Clock,
  ) {}

  public async createTask(input: CreateTaskInput) {
    const validated = createTaskInputSchema.parse(input);
    const now = this.clock.now();
    const task = createTask({
      id: this.idGenerator.next(),
      title: validated.title,
      description: validated.description ?? null,
      now,
    });

    await this.repository.create(task);

    return task;
  }

  public async listTasks() {
    return this.repository.list();
  }

  public async completeTask(input: CompleteTaskInput) {
    const validated = completeTaskInputSchema.parse(input);
    const task = await this.repository.findById(validated.taskId);

    if (!task) {
      throw new TaskNotFoundError(validated.taskId);
    }

    const updatedTask = completeTask(task, this.clock.now());
    await this.repository.update(updatedTask);

    return updatedTask;
  }

  public async updateTask(input: UpdateTaskInput) {
    const validated = updateTaskInputSchema.parse(input);
    const task = await this.repository.findById(validated.taskId);

    if (!task) {
      throw new TaskNotFoundError(validated.taskId);
    }

    const updated = updateTask(task, {
      title: validated.title,
      description: validated.description ?? null,
      status: validated.status,
      now: this.clock.now(),
    });

    await this.repository.update(updated);

    return updated;
  }

  public async deleteTask(input: DeleteTaskInput) {
    const validated = deleteTaskInputSchema.parse(input);
    const task = await this.repository.findById(validated.taskId);

    if (!task) {
      throw new TaskNotFoundError(validated.taskId);
    }

    await this.repository.delete(validated.taskId);
  }

  public async getDashboardSummary() {
    const tasks = await this.repository.list();

    return buildDashboardSummary(tasks);
  }
}
