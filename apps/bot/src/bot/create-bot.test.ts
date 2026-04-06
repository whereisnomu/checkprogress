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
        },
        routineService: {
          listRoutines: async () => [],
          checkInRoutine: async () => undefined,
        },
        skillService: {
          listSkills: async () => [],
          listStagesBySkillId: async () => [],
          markStage: async () => undefined,
          getProgressSummary: async () => ({
            totalSkills: 0,
            totalStages: 0,
            completedStages: 0,
            completionRate: 0,
          }),
        },
      },
    });

    expect(bot).toBeDefined();
  });
});
