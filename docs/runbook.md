# Runbook

## Local Setup

1. Install dependencies with `npm.cmd install`.
2. Copy `.env.example` to `.env` and fill required values.
3. Run migrations with `npm.cmd run migrate`.
4. Start API with `npm.cmd run dev --workspace @progress-state/api`.
5. Start web with `npm.cmd run dev --workspace @progress-state/web`.
6. Start bot with `npm.cmd run dev --workspace @progress-state/bot` after `BOT_TOKEN` is configured.

## Current State

The repository currently contains:

- shared task domain and task service
- Express API with task and dashboard summary endpoints backed by SQLite
- web dashboard shell with summary cards
- Telegram bot integrated with shared task and routine flows

## Next Backend Step

Extend the SQLite layer from tasks to routines, skill progression, and Telegram update idempotency.

## Next Product Step

Implement the following slices in order:

1. SQLite task repository and migrations
2. routine domain and check-in flows
3. skill progression domain
4. dashboard chart datasets for D3 components
5. Telegram actions that call the same shared use cases
