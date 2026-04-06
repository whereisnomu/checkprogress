import { z } from 'zod';

const configSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  SQLITE_PATH: z.string().min(1).default('./data/sqlite/progress-state.db'),
  SQLITE_BUSY_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),
  WEB_DASHBOARD_URL: z.string().url().default('http://localhost:3000'),
  TZ: z.string().default('UTC'),
  BOT_TOKEN: z.string().optional(),
  TELEGRAM_OWNER_CHAT_ID: z.string().optional(),
  TELEGRAM_BOT_USERNAME: z.string().optional(),
  REMINDERS_ENABLED: z.coerce.boolean().default(false),
  DAILY_REMINDER_TIME: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .default('20:00'),
});

export type ApiConfig = {
  port: number;
  sqlitePath: string;
  sqliteBusyTimeoutMs: number;
  webDashboardUrl: string;
  timezone: string;
  telegramEnabled: boolean;
  ownerChatId: string | null;
  telegramBotUsername: string | null;
  remindersEnabled: boolean;
  dailyReminderTime: string;
};

export const loadConfig = (env: NodeJS.ProcessEnv = process.env): ApiConfig => {
  const parsed = configSchema.parse(env);

  return {
    port: parsed.PORT,
    sqlitePath: parsed.SQLITE_PATH,
    sqliteBusyTimeoutMs: parsed.SQLITE_BUSY_TIMEOUT_MS,
    webDashboardUrl: parsed.WEB_DASHBOARD_URL,
    timezone: parsed.TZ,
    telegramEnabled: Boolean(parsed.BOT_TOKEN),
    ownerChatId: parsed.TELEGRAM_OWNER_CHAT_ID ?? null,
    telegramBotUsername: parsed.TELEGRAM_BOT_USERNAME ?? null,
    remindersEnabled: parsed.REMINDERS_ENABLED,
    dailyReminderTime: parsed.DAILY_REMINDER_TIME,
  };
};
