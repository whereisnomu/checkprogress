import type { RoutineDailySummary } from '../application/routine-service';
import type { SkillProgressSummary } from '../application/skill-service';
import type { DashboardSummary } from './dashboard';
import type { RoutineEntry } from './routine';
import type { Task } from './task';

export type ChartDatum = {
  label: string;
  value: number;
};

export type DashboardCharts = {
  taskDistribution: ChartDatum[];
  routineDistribution: ChartDatum[];
  skillDistribution: ChartDatum[];
  taskCompletionSeries: ChartDatum[];
  routineHeatmap: ChartDatum[];
  routineStreakSeries: ChartDatum[];
};

const pad = (value: number) => String(value).padStart(2, '0');

const shiftDate = (date: Date, deltaDays: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + deltaDays);
  return next;
};

const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const buildTaskCompletionSeries = (
  tasks: Task[],
  days: number,
  endDate: Date,
): ChartDatum[] => {
  const buckets = new Map<string, number>();

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = shiftDate(endDate, -index);
    buckets.set(toDateKey(date), 0);
  }

  for (const task of tasks) {
    if (!task.completedAt) {
      continue;
    }

    const key = task.completedAt.slice(0, 10);
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
  }

  return [...buckets.entries()].map(([label, value]) => ({ label, value }));
};

export const buildRoutineHeatmap = (
  entries: RoutineEntry[],
  days: number,
  endDate: Date,
): ChartDatum[] => {
  const buckets = new Map<string, number>();

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = shiftDate(endDate, -index);
    buckets.set(toDateKey(date), 0);
  }

  for (const entry of entries) {
    if (entry.status !== 'done') {
      continue;
    }

    if (buckets.has(entry.date)) {
      buckets.set(entry.date, (buckets.get(entry.date) ?? 0) + 1);
    }
  }

  return [...buckets.entries()].map(([label, value]) => ({ label, value }));
};

export const buildRoutineStreakSeries = (
  entries: RoutineEntry[],
  days: number,
  endDate: Date,
): ChartDatum[] => {
  const heatmap = buildRoutineHeatmap(entries, days, endDate);
  let streak = 0;

  return heatmap.map((item) => {
    streak = item.value > 0 ? streak + 1 : 0;
    return { label: item.label, value: streak };
  });
};

export const buildDashboardCharts = (params: {
  taskSummary: DashboardSummary;
  routineSummary: RoutineDailySummary;
  skillSummary: SkillProgressSummary;
  tasks: Task[];
  routineEntries: RoutineEntry[];
  today: Date;
}): DashboardCharts => ({
  taskDistribution: [
    { label: 'Completed tasks', value: params.taskSummary.completedTasks },
    { label: 'Active tasks', value: params.taskSummary.activeTasks },
  ],
  routineDistribution: [
    { label: 'Done routines', value: params.routineSummary.completedRoutines },
    { label: 'Skipped routines', value: params.routineSummary.skippedRoutines },
    { label: 'Pending routines', value: params.routineSummary.pendingRoutines },
  ],
  skillDistribution: [
    { label: 'Completed stages', value: params.skillSummary.completedStages },
    {
      label: 'Open stages',
      value:
        params.skillSummary.totalStages - params.skillSummary.completedStages,
    },
  ],
  taskCompletionSeries: buildTaskCompletionSeries(
    params.tasks,
    7,
    params.today,
  ),
  routineHeatmap: buildRoutineHeatmap(params.routineEntries, 30, params.today),
  routineStreakSeries: buildRoutineStreakSeries(
    params.routineEntries,
    7,
    params.today,
  ),
});
