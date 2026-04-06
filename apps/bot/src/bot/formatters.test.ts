import { describe, expect, it } from 'vitest';

import {
  formatBotHelp,
  formatReminderMessage,
  formatRoutineList,
  formatSkillList,
  formatStageList,
  formatTaskList,
  formatTodayOverview,
} from './formatters';

describe('bot formatters', () => {
  it('formats today overview', () => {
    const message = formatTodayOverview({
      today: '2026-04-06',
      tasks: [
        {
          id: '1',
          title: 'Build charts',
          description: null,
          status: 'todo',
          createdAt: '2026-04-06T10:00:00.000Z',
          updatedAt: '2026-04-06T10:00:00.000Z',
          completedAt: null,
        },
      ],
      routines: [
        {
          id: 'r1',
          title: 'Morning review',
          description: null,
          frequency: 'daily',
          targetPerPeriod: 1,
          createdAt: '2026-04-06T10:00:00.000Z',
          updatedAt: '2026-04-06T10:00:00.000Z',
        },
      ],
      skillSummary: {
        totalSkills: 1,
        totalStages: 3,
        completedStages: 1,
        completionRate: 1 / 3,
      },
    });

    expect(message).toContain('Today: 2026-04-06');
    expect(message).toContain('Build charts');
    expect(message).toContain('Skills: 1/3 stages completed');
  });

  it('formats routine list', () => {
    expect(
      formatRoutineList([
        {
          id: 'r1',
          title: 'Workout',
          description: null,
          frequency: 'daily',
          targetPerPeriod: 1,
          createdAt: '2026-04-06T10:00:00.000Z',
          updatedAt: '2026-04-06T10:00:00.000Z',
        },
      ]),
    ).toContain('Workout');
  });

  it('formats task and skill lists', () => {
    expect(
      formatTaskList([
        {
          id: '1',
          title: 'Ship bot',
          description: null,
          status: 'todo',
          createdAt: '2026-04-06T10:00:00.000Z',
          updatedAt: '2026-04-06T10:00:00.000Z',
          completedAt: null,
        },
      ]),
    ).toContain('Ship bot');

    expect(
      formatSkillList([
        {
          id: 's1',
          title: 'React',
          description: null,
          category: 'Frontend',
          createdAt: '2026-04-06T10:00:00.000Z',
          updatedAt: '2026-04-06T10:00:00.000Z',
        },
      ]),
    ).toContain('React');

    expect(
      formatStageList('React', [
        {
          id: 'st1',
          skillId: 's1',
          title: 'Context state',
          description: null,
          order: 1,
          createdAt: '2026-04-06T10:00:00.000Z',
        },
      ]),
    ).toContain('Context state');
  });

  it('formats bot help', () => {
    expect(formatBotHelp()).toContain('/today');
    expect(formatBotHelp()).toContain('/skills');
  });

  it('formats reminder message', () => {
    expect(
      formatReminderMessage({
        openTasks: 3,
        routinesConfigured: 2,
        completedStages: 1,
        totalStages: 4,
      }),
    ).toContain('Open tasks: 3');
  });
});
