import { describe, expect, it } from 'vitest';

import { buildDashboardCharts } from './charts';

describe('buildDashboardCharts', () => {
  it('builds dashboard chart datasets', () => {
    const charts = buildDashboardCharts({
      taskSummary: {
        totalTasks: 5,
        completedTasks: 3,
        activeTasks: 2,
        completionRate: 0.6,
      },
      routineSummary: {
        totalRoutines: 3,
        completedRoutines: 1,
        skippedRoutines: 1,
        pendingRoutines: 1,
      },
      skillSummary: {
        totalSkills: 2,
        totalStages: 4,
        completedStages: 1,
        completionRate: 0.25,
      },
    });

    expect(charts.taskDistribution).toEqual([
      { label: 'Completed tasks', value: 3 },
      { label: 'Active tasks', value: 2 },
    ]);
    expect(charts.routineDistribution).toHaveLength(3);
    expect(charts.skillDistribution[1]?.value).toBe(3);
  });
});
