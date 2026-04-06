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

import { loadConfig } from './infra/config';
import { createApp } from './server/create-app';

const config = loadConfig();
const database = openDatabase(config);

runMigrations(database, new Date().toISOString());

const idGenerator = new UuidGenerator();
const clock = new SystemClock();

const app = createApp({
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
  systemInfo: {
    webDashboardUrl: config.webDashboardUrl,
    timezone: config.timezone,
    telegramEnabled: config.telegramEnabled,
    ownerChatId: config.ownerChatId,
    remindersEnabled: config.remindersEnabled,
    dailyReminderTime: config.dailyReminderTime,
  },
});

app.listen(config.port, () => {
  console.warn(`API listening on http://localhost:${config.port}`);
});
