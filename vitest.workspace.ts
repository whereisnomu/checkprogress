import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'packages/shared/vitest.config.ts',
  'packages/shared-sqlite/vitest.config.ts',
  'apps/api/vitest.config.ts',
  'apps/bot/vitest.config.ts',
  'apps/web/vitest.config.ts',
]);
