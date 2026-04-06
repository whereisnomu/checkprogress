import type { RoutineDailySummary } from '../application/routine-service';
import type { SkillProgressSummary } from '../application/skill-service';
import type { DashboardSummary } from './dashboard';

export type ChartDatum = {
  label: string;
  value: number;
};

export type DashboardCharts = {
  taskDistribution: ChartDatum[];
  routineDistribution: ChartDatum[];
  skillDistribution: ChartDatum[];
};

export const buildDashboardCharts = (params: {
  taskSummary: DashboardSummary;
  routineSummary: RoutineDailySummary;
  skillSummary: SkillProgressSummary;
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
});
