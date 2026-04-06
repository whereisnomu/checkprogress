import { describe, expect, it } from 'vitest';

import { createBot } from './create-bot';

describe('createBot', () => {
  it('creates a bot instance', () => {
    const bot = createBot({
      token: '123456:token',
      dashboardUrl: 'http://localhost:3000',
      ownerChatId: null,
      services: {
        taskService: {
          createTask: async ({ title }) => ({ title }),
          listTasks: async () => [],
          completeTask: async () => undefined,
          deleteTask: async () => undefined,
        },
        routineService: {
          createRoutine: async () => undefined,
          listRoutines: async () => [],
          checkInRoutine: async () => undefined,
          deleteRoutine: async () => undefined,
        },
        skillService: {
          createSkill: async () => ({
            id: 'skill-1',
            title: 'Skill',
            description: null,
            category: null,
            createdAt: '2026-04-06T10:00:00.000Z',
            updatedAt: '2026-04-06T10:00:00.000Z',
          }),
          createStage: async () => undefined,
          listSkills: async () => [],
          listStagesBySkillId: async () => [],
          markStage: async () => undefined,
          deleteSkill: async () => undefined,
          deleteStage: async () => undefined,
          getProgressSummary: async () => ({
            totalSkills: 0,
            totalStages: 0,
            completedStages: 0,
            completionRate: 0,
          }),
        },
        analyticsService: {
          getCharts: async () => ({
            taskDistribution: [],
            routineDistribution: [],
            skillDistribution: [],
            taskCompletionSeries: [],
            routineHeatmap: [],
            routineStreakSeries: [],
          }),
        },
        telegramLinkService: {
          getLinkStatus: async () => ({
            linkedChat: null,
            latestLinkToken: null,
          }),
          linkTelegram: async () => undefined,
        },
        draftStore: {
          getDraft: () => null,
          upsertDraft: () => undefined,
          clearDraft: () => undefined,
        },
      },
    });

    expect(bot).toBeDefined();
  });
});
