import { describe, expect, it } from 'vitest';

import type { Clock, IdGenerator, RoutineRepository } from './ports';
import { RoutineService } from './routine-service';

class InMemoryRoutineRepository implements RoutineRepository {
  public readonly routines = new Map<string, unknown>();
  public readonly entries = new Map<string, unknown>();

  public async create(routine: unknown) {
    this.routines.set((routine as { id: string }).id, routine);
  }

  public async list() {
    return [...this.routines.values()] as Awaited<
      ReturnType<RoutineRepository['list']>
    >;
  }

  public async findById(id: string) {
    return (
      (this.routines.get(id) as Awaited<
        ReturnType<RoutineRepository['findById']>
      >) ?? null
    );
  }

  public async update(routine: unknown) {
    this.routines.set((routine as { id: string }).id, routine);
  }

  public async delete(id: string) {
    this.routines.delete(id);
  }

  public async upsertEntry(entry: unknown) {
    const typedEntry = entry as { routineId: string; date: string };
    this.entries.set(`${typedEntry.routineId}:${typedEntry.date}`, entry);
  }

  public async findEntryByRoutineAndDate(routineId: string, date: string) {
    return (
      (this.entries.get(`${routineId}:${date}`) as Awaited<
        ReturnType<RoutineRepository['findEntryByRoutineAndDate']>
      >) ?? null
    );
  }

  public async listEntriesByDate(date: string) {
    return ([...this.entries.values()] as Array<{ date: string }>).filter(
      (entry) => entry.date === date,
    ) as Awaited<ReturnType<RoutineRepository['listEntriesByDate']>>;
  }
}

class SequenceIdGenerator implements IdGenerator {
  private index = 0;

  public next() {
    this.index += 1;

    return `id-${this.index}`;
  }
}

class FixedClock implements Clock {
  public now() {
    return '2026-04-06T10:00:00.000Z';
  }
}

describe('RoutineService', () => {
  it('creates a daily routine', async () => {
    const repository = new InMemoryRoutineRepository();
    const service = new RoutineService(
      repository,
      new SequenceIdGenerator(),
      new FixedClock(),
    );

    const routine = await service.createRoutine({
      title: ' Morning review ',
      targetPerPeriod: 1,
      frequency: 'daily',
    });

    expect(routine.title).toBe('Morning review');
    expect(routine.frequency).toBe('daily');
  });

  it('creates and updates a routine check-in for the same day', async () => {
    const repository = new InMemoryRoutineRepository();
    const service = new RoutineService(
      repository,
      new SequenceIdGenerator(),
      new FixedClock(),
    );
    const routine = await service.createRoutine({
      title: 'Workout',
      frequency: 'daily',
      targetPerPeriod: 1,
    });

    const firstEntry = await service.checkInRoutine({
      routineId: routine.id,
      date: '2026-04-06',
      status: 'done',
    });

    const updatedEntry = await service.checkInRoutine({
      routineId: routine.id,
      date: '2026-04-06',
      status: 'skipped',
      note: 'Rescheduled',
    });

    expect(firstEntry.id).toBe(updatedEntry.id);
    expect(updatedEntry.status).toBe('skipped');
    expect(updatedEntry.note).toBe('Rescheduled');
  });

  it('builds a daily routine summary', async () => {
    const repository = new InMemoryRoutineRepository();
    const service = new RoutineService(
      repository,
      new SequenceIdGenerator(),
      new FixedClock(),
    );
    const routineA = await service.createRoutine({
      title: 'Read',
      frequency: 'daily',
      targetPerPeriod: 1,
    });
    const routineB = await service.createRoutine({
      title: 'Stretch',
      frequency: 'daily',
      targetPerPeriod: 1,
    });

    await service.checkInRoutine({
      routineId: routineA.id,
      date: '2026-04-06',
      status: 'done',
    });
    await service.checkInRoutine({
      routineId: routineB.id,
      date: '2026-04-06',
      status: 'skipped',
    });

    const summary = await service.getDailySummary('2026-04-06');

    expect(summary.totalRoutines).toBe(2);
    expect(summary.completedRoutines).toBe(1);
    expect(summary.skippedRoutines).toBe(1);
    expect(summary.pendingRoutines).toBe(0);
  });

  it('updates a routine', async () => {
    const repository = new InMemoryRoutineRepository();
    const service = new RoutineService(
      repository,
      new SequenceIdGenerator(),
      new FixedClock(),
    );
    const routine = await service.createRoutine({
      title: 'Read',
      frequency: 'daily',
      targetPerPeriod: 1,
    });

    const updated = await service.updateRoutine({
      routineId: routine.id,
      title: 'Read deeply',
      frequency: 'daily',
      targetPerPeriod: 2,
    });

    expect(updated.title).toBe('Read deeply');
    expect(updated.targetPerPeriod).toBe(2);
  });

  it('deletes a routine', async () => {
    const repository = new InMemoryRoutineRepository();
    const service = new RoutineService(
      repository,
      new SequenceIdGenerator(),
      new FixedClock(),
    );
    const routine = await service.createRoutine({
      title: 'Stretch',
      frequency: 'daily',
      targetPerPeriod: 1,
    });

    await service.deleteRoutine({ routineId: routine.id });

    expect(await service.listRoutines()).toHaveLength(0);
  });
});
