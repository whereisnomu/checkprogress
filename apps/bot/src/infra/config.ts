import { z } from 'zod';

const configSchema = z.object({
  BOT_TOKEN: z.string().min(1),
  WEB_DASHBOARD_URL: z.string().url().default('http://localhost:3000'),
  TELEGRAM_OWNER_CHAT_ID: z.string().optional(),
  SQLITE_PATH: z.string().min(1).default('./data/sqlite/progress-state.db'),
  SQLITE_BUSY_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),
});

export type BotConfig = {
  token: string;
  dashboardUrl: string;
  ownerChatId: string | null;
  sqlitePath: string;
  sqliteBusyTimeoutMs: number;
};

export const loadBotConfig = (
  env: NodeJS.ProcessEnv = process.env,
): BotConfig => {
  const parsed = configSchema.parse(env);

  return {
    token: parsed.BOT_TOKEN,
    dashboardUrl: parsed.WEB_DASHBOARD_URL,
    ownerChatId: parsed.TELEGRAM_OWNER_CHAT_ID ?? null,
    sqlitePath: parsed.SQLITE_PATH,
    sqliteBusyTimeoutMs: parsed.SQLITE_BUSY_TIMEOUT_MS,
  };
};
