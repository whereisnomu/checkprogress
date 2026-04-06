import { Bot, InlineKeyboard } from 'grammy';
import type {
  CreateTaskInput,
  Routine,
  Skill,
  SkillProgressSummary,
  SkillStage,
  Task,
} from '@progress-state/shared';
import { toLocalDateString } from '@progress-state/shared';

import {
  formatBotHelp,
  formatRoutineList,
  formatSkillList,
  formatStageList,
  formatTaskList,
  formatTodayOverview,
} from './formatters';

type BotServices = {
  taskService: {
    createTask(input: CreateTaskInput): Promise<{ title: string }>;
    listTasks(): Promise<Task[]>;
    completeTask(input: { taskId: string }): Promise<unknown>;
  };
  routineService: {
    listRoutines(): Promise<Routine[]>;
    checkInRoutine(input: {
      routineId: string;
      date: string;
      status: 'done' | 'skipped';
      note?: string;
    }): Promise<unknown>;
  };
  skillService: {
    listSkills(): Promise<Skill[]>;
    listStagesBySkillId(skillId: string): Promise<SkillStage[]>;
    markStage(input: { stageId: string; note?: string }): Promise<unknown>;
    getProgressSummary(): Promise<SkillProgressSummary>;
  };
  telegramLinkService: {
    getLinkStatus(): Promise<{
      linkedChat: {
        chatId: string;
        userId: string | null;
        linkedAt: string;
      } | null;
      latestLinkToken: {
        code: string;
        createdAt: string;
        expiresAt: string;
        consumedAt: string | null;
      } | null;
    }>;
    linkTelegram(input: {
      code: string;
      chatId: string;
      userId?: string;
    }): Promise<unknown>;
  };
};

type BotConfig = {
  token: string;
  dashboardUrl: string;
  ownerChatId: string | null;
  services: BotServices;
};

const todayDate = () => toLocalDateString(new Date());

const isAllowedChat = (
  ownerChatId: string | null,
  linkedChatId: string | null,
  chatId: number | undefined,
) => {
  if (linkedChatId) {
    return String(chatId) === linkedChatId;
  }

  if (!ownerChatId) {
    return true;
  }

  return String(chatId) === ownerChatId;
};

export const createBot = ({
  token,
  dashboardUrl,
  ownerChatId,
  services,
}: BotConfig) => {
  const bot = new Bot(token);

  bot.use(async (context, next) => {
    const linkStatus = await services.telegramLinkService.getLinkStatus();
    const linkedChatId = linkStatus.linkedChat?.chatId ?? null;

    if (!isAllowedChat(ownerChatId, linkedChatId, context.chat?.id)) {
      await context.reply(
        'This bot is not linked to this chat yet. Generate a code in Settings and send /link <code>.',
      );
      return;
    }

    await next();
  });

  bot.command('start', async (context) => {
    const keyboard = new InlineKeyboard().text(
      'Open dashboard',
      'dashboard:open',
    );

    await context.reply(
      ['Progress State started.', '', formatBotHelp()].join('\n'),
      {
        reply_markup: keyboard,
      },
    );
  });

  bot.command('help', async (context) => {
    await context.reply(formatBotHelp());
  });

  bot.command('link', async (context) => {
    const code = context.match?.trim();

    if (!code || !context.chat?.id) {
      await context.reply('Usage: /link <code>');
      return;
    }

    try {
      const payload = {
        code,
        chatId: String(context.chat.id),
        ...(context.from?.id ? { userId: String(context.from.id) } : {}),
      };
      await services.telegramLinkService.linkTelegram(payload);
      await context.reply('Telegram chat linked successfully to the panel.');
    } catch (error) {
      await context.reply(
        error instanceof Error ? error.message : 'Telegram linking failed.',
      );
    }
  });

  bot.command('today', async (context) => {
    const [tasks, routines, skillSummary] = await Promise.all([
      services.taskService.listTasks(),
      services.routineService.listRoutines(),
      services.skillService.getProgressSummary(),
    ]);

    await context.reply(
      formatTodayOverview({
        tasks,
        routines,
        skillSummary,
        today: todayDate(),
      }),
    );
  });

  bot.command('add', async (context) => {
    const title = context.match?.trim();

    if (!title) {
      await context.reply('Usage: /add Write integration tests');
      return;
    }

    const task = await services.taskService.createTask({ title });
    await context.reply(`Task created: ${task.title}`);
  });

  bot.command('tasks', async (context) => {
    const tasks = await services.taskService.listTasks();

    if (tasks.length === 0) {
      await context.reply(formatTaskList(tasks));
      return;
    }

    const keyboard = new InlineKeyboard();
    for (const task of tasks
      .filter((item) => item.status !== 'done')
      .slice(0, 10)) {
      keyboard.text(task.title, `task:done:${task.id}`).row();
    }

    await context.reply(formatTaskList(tasks), { reply_markup: keyboard });
  });

  bot.command('task_done', async (context) => {
    const taskId = context.match?.trim();

    if (!taskId) {
      await context.reply('Usage: /task_done <task-id>');
      return;
    }

    await services.taskService.completeTask({ taskId });
    await context.reply(`Task ${taskId} marked as done.`);
  });

  bot.command('routines', async (context) => {
    const routines = await services.routineService.listRoutines();

    if (routines.length === 0) {
      await context.reply(formatRoutineList(routines));
      return;
    }

    const keyboard = new InlineKeyboard();
    for (const routine of routines) {
      keyboard.text(routine.title, `routine:done:${routine.id}`).row();
    }

    await context.reply(formatRoutineList(routines), {
      reply_markup: keyboard,
    });
  });

  bot.command('skills', async (context) => {
    const skills = await services.skillService.listSkills();

    if (skills.length === 0) {
      await context.reply(formatSkillList(skills));
      return;
    }

    const keyboard = new InlineKeyboard();
    for (const skill of skills.slice(0, 10)) {
      keyboard.text(skill.title, `skill:open:${skill.id}`).row();
    }

    await context.reply(formatSkillList(skills), { reply_markup: keyboard });
  });

  bot.command('stage_done', async (context) => {
    const stageId = context.match?.trim();

    if (!stageId) {
      await context.reply('Usage: /stage_done <stage-id>');
      return;
    }

    await services.skillService.markStage({ stageId });
    await context.reply(`Stage ${stageId} marked as complete.`);
  });

  bot.callbackQuery('dashboard:open', async (context) => {
    await context.answerCallbackQuery();
    await context.reply(`Open your dashboard: ${dashboardUrl}`);
  });

  bot.callbackQuery(/^task:done:(.+)$/i, async (context) => {
    const taskId = context.match[1];

    if (!taskId) {
      await context.answerCallbackQuery({ text: 'Task id is missing' });
      return;
    }

    await services.taskService.completeTask({ taskId });
    await context.answerCallbackQuery({ text: 'Task marked as done' });
    await context.reply('Task marked as done.');
  });

  bot.callbackQuery(/^routine:done:(.+)$/i, async (context) => {
    const routineId = context.match[1];

    if (!routineId) {
      await context.answerCallbackQuery({ text: 'Routine id is missing' });
      return;
    }

    await services.routineService.checkInRoutine({
      routineId,
      date: todayDate(),
      status: 'done',
    });

    await context.answerCallbackQuery({ text: 'Routine marked as done' });
    await context.reply('Routine marked as done for today.');
  });

  bot.callbackQuery(/^skill:open:(.+)$/i, async (context) => {
    const skillId = context.match[1];

    if (!skillId) {
      await context.answerCallbackQuery({ text: 'Skill id is missing' });
      return;
    }

    const skills = await services.skillService.listSkills();
    const skill = skills.find((item) => item.id === skillId);
    const stages = await services.skillService.listStagesBySkillId(skillId);

    if (!skill) {
      await context.answerCallbackQuery({ text: 'Skill was not found' });
      return;
    }

    const keyboard = new InlineKeyboard();
    for (const stage of stages) {
      keyboard
        .text(`${stage.order}. ${stage.title}`, `stage:done:${stage.id}`)
        .row();
    }

    await context.answerCallbackQuery();
    await context.reply(formatStageList(skill.title, stages), {
      reply_markup: keyboard,
    });
  });

  bot.callbackQuery(/^stage:done:(.+)$/i, async (context) => {
    const stageId = context.match[1];

    if (!stageId) {
      await context.answerCallbackQuery({ text: 'Stage id is missing' });
      return;
    }

    await services.skillService.markStage({ stageId });
    await context.answerCallbackQuery({ text: 'Stage marked as complete' });
    await context.reply('Skill stage marked as complete.');
  });

  return bot;
};
