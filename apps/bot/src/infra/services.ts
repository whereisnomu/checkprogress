import {
  RoutineService,
  SkillService,
  TaskService,
} from '@progress-state/shared';
import {
  openDatabase,
  runMigrations,
  type SqliteDatabase,
  SqliteRoutineRepository,
  SqliteSkillRepository,
  SqliteTaskRepository,
  SystemClock,
  UuidGenerator,
} from '@progress-state/shared-sqlite';
import type { BotConfig } from './config';

export type BotServices = {
  taskService: TaskService;
  routineService: RoutineService;
  skillService: SkillService;
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
    },
  };
};
