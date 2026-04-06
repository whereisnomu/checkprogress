import { describe, expect, it } from 'vitest';

import { getZonedDateParts, isReminderDue } from './time';

describe('time helpers', () => {
  it('formats zoned date parts', () => {
    const parts = getZonedDateParts(
      new Date('2026-04-06T10:15:00.000Z'),
      'UTC',
    );

    expect(parts.date).toBe('2026-04-06');
    expect(parts.time).toBe('10:15');
  });

  it('checks reminder due time', () => {
    expect(
      isReminderDue(new Date('2026-04-06T10:15:00.000Z'), 'UTC', '10:15'),
    ).toBe(true);
    expect(
      isReminderDue(new Date('2026-04-06T10:15:00.000Z'), 'UTC', '10:16'),
    ).toBe(false);
  });
});
