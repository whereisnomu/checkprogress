# Database Schema Draft

## Current Intent

SQLite remains the single source of truth for the API and Telegram bot. The bot should never keep durable progress state in memory.

## Tables

### tasks

```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  completed_at TEXT
);
```

### routines

```sql
CREATE TABLE routines (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT NOT NULL,
  target_per_period INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### routine_entries

```sql
CREATE TABLE routine_entries (
  id TEXT PRIMARY KEY,
  routine_id TEXT NOT NULL REFERENCES routines(id),
  entry_date TEXT NOT NULL,
  status TEXT NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (routine_id, entry_date)
);
```

### skills

```sql
CREATE TABLE skills (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### skill_stages

```sql
CREATE TABLE skill_stages (
  id TEXT PRIMARY KEY,
  skill_id TEXT NOT NULL REFERENCES skills(id),
  title TEXT NOT NULL,
  description TEXT,
  stage_order INTEGER NOT NULL
);
```

### skill_stage_progress

```sql
CREATE TABLE skill_stage_progress (
  id TEXT PRIMARY KEY,
  skill_stage_id TEXT NOT NULL REFERENCES skill_stages(id),
  achieved_at TEXT NOT NULL,
  note TEXT
);
```

### processed_updates

```sql
CREATE TABLE processed_updates (
  update_id TEXT PRIMARY KEY,
  processed_at TEXT NOT NULL
);
```

## Notes

1. Store timestamps as ISO strings in UTC.
2. Use application-level timezone rules for "today" and streak logic.
3. Add indexes once query patterns are finalized in the SQLite implementation phase.
4. Current implementation supports daily routines with one entry per routine per date.
5. Skills are modeled as ordered stages with one progress record per stage.
