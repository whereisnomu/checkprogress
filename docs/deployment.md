# Deployment Guide

## Target

This project is optimized for:

1. local single-user usage
2. single VPS deployment
3. SQLite-backed persistence on a persistent disk

## Recommended Production Layout

```text
/opt/progress-state/
  app/
  data/sqlite/
  data/backups/
  .env
```

## Requirements

1. Node.js 22+
2. npm
3. persistent filesystem for SQLite
4. HTTPS endpoint if using Telegram Web Apps outside local development

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example`.

3. Run migrations:

```bash
npm run migrate
```

4. Build if needed:

```bash
npm run build
```

## Runtime Model

Recommended long-lived processes:

1. API
2. Bot
3. Web static host or Vite preview for simple deployments

## Minimal VPS Strategy

1. Run API on `localhost:3001`
2. Run web on `localhost:3000` or serve built assets behind a reverse proxy
3. Run bot as a separate background service
4. Put Nginx or Caddy in front for HTTPS

## SQLite Notes

1. Keep `SQLITE_PATH` on persistent storage
2. Back up before upgrades or schema changes
3. Use `npm run backup:sqlite` regularly

## Telegram Web Apps Notes

1. `WEB_DASHBOARD_URL` must be reachable over HTTPS in production
2. Telegram `initData` is verified by the API endpoint
3. Keep `BOT_TOKEN` private and never expose it to the frontend

## Recommended Environment

```env
PORT=3001
SQLITE_PATH=./data/sqlite/progress-state.db
SQLITE_BUSY_TIMEOUT_MS=5000
BOT_TOKEN=
TELEGRAM_OWNER_CHAT_ID=
TELEGRAM_BOT_USERNAME=
WEB_DASHBOARD_URL=https://your-domain.example
VITE_API_BASE_URL=https://your-domain.example
TZ=Europe/Moscow
REMINDERS_ENABLED=true
DAILY_REMINDER_TIME=20:00
LOG_LEVEL=info
```

## Health Checks

1. API:

```text
GET /health
```

2. Local operational health script:

```bash
npm run health:check
```

## Release Checklist

1. `npm run lint`
2. `npm run typecheck`
3. `npm run test`
4. `npm run backup:sqlite`
5. deploy code
6. `npm run migrate`
7. verify `/health`
8. verify Telegram bot responds
9. verify `/tg` opens inside Telegram Web Apps
