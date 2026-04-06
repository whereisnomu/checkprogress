import Database from 'better-sqlite3';

export type SqliteDatabase = Database.Database;

export const openDatabase = (config: {
  sqlitePath: string;
  sqliteBusyTimeoutMs: number;
}): SqliteDatabase => {
  const database = new Database(config.sqlitePath);

  database.pragma('foreign_keys = ON');
  database.pragma('journal_mode = WAL');
  database.pragma('synchronous = NORMAL');
  database.pragma(`busy_timeout = ${config.sqliteBusyTimeoutMs}`);

  return database;
};
