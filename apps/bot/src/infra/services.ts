import {
  buildDashboardCharts,
  RoutineService,
  SkillService,
  TaskService,
  TelegramLinkService,
  toLocalDateString,
} from '@progress-state/shared';
import {
  openDatabase,
  runMigrations,
  type SqliteDatabase,
  SqliteRoutineRepository,
  SqliteSkillRepository,
  SqliteTaskRepository,
  SqliteTelegramLinkRepository,
  SystemClock,
  UuidGenerator,
} from '@progress-state/shared-sqlite';
import type { BotConfig } from './config';
import { clearDraft, getDraft, upsertDraft } from './draft-store';

export type BotServices = {
  taskService: TaskService;
  routineService: RoutineService;
  skillService: SkillService;
  analyticsService: {
    getCharts(): Promise<ReturnType<typeof buildDashboardCharts>>;
  };
  telegramLinkService: TelegramLinkService;
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

export type BotRuntime = {
  database: SqliteDatabase;
  services: BotServices;
};

export const createBotRuntime = (
  config: Pick<BotConfig, 'sqlitePath' | 'sqliteBusyTimeoutMs'>,
): BotRuntime => {
  const database = openDatabase(config);
  runMigrations(database, new Date().toISOString());

  const idGenerator = new UuidGenerator();
  const clock = new SystemClock();

  return {
    database,
    services: {
      taskService: new TaskService(
        new SqliteTaskRepository(database),
        idGenerator,
        clock,
      ),
      routineService: new RoutineService(
        new SqliteRoutineRepository(database),
        idGenerator,
        clock,
      ),
      skillService: new SkillService(
        new SqliteSkillRepository(database),
        idGenerator,
        clock,
      ),
      analyticsService: {
        getCharts: async () => {
          const now = new Date();
          const today = toLocalDateString(now);
          const start = new Date(now);
          start.setDate(start.getDate() - 29);
          const startDate = toLocalDateString(start);

          const [
            tasks,
            taskSummary,
            routineSummary,
            routineEntries,
            skillSummary,
          ] = await Promise.all([
            new TaskService(
              new SqliteTaskRepository(database),
              idGenerator,
              clock,
            ).listTasks(),
            new TaskService(
              new SqliteTaskRepository(database),
              idGenerator,
              clock,
            ).getDashboardSummary(),
            new RoutineService(
              new SqliteRoutineRepository(database),
              idGenerator,
              clock,
            ).getDailySummary(today),
            new RoutineService(
              new SqliteRoutineRepository(database),
              idGenerator,
              clock,
            ).listEntriesInRange(startDate, today),
            new SkillService(
              new SqliteSkillRepository(database),
              idGenerator,
              clock,
            ).getProgressSummary(),
          ]);

          return buildDashboardCharts({
            taskSummary,
            routineSummary,
            skillSummary,
            tasks,
            routineEntries,
            today: now,
          });
        },
      },
      telegramLinkService: new TelegramLinkService(
        new SqliteTelegramLinkRepository(database),
        idGenerator,
        clock,
      ),
      draftStore: {
        getDraft: (chatId: string) => getDraft(database, chatId),
        upsertDraft: (input) => upsertDraft(database, input),
        clearDraft: (chatId: string) => clearDraft(database, chatId),
      },
    },
  };
};
