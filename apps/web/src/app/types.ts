export type DashboardSummary = {
  tasks: {
    totalTasks: number;
    completedTasks: number;
    activeTasks: number;
    completionRate: number;
  };
  routines: {
    totalRoutines: number;
    completedRoutines: number;
    skippedRoutines: number;
    pendingRoutines: number;
  };
  skills: {
    totalSkills: number;
    totalStages: number;
    completedStages: number;
    completionRate: number;
  };
};

export type DashboardCharts = {
  taskDistribution: { label: string; value: number }[];
  routineDistribution: { label: string; value: number }[];
  skillDistribution: { label: string; value: number }[];
  taskCompletionSeries: { label: string; value: number }[];
  routineHeatmap: { label: string; value: number }[];
  routineStreakSeries: { label: string; value: number }[];
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
};

export type Routine = {
  id: string;
  title: string;
  description: string | null;
  frequency: 'daily';
  targetPerPeriod: number;
  createdAt: string;
  updatedAt: string;
};

export type RoutineEntry = {
  id: string;
  routineId: string;
  date: string;
  status: 'done' | 'skipped';
  note: string | null;
  createdAt: string;
  updatedAt: string;
};
