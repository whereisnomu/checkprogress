import { ensureWorkspaceEnv } from '@progress-state/shared-sqlite';

import { loadBotConfig } from './infra/config';
import { createBotRuntime } from './infra/services';
import {
  hasProcessedUpdate,
  hasReminderRun,
  markProcessedUpdate,
  markReminderRun,
} from './infra/reliability-store';
import { getZonedDateParts, isReminderDue } from './infra/time';
import { createBot } from './bot/create-bot';
import { formatReminderMessage } from './bot/formatters';

ensureWorkspaceEnv();
const config = loadBotConfig();
const runtime = createBotRuntime(config);

const bot = createBot({
  token: config.token,
  dashboardUrl: config.dashboardUrl,
  ownerChatId: config.ownerChatId,
  services: runtime.services,
});

bot.catch(async (error) => {
  console.error('Bot runtime error', error.error);

  try {
    await error.ctx.reply(
      'An unexpected bot error occurred. Please try again or use /menu.',
    );
  } catch {
    // ignore secondary reply errors
  }
});

bot.use(async (context, next) => {
  const updateId = context.update.update_id;

  if (hasProcessedUpdate(runtime.database, updateId)) {
    return;
  }

  await next();
  markProcessedUpdate(runtime.database, updateId, new Date().toISOString());
});

const checkAndSendReminder = async () => {
  if (!config.remindersEnabled || !config.ownerChatId) {
    return;
  }

  const now = new Date();
  const zoned = getZonedDateParts(now, config.timeZone);

  if (!isReminderDue(now, config.timeZone, config.dailyReminderTime)) {
    return;
  }

  if (hasReminderRun(runtime.database, 'daily-summary', zoned.date)) {
    return;
  }

  const [tasks, routines, skillSummary] = await Promise.all([
    runtime.services.taskService.listTasks(),
    runtime.services.routineService.listRoutines(),
    runtime.services.skillService.getProgressSummary(),
  ]);

  const openTasks = tasks.filter((task) => task.status !== 'done').length;

  await bot.api.sendMessage(
    Number(config.ownerChatId),
    formatReminderMessage({
      openTasks,
      routinesConfigured: routines.length,
      completedStages: skillSummary.completedStages,
      totalStages: skillSummary.totalStages,
    }),
  );

  markReminderRun(
    runtime.database,
    'daily-summary',
    zoned.date,
    now.toISOString(),
  );
};

setInterval(() => {
  void checkAndSendReminder();
}, 60_000);

bot.start();
