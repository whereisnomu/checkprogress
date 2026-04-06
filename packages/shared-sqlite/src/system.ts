import { randomUUID } from 'node:crypto';

import type { Clock, IdGenerator } from '@progress-state/shared';

export class SystemClock implements Clock {
  public now() {
    return new Date().toISOString();
  }
}

export class UuidGenerator implements IdGenerator {
  public next() {
    return randomUUID();
  }
}
