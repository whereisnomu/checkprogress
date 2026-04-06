# Progress State

Single-user productivity system with a web dashboard, Express API, SQLite storage, and a Telegram bot that operates on the same shared application core.

## Features

- task CRUD and completion tracking
- daily routines with check-ins
- skill tracking with ordered progression stages
- dashboard analytics with D3 charts
- Telegram control surface for tasks, routines, and skills
- reminder foundation with duplicate-send protection
- SQLite backup and dashboard export scripts

## Stack

- `Vite`
- `React`
- `TypeScript`
- `React Context`
- `shadcn/ui`
- `Express`
- `SQLite`
- `grammy`
- `Vitest`

## Architecture

Repository layout:

```text
apps/
  api/
  bot/
  web/
packages/
  shared/
  shared-sqlite/
docs/
scripts/
data/
```

Core rules:

1. Business logic lives in `packages/shared`.
2. SQLite repositories and migrations live in `packages/shared-sqlite`.
3. `apps/api` and `apps/bot` are adapters over the shared application layer.
4. `apps/web` consumes API contracts and owns UI state only.

## Product Surfaces

### Web

- `Dashboard`
- `Tasks`
- `Routines`
- `Skills`
- `Settings`

### Telegram

- `/start`
- `/help`
- `/today`
- `/add <title>`
- `/tasks`
- `/task_done <task-id>`
- `/routines`
- `/skills`
- `/stage_done <stage-id>`

## Local Setup

1. Install dependencies:

```bash
npm.cmd install
```

2. Copy `.env.example` to `.env` and fill the required values.
   The API, bot, and migration scripts load `.env` automatically from the repository root.

3. Run migrations:

```bash
npm.cmd run migrate
```

4. Start the API:

```bash
npm.cmd run dev --workspace @progress-state/api
```

5. Start the web app:

```bash
npm.cmd run dev --workspace @progress-state/web
```

6. Start the Telegram bot:

```bash
npm.cmd run dev --workspace @progress-state/bot
```

## One-Command Startup

To run migrations and start API, web, and bot together in one terminal:

```bash
npm.cmd run dev:all
```

This command runs migrations first and then starts all three services with a parallel runner.

On Windows you can also start everything by double-clicking:

```text
start.bat
```

## Environment Variables

```env
PORT=3001
SQLITE_PATH=./data/sqlite/progress-state.db
SQLITE_BUSY_TIMEOUT_MS=5000
BOT_TOKEN=
TELEGRAM_OWNER_CHAT_ID=
TELEGRAM_OWNER_USER_ID=
WEB_DASHBOARD_URL=http://localhost:3000
VITE_API_BASE_URL=http://localhost:3001
TZ=Europe/Moscow
REMINDERS_ENABLED=false
DAILY_REMINDER_TIME=20:00
LOG_LEVEL=info
```

Notes:

1. `TELEGRAM_OWNER_CHAT_ID` restricts bot access to a single chat.
2. `TZ` affects date-based routine logic and reminder timing.
3. `REMINDERS_ENABLED` and `DAILY_REMINDER_TIME` control daily reminder delivery.

## Scripts

Workspace:

```bash
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test
npm.cmd run migrate
```

Operations:

```bash
npm.cmd run backup:sqlite
npm.cmd run export:summary
```

## Reliability

The bot includes two persistence-backed safety mechanisms:

1. `processed_updates`
   Prevents duplicate processing of the same Telegram update.
2. `reminder_runs`
   Prevents duplicate reminder sends for the same day and reminder kind.

## Analytics

Dashboard charts currently include:

- task status distribution
- routine status distribution
- skill stage distribution
- task completion trend over 7 days
- routine activity heatmap over 30 days
- routine streak trend over 7 days

## Quality

The repository is covered by:

- shared application unit tests
- API integration tests
- bot formatter and adapter tests
- web integration-style UI tests

Current validation commands:

```bash
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test
```

## Operations Notes

1. Keep `data/sqlite` on persistent storage.
2. Run SQLite backups before schema or dependency upgrades.
3. Use the dashboard export command for lightweight analytics snapshots.
4. Run API and bot as long-lived services in production.
5. Serve the web app behind a reverse proxy or static host.

## Status

This project is in a strong `usable MVP+` state and is intended for comfortable daily use with room for iterative polish rather than core rework.
