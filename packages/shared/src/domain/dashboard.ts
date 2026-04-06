import type { Task } from './task';

export type DashboardSummary = {
  totalTasks: number;
  completedTasks: number;
  activeTasks: number;
  completionRate: number;
};

export const buildDashboardSummary = (tasks: Task[]): DashboardSummary => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === 'done').length;
  const activeTasks = totalTasks - completedTasks;
  const completionRate = totalTasks === 0 ? 0 : completedTasks / totalTasks;

  return {
    totalTasks,
    completedTasks,
    activeTasks,
    completionRate,
  };
};
