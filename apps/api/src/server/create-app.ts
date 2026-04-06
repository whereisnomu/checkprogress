import {
  buildDashboardCharts,
  RoutineNotFoundError,
  SkillNotFoundError,
  SkillStageNotFoundError,
  TaskNotFoundError,
  TelegramLinkError,
  toLocalDateString,
} from '@progress-state/shared';
import cors from 'cors';
import express from 'express';
import { ZodError } from 'zod';
import type {
  RoutineService,
  SkillService,
  TaskService,
  TelegramLinkService,
} from '@progress-state/shared';

import {
  TelegramWebAppAuthError,
  verifyTelegramWebAppInitData,
} from '../infra/telegram-webapp';

type AppDependencies = {
  taskService: TaskService;
  routineService: RoutineService;
  skillService: SkillService;
  telegramLinkService: TelegramLinkService;
  systemInfo: {
    webDashboardUrl: string;
    timezone: string;
    telegramEnabled: boolean;
    ownerChatId: string | null;
    botToken: string | null;
    telegramBotUsername: string | null;
    remindersEnabled: boolean;
    dailyReminderTime: string;
  };
};

export const createApp = ({
  taskService,
  routineService,
  skillService,
  telegramLinkService,
  systemInfo,
}: AppDependencies) => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_request, response) => {
    response.json({ ok: true });
  });

  app.get('/api/settings/system', (_request, response) => {
    response.json({
      data: {
        webDashboardUrl: systemInfo.webDashboardUrl,
        timezone: systemInfo.timezone,
        telegramEnabled: systemInfo.telegramEnabled,
        ownerChatConfigured: Boolean(systemInfo.ownerChatId),
        telegramBotUsername: systemInfo.telegramBotUsername,
        remindersEnabled: systemInfo.remindersEnabled,
        dailyReminderTime: systemInfo.dailyReminderTime,
      },
    });
  });

  app.post('/api/telegram-webapp/verify', async (request, response, next) => {
    try {
      if (!systemInfo.botToken) {
        throw new Error('Telegram bot token is not configured');
      }

      const payload = verifyTelegramWebAppInitData(
        String(request.body.initData ?? ''),
        systemInfo.botToken,
      );

      response.json({ data: payload });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/settings/telegram-link', async (_request, response) => {
    const status = await telegramLinkService.getLinkStatus();
    response.json({ data: status });
  });

  app.post('/api/settings/telegram-link', async (_request, response, next) => {
    try {
      const linkCode = await telegramLinkService.generateLinkCode();
      response.status(201).json({ data: linkCode });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/tasks', async (_request, response) => {
    const tasks = await taskService.listTasks();
    response.json({ data: tasks });
  });

  app.post('/api/tasks', async (request, response, next) => {
    try {
      const task = await taskService.createTask(request.body);
      response.status(201).json({ data: task });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/tasks/:taskId/complete', async (request, response, next) => {
    try {
      const task = await taskService.completeTask({
        taskId: request.params.taskId,
      });
      response.json({ data: task });
    } catch (error) {
      next(error);
    }
  });

  app.patch('/api/tasks/:taskId', async (request, response, next) => {
    try {
      const task = await taskService.updateTask({
        taskId: request.params.taskId,
        title: request.body.title,
        description: request.body.description,
        status: request.body.status,
      });
      response.json({ data: task });
    } catch (error) {
      next(error);
    }
  });

  app.delete('/api/tasks/:taskId', async (request, response, next) => {
    try {
      await taskService.deleteTask({ taskId: request.params.taskId });
      response.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/dashboard/summary', async (_request, response) => {
    const today = toLocalDateString(new Date());
    const [taskSummary, routineSummary, skillSummary] = await Promise.all([
      taskService.getDashboardSummary(),
      routineService.getDailySummary(today),
      skillService.getProgressSummary(),
    ]);

    response.json({
      data: {
        tasks: taskSummary,
        routines: routineSummary,
        skills: skillSummary,
      },
    });
  });

  app.get('/api/dashboard/charts', async (_request, response) => {
    const now = new Date();
    const today = toLocalDateString(now);
    const startDate = (() => {
      const start = new Date(now);
      start.setDate(start.getDate() - 29);
      return toLocalDateString(start);
    })();

    const [taskSummary, routineSummary, skillSummary, tasks, routineEntries] =
      await Promise.all([
        taskService.getDashboardSummary(),
        routineService.getDailySummary(today),
        skillService.getProgressSummary(),
        taskService.listTasks(),
        routineService.listEntriesInRange(startDate, today),
      ]);

    response.json({
      data: buildDashboardCharts({
        taskSummary,
        routineSummary,
        skillSummary,
        tasks,
        routineEntries,
        today: now,
      }),
    });
  });

  app.get('/api/routines', async (_request, response) => {
    const routines = await routineService.listRoutines();
    response.json({ data: routines });
  });

  app.post('/api/routines', async (request, response, next) => {
    try {
      const routine = await routineService.createRoutine(request.body);
      response.status(201).json({ data: routine });
    } catch (error) {
      next(error);
    }
  });

  app.post(
    '/api/routines/:routineId/check-in',
    async (request, response, next) => {
      try {
        const entry = await routineService.checkInRoutine({
          routineId: request.params.routineId,
          date: request.body.date,
          status: request.body.status,
          note: request.body.note,
        });
        response.json({ data: entry });
      } catch (error) {
        next(error);
      }
    },
  );

  app.patch('/api/routines/:routineId', async (request, response, next) => {
    try {
      const routine = await routineService.updateRoutine({
        routineId: request.params.routineId,
        title: request.body.title,
        description: request.body.description,
        frequency: request.body.frequency,
        targetPerPeriod: request.body.targetPerPeriod,
      });
      response.json({ data: routine });
    } catch (error) {
      next(error);
    }
  });

  app.delete('/api/routines/:routineId', async (request, response, next) => {
    try {
      await routineService.deleteRoutine({
        routineId: request.params.routineId,
      });
      response.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/skills', async (_request, response) => {
    const skills = await skillService.listSkills();
    response.json({ data: skills });
  });

  app.post('/api/skills', async (request, response, next) => {
    try {
      const skill = await skillService.createSkill(request.body);
      response.status(201).json({ data: skill });
    } catch (error) {
      next(error);
    }
  });

  app.patch('/api/skills/:skillId', async (request, response, next) => {
    try {
      const skill = await skillService.updateSkill({
        skillId: request.params.skillId,
        title: request.body.title,
        description: request.body.description,
        category: request.body.category,
      });
      response.json({ data: skill });
    } catch (error) {
      next(error);
    }
  });

  app.delete('/api/skills/:skillId', async (request, response, next) => {
    try {
      await skillService.deleteSkill({ skillId: request.params.skillId });
      response.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/skills/:skillId/stages', async (request, response, next) => {
    try {
      const stage = await skillService.createStage({
        skillId: request.params.skillId,
        title: request.body.title,
        description: request.body.description,
        order: request.body.order,
      });
      response.status(201).json({ data: stage });
    } catch (error) {
      next(error);
    }
  });

  app.patch('/api/skill-stages/:stageId', async (request, response, next) => {
    try {
      const stage = await skillService.updateStage({
        stageId: request.params.stageId,
        title: request.body.title,
        description: request.body.description,
        order: request.body.order,
      });
      response.json({ data: stage });
    } catch (error) {
      next(error);
    }
  });

  app.delete('/api/skill-stages/:stageId', async (request, response, next) => {
    try {
      await skillService.deleteStage({ stageId: request.params.stageId });
      response.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  app.post(
    '/api/skill-stages/:stageId/mark',
    async (request, response, next) => {
      try {
        const progress = await skillService.markStage({
          stageId: request.params.stageId,
          achievedAt: request.body.achievedAt,
          note: request.body.note,
        });
        response.json({ data: progress });
      } catch (error) {
        next(error);
      }
    },
  );

  app.use(
    (
      error: Error,
      _request: express.Request,
      response: express.Response,
      _next: express.NextFunction,
    ) => {
      if (error instanceof ZodError) {
        response.status(400).json({
          error: {
            message: 'Request validation failed',
            details: error.issues,
          },
        });

        return;
      }

      if (error instanceof TaskNotFoundError) {
        response.status(404).json({
          error: {
            message: error.message,
          },
        });

        return;
      }

      if (error instanceof RoutineNotFoundError) {
        response.status(404).json({
          error: {
            message: error.message,
          },
        });

        return;
      }

      if (error instanceof TelegramLinkError) {
        response.status(400).json({
          error: {
            message: error.message,
          },
        });

        return;
      }

      if (error instanceof TelegramWebAppAuthError) {
        response.status(400).json({
          error: {
            message: error.message,
          },
        });

        return;
      }

      if (
        error instanceof SkillNotFoundError ||
        error instanceof SkillStageNotFoundError
      ) {
        response.status(404).json({
          error: {
            message: error.message,
          },
        });

        return;
      }

      response.status(500).json({
        error: {
          message: error.message,
        },
      });
    },
  );

  return app;
};
