# Development Guide

## Product Scope

This repository contains a single-user productivity system with:
- a web dashboard
- an Express API
- a Telegram bot
- a shared TypeScript domain/application core

The first release targets local or VPS deployment with SQLite.

## Architecture Rules

1. Business rules live in `packages/shared` only.
2. `apps/api` and `apps/bot` are thin adapters over shared use cases.
3. `apps/web` consumes API contracts and does not implement domain rules.
4. Shared code must not depend on Express, Telegram SDKs, React, or SQLite.
5. Validation schemas should be shared when they define transport contracts.
6. Keep modules small and cohesive. Prefer composition over cross-module imports.

## Repository Layout

```text
apps/
  api/
  bot/
  web/
packages/
  shared/
docs/
data/
```

## Coding Standards

1. TypeScript strict mode is required.
2. Favor small, pure functions in domain and application layers.
3. Avoid hidden state and implicit mutations.
4. Keep React Context limited to shared UI state and actions.
5. Prefer explicit return types for exported functions.
6. Write tests next to the module or in the package test directory.

## Testing Strategy

1. `packages/shared`: unit tests for entities, value objects, use cases, and chart transformers.
2. `apps/api`: integration tests against a temporary SQLite database.
3. `apps/bot`: handler tests that verify mapping between Telegram updates and shared use cases.
4. `apps/web`: component and page tests for critical user flows.

## Delivery Sequence

1. Shared domain and use cases.
2. API repositories and routes.
3. Telegram bot adapter.
4. Web dashboard and visualizations.
5. Hardening, tests, and deployment docs.
