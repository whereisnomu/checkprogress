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
      tasks: [
        {
          id: 'task-1',
          title: 'Task',
          description: null,
          status: 'done',
          createdAt: '2026-04-01T10:00:00.000Z',
          updatedAt: '2026-04-06T10:00:00.000Z',
          completedAt: '2026-04-06T10:00:00.000Z',
        },
      ],
      routineEntries: [
        {
          id: 'entry-1',
          routineId: 'routine-1',
          date: '2026-04-06',
          status: 'done',
          note: null,
          createdAt: '2026-04-06T10:00:00.000Z',
          updatedAt: '2026-04-06T10:00:00.000Z',
        },
      ],
      today: new Date('2026-04-06T10:00:00.000Z'),
    });

    expect(charts.taskDistribution).toEqual([
      { label: 'Completed tasks', value: 3 },
      { label: 'Active tasks', value: 2 },
    ]);
    expect(charts.routineDistribution).toHaveLength(3);
    expect(charts.skillDistribution[1]?.value).toBe(3);
    expect(charts.taskCompletionSeries).toHaveLength(7);
    expect(charts.routineHeatmap).toHaveLength(30);
    expect(charts.routineStreakSeries).toHaveLength(7);
  });
});
