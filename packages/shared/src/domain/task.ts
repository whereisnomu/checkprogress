export const TASK_STATUSES = ['todo', 'in_progress', 'done'] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
};

export const createTask = (params: {
  id: string;
  title: string;
  description?: string | null;
  now: string;
}): Task => ({
  id: params.id,
  title: params.title.trim(),
  description: params.description?.trim() || null,
  status: 'todo',
  createdAt: params.now,
  updatedAt: params.now,
  completedAt: null,
});

export const completeTask = (task: Task, now: string): Task => {
  if (task.status === 'done') {
    return task;
  }

  return {
    ...task,
    status: 'done',
    updatedAt: now,
    completedAt: now,
  };
};

export const updateTask = (
  task: Task,
  params: {
    title: string;
    description?: string | null;
    status: TaskStatus;
    now: string;
  },
): Task => ({
  ...task,
  title: params.title.trim(),
  description: params.description?.trim() || null,
  status: params.status,
  updatedAt: params.now,
  completedAt:
    params.status === 'done' ? (task.completedAt ?? params.now) : null,
});
