import { mkdirSync } from 'node:fs';
import path from 'node:path';

import Database from 'better-sqlite3';

import { resolveWorkspaceRoot } from './env';

export type SqliteDatabase = Database.Database;

export const openDatabase = (config: {
  sqlitePath: string;
  sqliteBusyTimeoutMs: number;
}): SqliteDatabase => {
  const resolvedSqlitePath =
    config.sqlitePath === ':memory:'
      ? ':memory:'
      : path.isAbsolute(config.sqlitePath)
        ? config.sqlitePath
        : path.resolve(resolveWorkspaceRoot(), config.sqlitePath);

  if (resolvedSqlitePath !== ':memory:') {
    const directoryPath = path.dirname(resolvedSqlitePath);
    mkdirSync(directoryPath, { recursive: true });
  }

  const database = new Database(resolvedSqlitePath);

  database.pragma('foreign_keys = ON');
  database.pragma('journal_mode = WAL');
  database.pragma('synchronous = NORMAL');
  database.pragma(`busy_timeout = ${config.sqliteBusyTimeoutMs}`);

  return database;
};
