import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import type { Task } from '../../app/types';
import { apiClient } from '../../shared/api/client';

type TasksContextValue = {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  createTask: (input: { title: string; description?: string }) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  updateTask: (input: {
    taskId: string;
    title: string;
    description?: string;
    status: Task['status'];
  }) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const TasksContext = createContext<TasksContextValue | null>(null);

export const TasksProvider = ({ children }: PropsWithChildren) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);

    try {
      const nextTasks = await apiClient.listTasks();
      setTasks(Array.isArray(nextTasks) ? nextTasks : []);
      setError(null);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unknown tasks error',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createTask = useCallback(
    async (input: { title: string; description?: string }) => {
      const createdTask = await apiClient.createTask(input);
      setTasks((currentTasks) => [createdTask, ...currentTasks]);
    },
    [],
  );

  const completeTask = useCallback(async (taskId: string) => {
    const completedTask = await apiClient.completeTask(taskId);
    setTasks((currentTasks) =>
      currentTasks.map((task) => (task.id === taskId ? completedTask : task)),
    );
  }, []);

  const updateTask = useCallback(
    async (input: {
      taskId: string;
      title: string;
      description?: string;
      status: Task['status'];
    }) => {
      const payload = {
        title: input.title,
        status: input.status,
        ...(input.description !== undefined
          ? { description: input.description }
          : {}),
      };
      const updatedTask = await apiClient.updateTask(input.taskId, payload);

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === input.taskId ? updatedTask : task,
        ),
      );
    },
    [],
  );

  const deleteTask = useCallback(async (taskId: string) => {
    await apiClient.deleteTask(taskId);
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskId),
    );
  }, []);

  const value = useMemo(
    () => ({
      tasks,
      isLoading,
      error,
      createTask,
      completeTask,
      updateTask,
      deleteTask,
      refresh,
    }),
    [
      completeTask,
      createTask,
      deleteTask,
      error,
      isLoading,
      refresh,
      tasks,
      updateTask,
    ],
  );

  return (
    <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TasksContext);

  if (!context) {
    throw new Error('useTasks must be used within TasksProvider');
  }

  return context;
};
