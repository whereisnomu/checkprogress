import { Bot, InlineKeyboard } from 'grammy';
import type {
  CreateTaskInput,
  DashboardCharts,
  Routine,
  Skill,
  SkillProgressSummary,
  SkillStage,
  Task,
} from '@progress-state/shared';
import { toLocalDateString } from '@progress-state/shared';

import {
  formatAnalyticsSummary,
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
    deleteTask(input: { taskId: string }): Promise<void>;
  };
  routineService: {
    listRoutines(): Promise<Routine[]>;
    createRoutine(input: {
      title: string;
      frequency: 'daily';
      targetPerPeriod: number;
    }): Promise<unknown>;
    checkInRoutine(input: {
      routineId: string;
      date: string;
      status: 'done' | 'skipped';
      note?: string;
    }): Promise<unknown>;
    deleteRoutine(input: { routineId: string }): Promise<void>;
  };
  skillService: {
    listSkills(): Promise<Skill[]>;
    createSkill(input: { title: string; category?: string }): Promise<Skill>;
    createStage(input: {
      skillId: string;
      title: string;
      order: number;
    }): Promise<unknown>;
    listStagesBySkillId(skillId: string): Promise<SkillStage[]>;
    markStage(input: { stageId: string; note?: string }): Promise<unknown>;
    getProgressSummary(): Promise<SkillProgressSummary>;
    deleteSkill(input: { skillId: string }): Promise<void>;
    deleteStage(input: { stageId: string }): Promise<void>;
  };
  analyticsService: {
    getCharts(): Promise<DashboardCharts>;
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
  draftStore: {
    getDraft(chatId: string): { kind: string; payloadJson: string } | null;
    upsertDraft(input: {
      chatId: string;
      kind: string;
      payloadJson: string;
      updatedAt: string;
    }): void;
    clearDraft(chatId: string): void;
  };
};

type BotConfig = {
  token: string;
  dashboardUrl: string;
  ownerChatId: string | null;
  services: BotServices;
};

const todayDate = () => toLocalDateString(new Date());
const PAGE_SIZE = 5;

const buildMainMenuKeyboard = () =>
  new InlineKeyboard()
    .text('Today', 'menu:today')
    .text('Tasks', 'menu:tasks')
    .row()
    .text('Routines', 'menu:routines')
    .text('Skills', 'menu:skills')
    .row()
    .text('Create', 'menu:create')
    .text('Analytics', 'menu:analytics')
    .row()
    .text('Open App', 'webapp:open')
    .text('Settings', 'dashboard:open');

const buildCreateMenuKeyboard = () =>
  new InlineKeyboard()
    .text('New task', 'create:task')
    .text('New routine', 'create:routine')
    .row()
    .text('New skill', 'create:skill')
    .text('New stage', 'create:stage:pick')
    .row()
    .text('Back to menu', 'menu:root');

const buildBackMenuKeyboard = () =>
  new InlineKeyboard().text('Back to menu', 'menu:root');

const buildCancelDraftKeyboard = () =>
  new InlineKeyboard().text('Cancel', 'draft:cancel');

const paginate = <T>(items: T[], page: number) => {
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage = Math.max(0, Math.min(page, totalPages - 1));
  const start = safePage * PAGE_SIZE;

  return {
    items: items.slice(start, start + PAGE_SIZE),
    page: safePage,
    totalPages,
  };
};

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
    const incomingText =
      'message' in context.update ? context.update.message?.text : undefined;
    const isLinkCommand =
      typeof incomingText === 'string' && incomingText.startsWith('/link');

    if (
      !isLinkCommand &&
      !isAllowedChat(ownerChatId, linkedChatId, context.chat?.id)
    ) {
      await context.reply(
        'This bot is not linked to this chat yet. Generate a code in Settings and send /link <code>.',
      );
      return;
    }

    await next();
  });

  bot.command('start', async (context) => {
    const keyboard = buildMainMenuKeyboard();

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

  bot.command('status', async (context) => {
    const status = await services.telegramLinkService.getLinkStatus();
    await context.reply(
      status.linkedChat
        ? `Linked chat: ${status.linkedChat.chatId}`
        : 'Bot is not linked yet. Generate a code in Settings and send /link <code>.',
    );
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

  bot.command('menu', async (context) => {
    await context.reply('Main menu', { reply_markup: buildMainMenuKeyboard() });
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

  bot.command('new_routine', async (context) => {
    if (!context.chat?.id) return;

    services.draftStore.upsertDraft({
      chatId: String(context.chat.id),
      kind: 'new_routine',
      payloadJson: JSON.stringify({ step: 'title' }),
      updatedAt: new Date().toISOString(),
    });

    await context.reply('Send the title for the new routine.', {
      reply_markup: buildCancelDraftKeyboard(),
    });
  });

  bot.command('new_skill', async (context) => {
    if (!context.chat?.id) return;

    services.draftStore.upsertDraft({
      chatId: String(context.chat.id),
      kind: 'new_skill',
      payloadJson: JSON.stringify({ step: 'title' }),
      updatedAt: new Date().toISOString(),
    });

    await context.reply('Send the title for the new skill.', {
      reply_markup: buildCancelDraftKeyboard(),
    });
  });

  bot.command('new_stage', async (context) => {
    if (!context.chat?.id) return;

    const skillId = context.match?.trim();
    if (!skillId) {
      await context.reply('Usage: /new_stage <skill-id>');
      return;
    }

    services.draftStore.upsertDraft({
      chatId: String(context.chat.id),
      kind: 'new_stage',
      payloadJson: JSON.stringify({ step: 'title', skillId }),
      updatedAt: new Date().toISOString(),
    });

    await context.reply('Send the title for the new stage.', {
      reply_markup: buildCancelDraftKeyboard(),
    });
  });

  bot.on('message:text', async (context, next) => {
    const text = context.message.text;
    if (text.startsWith('/')) {
      await next();
      return;
    }

    if (!context.chat?.id) {
      await next();
      return;
    }

    const chatId = String(context.chat.id);
    const draft = services.draftStore.getDraft(chatId);

    if (!draft) {
      await next();
      return;
    }

    const payload = JSON.parse(draft.payloadJson) as Record<string, string>;

    if (draft.kind === 'new_routine') {
      if (payload.step === 'title') {
        services.draftStore.upsertDraft({
          chatId,
          kind: 'new_routine',
          payloadJson: JSON.stringify({ step: 'target', title: text.trim() }),
          updatedAt: new Date().toISOString(),
        });
        await context.reply('Send the target per day as a number.', {
          reply_markup: buildCancelDraftKeyboard(),
        });
        return;
      }

      if (payload.step === 'target') {
        await services.routineService.createRoutine({
          title: payload.title ?? 'Routine',
          frequency: 'daily',
          targetPerPeriod: Number(text.trim()) || 1,
        });
        services.draftStore.clearDraft(chatId);
        await context.reply('Routine created.', {
          reply_markup: buildBackMenuKeyboard(),
        });
        return;
      }
    }

    if (draft.kind === 'new_skill') {
      if (payload.step === 'title') {
        services.draftStore.upsertDraft({
          chatId,
          kind: 'new_skill',
          payloadJson: JSON.stringify({ step: 'category', title: text.trim() }),
          updatedAt: new Date().toISOString(),
        });
        await context.reply('Send the category for the skill, or type skip.', {
          reply_markup: buildCancelDraftKeyboard(),
        });
        return;
      }

      if (payload.step === 'category') {
        await services.skillService.createSkill({
          title: payload.title ?? 'Skill',
          ...(text.trim().toLowerCase() !== 'skip'
            ? { category: text.trim() }
            : {}),
        });
        services.draftStore.clearDraft(chatId);
        await context.reply('Skill created.', {
          reply_markup: buildBackMenuKeyboard(),
        });
        return;
      }
    }

    if (draft.kind === 'new_stage') {
      if (payload.step === 'title') {
        services.draftStore.upsertDraft({
          chatId,
          kind: 'new_stage',
          payloadJson: JSON.stringify({
            step: 'order',
            skillId: payload.skillId,
            title: text.trim(),
          }),
          updatedAt: new Date().toISOString(),
        });
        await context.reply('Send the stage order as a number.', {
          reply_markup: buildCancelDraftKeyboard(),
        });
        return;
      }

      if (payload.step === 'order') {
        await services.skillService.createStage({
          skillId: payload.skillId ?? '',
          title: payload.title ?? 'Stage',
          order: Number(text.trim()) || 1,
        });
        services.draftStore.clearDraft(chatId);
        await context.reply('Stage created.', {
          reply_markup: buildBackMenuKeyboard(),
        });
        return;
      }
    }

    await next();
  });

  bot.command('tasks', async (context) => {
    const tasks = await services.taskService.listTasks();

    if (tasks.length === 0) {
      await context.reply(formatTaskList(tasks), {
        reply_markup: buildBackMenuKeyboard(),
      });
      return;
    }

    const { items, page, totalPages } = paginate(tasks, 0);
    const keyboard = new InlineKeyboard();
    for (const task of items.filter((item) => item.status !== 'done')) {
      keyboard.text(task.title, `task:done:${task.id}`).row();
    }

    for (const task of items) {
      keyboard
        .text(`Delete ${task.title}`, `task:delete:confirm:${task.id}`)
        .row();
    }

    if (totalPages > 1) {
      if (page > 0) {
        keyboard.text('Prev', `menu:tasks:${page - 1}`);
      }
      if (page < totalPages - 1) {
        keyboard.text('Next', `menu:tasks:${page + 1}`);
      }
      keyboard.row();
    }

    keyboard.text('Back to menu', 'menu:root');

    await context.reply(formatTaskList(items), { reply_markup: keyboard });
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
      await context.reply(formatRoutineList(routines), {
        reply_markup: buildBackMenuKeyboard(),
      });
      return;
    }

    const { items, page, totalPages } = paginate(routines, 0);
    const keyboard = new InlineKeyboard();
    for (const routine of items) {
      keyboard.text(routine.title, `routine:done:${routine.id}`).row();
      keyboard
        .text(`Delete ${routine.title}`, `routine:delete:confirm:${routine.id}`)
        .row();
    }

    if (totalPages > 1) {
      if (page > 0) {
        keyboard.text('Prev', `menu:routines:${page - 1}`);
      }
      if (page < totalPages - 1) {
        keyboard.text('Next', `menu:routines:${page + 1}`);
      }
      keyboard.row();
    }

    keyboard.text('Back to menu', 'menu:root');

    await context.reply(formatRoutineList(items), {
      reply_markup: keyboard,
    });
  });

  bot.command('skills', async (context) => {
    const skills = await services.skillService.listSkills();

    if (skills.length === 0) {
      await context.reply(formatSkillList(skills), {
        reply_markup: buildBackMenuKeyboard(),
      });
      return;
    }

    const { items, page, totalPages } = paginate(skills, 0);
    const keyboard = new InlineKeyboard();
    for (const skill of items) {
      keyboard.text(skill.title, `skill:open:${skill.id}`).row();
      keyboard
        .text(`Delete ${skill.title}`, `skill:delete:confirm:${skill.id}`)
        .row();
    }

    if (totalPages > 1) {
      if (page > 0) {
        keyboard.text('Prev', `menu:skills:${page - 1}`);
      }
      if (page < totalPages - 1) {
        keyboard.text('Next', `menu:skills:${page + 1}`);
      }
      keyboard.row();
    }

    keyboard.text('Back to menu', 'menu:root');

    await context.reply(formatSkillList(items), { reply_markup: keyboard });
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

  bot.command('analytics', async (context) => {
    const charts = await services.analyticsService.getCharts();
    await context.reply(formatAnalyticsSummary(charts));
  });

  bot.callbackQuery('dashboard:open', async (context) => {
    await context.answerCallbackQuery();
    await context.reply(`Open your dashboard: ${dashboardUrl}`);
  });

  bot.callbackQuery('webapp:open', async (context) => {
    await context.answerCallbackQuery();
    const keyboard = new InlineKeyboard().webApp(
      'Launch Telegram App',
      `${dashboardUrl}/tg`,
    );
    await context.reply('Open the Telegram Web App:', {
      reply_markup: keyboard,
    });
  });

  bot.callbackQuery('menu:root', async (context) => {
    await context.answerCallbackQuery();
    await context.reply('Main menu', { reply_markup: buildMainMenuKeyboard() });
  });

  bot.callbackQuery('menu:create', async (context) => {
    await context.answerCallbackQuery();
    await context.reply('Create menu', {
      reply_markup: buildCreateMenuKeyboard(),
    });
  });

  bot.callbackQuery('create:task', async (context) => {
    await context.answerCallbackQuery();
    await context.reply('Use /add <title> to create a task quickly.', {
      reply_markup: buildCreateMenuKeyboard(),
    });
  });

  bot.callbackQuery('create:routine', async (context) => {
    if (!context.chat?.id) return;
    services.draftStore.upsertDraft({
      chatId: String(context.chat.id),
      kind: 'new_routine',
      payloadJson: JSON.stringify({ step: 'title' }),
      updatedAt: new Date().toISOString(),
    });
    await context.answerCallbackQuery();
    await context.reply('Send the title for the new routine.', {
      reply_markup: buildCancelDraftKeyboard(),
    });
  });

  bot.callbackQuery('create:skill', async (context) => {
    if (!context.chat?.id) return;
    services.draftStore.upsertDraft({
      chatId: String(context.chat.id),
      kind: 'new_skill',
      payloadJson: JSON.stringify({ step: 'title' }),
      updatedAt: new Date().toISOString(),
    });
    await context.answerCallbackQuery();
    await context.reply('Send the title for the new skill.', {
      reply_markup: buildCancelDraftKeyboard(),
    });
  });

  bot.callbackQuery('create:stage:pick', async (context) => {
    await context.answerCallbackQuery();
    const skills = await services.skillService.listSkills();

    if (skills.length === 0) {
      await context.reply('No skills available. Create a skill first.', {
        reply_markup: buildCreateMenuKeyboard(),
      });
      return;
    }

    const keyboard = new InlineKeyboard();
    for (const skill of skills.slice(0, 10)) {
      keyboard.text(skill.title, `create:stage:${skill.id}`).row();
    }
    keyboard.text('Back to create menu', 'menu:create');

    await context.reply('Choose a skill for the new stage.', {
      reply_markup: keyboard,
    });
  });

  bot.callbackQuery(/^create:stage:(.+)$/i, async (context) => {
    const skillId = context.match[1];

    if (!skillId || !context.chat?.id) {
      await context.answerCallbackQuery({ text: 'Skill id is missing' });
      return;
    }

    services.draftStore.upsertDraft({
      chatId: String(context.chat.id),
      kind: 'new_stage',
      payloadJson: JSON.stringify({ step: 'title', skillId }),
      updatedAt: new Date().toISOString(),
    });
    await context.answerCallbackQuery();
    await context.reply('Send the title for the new stage.', {
      reply_markup: buildCancelDraftKeyboard(),
    });
  });

  bot.callbackQuery('draft:cancel', async (context) => {
    if (context.chat?.id) {
      services.draftStore.clearDraft(String(context.chat.id));
    }
    await context.answerCallbackQuery({ text: 'Draft cancelled' });
    await context.reply('Draft cancelled.', {
      reply_markup: buildMainMenuKeyboard(),
    });
  });

  bot.callbackQuery('menu:today', async (context) => {
    await context.answerCallbackQuery();
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

  bot.callbackQuery('menu:tasks', async (context) => {
    await context.answerCallbackQuery();
    const tasks = await services.taskService.listTasks();
    const keyboard = new InlineKeyboard();
    for (const task of tasks
      .filter((item) => item.status !== 'done')
      .slice(0, 10)) {
      keyboard.text(task.title, `task:done:${task.id}`).row();
    }
    await context.reply(formatTaskList(tasks), { reply_markup: keyboard });
  });

  bot.callbackQuery(/^menu:tasks:(\d+)$/i, async (context) => {
    await context.answerCallbackQuery();
    const tasks = await services.taskService.listTasks();
    const page = Number(context.match[1] ?? '0');
    const { items, totalPages } = paginate(tasks, page);
    const keyboard = new InlineKeyboard();

    for (const task of items.filter((item) => item.status !== 'done')) {
      keyboard.text(task.title, `task:done:${task.id}`).row();
    }
    for (const task of items) {
      keyboard
        .text(`Delete ${task.title}`, `task:delete:confirm:${task.id}`)
        .row();
    }
    if (totalPages > 1) {
      if (page > 0) keyboard.text('Prev', `menu:tasks:${page - 1}`);
      if (page < totalPages - 1)
        keyboard.text('Next', `menu:tasks:${page + 1}`);
      keyboard.row();
    }
    keyboard.text('Back to menu', 'menu:root');

    await context.reply(formatTaskList(items), { reply_markup: keyboard });
  });

  bot.callbackQuery('menu:routines', async (context) => {
    await context.answerCallbackQuery();
    const routines = await services.routineService.listRoutines();

    if (routines.length === 0) {
      await context.reply(formatRoutineList(routines));
      return;
    }

    const keyboard = new InlineKeyboard();
    for (const routine of routines.slice(0, 10)) {
      keyboard.text(routine.title, `routine:done:${routine.id}`).row();
    }
    await context.reply(formatRoutineList(routines), {
      reply_markup: keyboard,
    });
  });

  bot.callbackQuery(/^menu:routines:(\d+)$/i, async (context) => {
    await context.answerCallbackQuery();
    const routines = await services.routineService.listRoutines();
    const page = Number(context.match[1] ?? '0');
    const { items, totalPages } = paginate(routines, page);
    const keyboard = new InlineKeyboard();

    for (const routine of items) {
      keyboard.text(routine.title, `routine:done:${routine.id}`).row();
      keyboard
        .text(`Delete ${routine.title}`, `routine:delete:confirm:${routine.id}`)
        .row();
    }
    if (totalPages > 1) {
      if (page > 0) keyboard.text('Prev', `menu:routines:${page - 1}`);
      if (page < totalPages - 1)
        keyboard.text('Next', `menu:routines:${page + 1}`);
      keyboard.row();
    }
    keyboard.text('Back to menu', 'menu:root');

    await context.reply(formatRoutineList(items), { reply_markup: keyboard });
  });

  bot.callbackQuery('menu:skills', async (context) => {
    await context.answerCallbackQuery();
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

  bot.callbackQuery(/^menu:skills:(\d+)$/i, async (context) => {
    await context.answerCallbackQuery();
    const skills = await services.skillService.listSkills();
    const page = Number(context.match[1] ?? '0');
    const { items, totalPages } = paginate(skills, page);
    const keyboard = new InlineKeyboard();

    for (const skill of items) {
      keyboard.text(skill.title, `skill:open:${skill.id}`).row();
      keyboard
        .text(`Delete ${skill.title}`, `skill:delete:confirm:${skill.id}`)
        .row();
    }
    if (totalPages > 1) {
      if (page > 0) keyboard.text('Prev', `menu:skills:${page - 1}`);
      if (page < totalPages - 1)
        keyboard.text('Next', `menu:skills:${page + 1}`);
      keyboard.row();
    }
    keyboard.text('Back to menu', 'menu:root');

    await context.reply(formatSkillList(items), { reply_markup: keyboard });
  });

  bot.callbackQuery('menu:analytics', async (context) => {
    await context.answerCallbackQuery();
    const charts = await services.analyticsService.getCharts();
    await context.reply(formatAnalyticsSummary(charts));
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

  bot.callbackQuery(/^task:delete:(.+)$/i, async (context) => {
    const fullMatch = context.match[1];

    if (!fullMatch) {
      await context.answerCallbackQuery({ text: 'Task id is missing' });
      return;
    }

    if (fullMatch.startsWith('confirm:')) {
      const taskId = fullMatch.replace('confirm:', '');
      const keyboard = new InlineKeyboard()
        .text('Confirm delete', `task:delete:${taskId}`)
        .text('Cancel', 'menu:tasks');

      await context.answerCallbackQuery();
      await context.reply('Delete this task?', { reply_markup: keyboard });
      return;
    }

    const taskId = fullMatch;

    if (!taskId) {
      await context.answerCallbackQuery({ text: 'Task id is missing' });
      return;
    }

    await services.taskService.deleteTask({ taskId });
    await context.answerCallbackQuery({ text: 'Task deleted' });
    await context.reply('Task deleted.');
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

  bot.callbackQuery(/^routine:delete:(.+)$/i, async (context) => {
    const fullMatch = context.match[1];

    if (!fullMatch) {
      await context.answerCallbackQuery({ text: 'Routine id is missing' });
      return;
    }

    if (fullMatch.startsWith('confirm:')) {
      const routineId = fullMatch.replace('confirm:', '');
      const keyboard = new InlineKeyboard()
        .text('Confirm delete', `routine:delete:${routineId}`)
        .text('Cancel', 'menu:routines');

      await context.answerCallbackQuery();
      await context.reply('Delete this routine?', { reply_markup: keyboard });
      return;
    }

    const routineId = fullMatch;

    if (!routineId) {
      await context.answerCallbackQuery({ text: 'Routine id is missing' });
      return;
    }

    await services.routineService.deleteRoutine({ routineId });
    await context.answerCallbackQuery({ text: 'Routine deleted' });
    await context.reply('Routine deleted.');
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
      keyboard.text(`Delete ${stage.title}`, `stage:delete:${stage.id}`).row();
    }

    await context.answerCallbackQuery();
    await context.reply(formatStageList(skill.title, stages), {
      reply_markup: keyboard,
    });
  });

  bot.callbackQuery(/^skill:delete:(.+)$/i, async (context) => {
    const fullMatch = context.match[1];

    if (!fullMatch) {
      await context.answerCallbackQuery({ text: 'Skill id is missing' });
      return;
    }

    if (fullMatch.startsWith('confirm:')) {
      const skillId = fullMatch.replace('confirm:', '');
      const keyboard = new InlineKeyboard()
        .text('Confirm delete', `skill:delete:${skillId}`)
        .text('Cancel', 'menu:skills');

      await context.answerCallbackQuery();
      await context.reply('Delete this skill?', { reply_markup: keyboard });
      return;
    }

    const skillId = fullMatch;

    if (!skillId) {
      await context.answerCallbackQuery({ text: 'Skill id is missing' });
      return;
    }

    await services.skillService.deleteSkill({ skillId });
    await context.answerCallbackQuery({ text: 'Skill deleted' });
    await context.reply('Skill deleted.');
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

  bot.callbackQuery(/^stage:delete:(.+)$/i, async (context) => {
    const fullMatch = context.match[1];

    if (!fullMatch) {
      await context.answerCallbackQuery({ text: 'Stage id is missing' });
      return;
    }

    if (fullMatch.startsWith('confirm:')) {
      const stageId = fullMatch.replace('confirm:', '');
      const keyboard = new InlineKeyboard()
        .text('Confirm delete', `stage:delete:${stageId}`)
        .text('Cancel', 'menu:skills');

      await context.answerCallbackQuery();
      await context.reply('Delete this stage?', { reply_markup: keyboard });
      return;
    }

    const stageId = fullMatch;

    if (!stageId) {
      await context.answerCallbackQuery({ text: 'Stage id is missing' });
      return;
    }

    await services.skillService.deleteStage({ stageId });
    await context.answerCallbackQuery({ text: 'Stage deleted' });
    await context.reply('Skill stage deleted.');
  });

  return bot;
};
