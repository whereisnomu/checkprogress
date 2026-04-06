import {
  RoutineService,
  SkillService,
  TaskService,
} from '@progress-state/shared';
import {
  openDatabase,
  runMigrations,
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

export const createBotServices = (
  config: Pick<BotConfig, 'sqlitePath' | 'sqliteBusyTimeoutMs'>,
): BotServices => {
  const database = openDatabase(config);
  runMigrations(database, new Date().toISOString());

  const idGenerator = new UuidGenerator();
  const clock = new SystemClock();

  return {
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
  };
};
