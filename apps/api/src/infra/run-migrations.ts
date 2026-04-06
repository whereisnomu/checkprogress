import { openDatabase, runMigrations } from '@progress-state/shared-sqlite';

import { loadConfig } from './config';

const config = loadConfig();
const database = openDatabase(config);

runMigrations(database, new Date().toISOString());
database.close();
