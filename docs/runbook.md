# Runbook

## Local Setup

1. Install dependencies with `npm.cmd install`.
2. Copy `.env.example` to `.env` and fill required values.
3. Run migrations with `npm.cmd run migrate`.
4. Start API with `npm.cmd run dev --workspace @progress-state/api`.
5. Start web with `npm.cmd run dev --workspace @progress-state/web`.
6. Start bot with `npm.cmd run dev --workspace @progress-state/bot` after `BOT_TOKEN` is configured.
7. Optional: enable reminders with `REMINDERS_ENABLED=true` and set `DAILY_REMINDER_TIME=HH:MM`.
8. Create a SQLite backup with `npm.cmd run backup:sqlite`.
9. Export dashboard summary and charts with `npm.cmd run export:summary`.
10. For a single-terminal local startup use `npm.cmd run dev:all`.
11. On Windows Explorer you can also launch everything by double-clicking `start.bat`.
12. Verify runtime health with `npm.cmd run health:check`.

## Current State

The repository currently contains:

- shared task domain and task service
- Express API with task and dashboard summary endpoints backed by SQLite
- web dashboard shell with summary cards
- Telegram bot integrated with shared task and routine flows
- Telegram help flows, update idempotency foundation, and reminder settings support

## Operations

1. SQLite backups are file-based and can be created with `npm.cmd run backup:sqlite`.
2. Dashboard exports are available through `npm.cmd run export:summary`.
3. Daily reminders are safe against duplicate sends for the same date via `reminder_runs`.
4. Telegram updates are safe against duplicate processing via `processed_updates`.
5. See `docs/deployment.md` for deployment-specific notes.

## Deployment Notes

1. Keep API, web, and bot under the same `.env` source where possible.
2. Use a persistent disk for `data/sqlite` and `data/backups`.
3. Back up the SQLite file before dependency or schema upgrades.
4. For VPS deployment, run API and bot as long-lived services and serve web as static assets or via `vite preview` behind a reverse proxy.
5. Set `TZ`, `REMINDERS_ENABLED`, and `DAILY_REMINDER_TIME` explicitly in production.

## Next Backend Step

Extend the SQLite layer from tasks to routines, skill progression, and Telegram update idempotency.

## Next Product Step

Implement the following slices in order:

1. SQLite task repository and migrations
2. routine domain and check-in flows
3. skill progression domain
4. dashboard chart datasets for D3 components
5. Telegram actions that call the same shared use cases
