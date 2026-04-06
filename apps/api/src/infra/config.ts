import { z } from 'zod';

const configSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  SQLITE_PATH: z.string().min(1).default('./data/sqlite/progress-state.db'),
  SQLITE_BUSY_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),
});

export type ApiConfig = {
  port: number;
  sqlitePath: string;
  sqliteBusyTimeoutMs: number;
};

export const loadConfig = (env: NodeJS.ProcessEnv = process.env): ApiConfig => {
  const parsed = configSchema.parse(env);

  return {
    port: parsed.PORT,
    sqlitePath: parsed.SQLITE_PATH,
    sqliteBusyTimeoutMs: parsed.SQLITE_BUSY_TIMEOUT_MS,
  };
};
