import type { SqliteDatabase } from './database';

type Migration = {
  id: string;
  sql: string;
};

const migrations: Migration[] = [
  {
    id: '001_initial_schema',
    sql: `
      CREATE TABLE IF NOT EXISTS migrations (
        id TEXT PRIMARY KEY,
        applied_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        completed_at TEXT
      );

      CREATE TABLE IF NOT EXISTS routines (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        frequency TEXT NOT NULL,
        target_per_period INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS routine_entries (
        id TEXT PRIMARY KEY,
        routine_id TEXT NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
        entry_date TEXT NOT NULL,
        status TEXT NOT NULL,
        note TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        UNIQUE (routine_id, entry_date)
      );

      CREATE TABLE IF NOT EXISTS skills (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS skill_stages (
        id TEXT PRIMARY KEY,
        skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        stage_order INTEGER NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS skill_stage_progress (
        id TEXT PRIMARY KEY,
        skill_stage_id TEXT NOT NULL REFERENCES skill_stages(id) ON DELETE CASCADE,
        achieved_at TEXT NOT NULL,
        note TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        UNIQUE (skill_stage_id)
      );
    `,
  },
  {
    id: '002_telegram_linking',
    sql: `
      CREATE TABLE IF NOT EXISTS processed_updates (
        update_id INTEGER PRIMARY KEY,
        processed_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS reminder_runs (
        kind TEXT NOT NULL,
        run_date TEXT NOT NULL,
        executed_at TEXT NOT NULL,
        PRIMARY KEY (kind, run_date)
      );

      CREATE TABLE IF NOT EXISTS telegram_link_tokens (
        code TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        consumed_at TEXT
      );

      CREATE TABLE IF NOT EXISTS telegram_links (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        chat_id TEXT NOT NULL,
        user_id TEXT,
        linked_at TEXT NOT NULL
      );
    `,
  },
  {
    id: '003_bot_drafts',
    sql: `
      CREATE TABLE IF NOT EXISTS bot_drafts (
        chat_id TEXT PRIMARY KEY,
        kind TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `,
  },
];

export const runMigrations = (database: SqliteDatabase, now: string) => {
  database.exec(
    `
      CREATE TABLE IF NOT EXISTS migrations (
        id TEXT PRIMARY KEY,
        applied_at TEXT NOT NULL
      );
    `,
  );

  type MigrationRow = { id: string };

  const appliedIds = new Set(
    (
      database
        .prepare('SELECT id FROM migrations ORDER BY id ASC')
        .all() as MigrationRow[]
    ).map((row) => row.id),
  );

  const insertMigration = database.prepare(
    'INSERT INTO migrations (id, applied_at) VALUES (@id, @appliedAt)',
  );

  const applyMigration = database.transaction((migration: Migration) => {
    database.exec(migration.sql);
    insertMigration.run({ id: migration.id, appliedAt: now });
  });

  for (const migration of migrations) {
    if (!appliedIds.has(migration.id)) {
      applyMigration(migration);
    }
  }
};
