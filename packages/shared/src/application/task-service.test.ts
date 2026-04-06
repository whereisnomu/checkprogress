import { describe, expect, it } from 'vitest';

import type { Clock, IdGenerator, TaskRepository } from './ports';
import { TaskService } from './task-service';

class InMemoryTaskRepository implements TaskRepository {
  public readonly items = new Map<string, any>();

  public async create(task: any) {
    this.items.set(task.id, task);
  }

  public async list() {
    return [...this.items.values()];
  }

  public async findById(id: string) {
    return this.items.get(id) ?? null;
  }

  public async update(task: any) {
    this.items.set(task.id, task);
  }

  public async delete(id: string) {
    this.items.delete(id);
  }
}

class FixedIdGenerator implements IdGenerator {
  public next() {
    return 'task-1';
  }
}

class FixedClock implements Clock {
  public now() {
    return '2026-04-06T10:00:00.000Z';
  }
}

describe('TaskService', () => {
  it('creates a task with normalized values', async () => {
    const repository = new InMemoryTaskRepository();
    const service = new TaskService(
      repository,
      new FixedIdGenerator(),
      new FixedClock(),
    );

    const task = await service.createTask({
      title: '  Write architecture docs  ',
      description: '  First draft  ',
    });

    expect(task.id).toBe('task-1');
    expect(task.title).toBe('Write architecture docs');
    expect(task.description).toBe('First draft');
    expect(task.status).toBe('todo');
  });

  it('completes an existing task', async () => {
    const repository = new InMemoryTaskRepository();
    const service = new TaskService(
      repository,
      new FixedIdGenerator(),
      new FixedClock(),
    );
    await service.createTask({ title: 'Ship dashboard' });

    const completed = await service.completeTask({ taskId: 'task-1' });

    expect(completed.status).toBe('done');
    expect(completed.completedAt).toBe('2026-04-06T10:00:00.000Z');
  });

  it('builds dashboard summary from tasks', async () => {
    const repository = new InMemoryTaskRepository();
    const service = new TaskService(
      repository,
      new FixedIdGenerator(),
      new FixedClock(),
    );
    await service.createTask({ title: 'Task 1' });
    await service.completeTask({ taskId: 'task-1' });

    const summary = await service.getDashboardSummary();

    expect(summary.totalTasks).toBe(1);
    expect(summary.completedTasks).toBe(1);
    expect(summary.activeTasks).toBe(0);
    expect(summary.completionRate).toBe(1);
  });

  it('updates an existing task', async () => {
    const repository = new InMemoryTaskRepository();
    const service = new TaskService(
      repository,
      new FixedIdGenerator(),
      new FixedClock(),
    );
    await service.createTask({ title: 'Initial task' });

    const updated = await service.updateTask({
      taskId: 'task-1',
      title: 'Updated task',
      status: 'in_progress',
    });

    expect(updated.title).toBe('Updated task');
    expect(updated.status).toBe('in_progress');
  });

  it('deletes an existing task', async () => {
    const repository = new InMemoryTaskRepository();
    const service = new TaskService(
      repository,
      new FixedIdGenerator(),
      new FixedClock(),
    );
    await service.createTask({ title: 'Disposable task' });

    await service.deleteTask({ taskId: 'task-1' });

    expect(await service.listTasks()).toHaveLength(0);
  });
});
