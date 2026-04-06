import { z } from 'zod';

import {
  createRoutine,
  createRoutineEntry,
  ROUTINE_ENTRY_STATUSES,
  ROUTINE_FREQUENCIES,
  updateRoutine,
  updateRoutineEntry,
} from '../domain/routine';
import type { Clock, IdGenerator, RoutineRepository } from './ports';

export class RoutineNotFoundError extends Error {
  public constructor(routineId: string) {
    super(`Routine ${routineId} was not found`);
    this.name = 'RoutineNotFoundError';
  }
}

export const createRoutineInputSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).optional(),
  frequency: z.enum(ROUTINE_FREQUENCIES).default('daily'),
  targetPerPeriod: z.number().int().positive().max(31).default(1),
});

export const checkInRoutineInputSchema = z.object({
  routineId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(ROUTINE_ENTRY_STATUSES),
  note: z.string().trim().max(500).optional(),
});

export const updateRoutineInputSchema = z.object({
  routineId: z.string().min(1),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).optional(),
  frequency: z.enum(ROUTINE_FREQUENCIES),
  targetPerPeriod: z.number().int().positive().max(31),
});

export const deleteRoutineInputSchema = z.object({
  routineId: z.string().min(1),
});

export type CreateRoutineInput = z.infer<typeof createRoutineInputSchema>;
export type CheckInRoutineInput = z.infer<typeof checkInRoutineInputSchema>;
export type UpdateRoutineInput = z.infer<typeof updateRoutineInputSchema>;
export type DeleteRoutineInput = z.infer<typeof deleteRoutineInputSchema>;

export type RoutineDailySummary = {
  totalRoutines: number;
  completedRoutines: number;
  skippedRoutines: number;
  pendingRoutines: number;
};

export class RoutineService {
  public constructor(
    private readonly repository: RoutineRepository,
    private readonly idGenerator: IdGenerator,
    private readonly clock: Clock,
  ) {}

  public async createRoutine(input: CreateRoutineInput) {
    const validated = createRoutineInputSchema.parse(input);
    const now = this.clock.now();
    const routine = createRoutine({
      id: this.idGenerator.next(),
      title: validated.title,
      description: validated.description ?? null,
      frequency: validated.frequency,
      targetPerPeriod: validated.targetPerPeriod,
      now,
    });

    await this.repository.create(routine);

    return routine;
  }

  public async listRoutines() {
    return this.repository.list();
  }

  public async checkInRoutine(input: CheckInRoutineInput) {
    const validated = checkInRoutineInputSchema.parse(input);
    const routine = await this.repository.findById(validated.routineId);

    if (!routine) {
      throw new RoutineNotFoundError(validated.routineId);
    }

    const now = this.clock.now();
    const existingEntry = await this.repository.findEntryByRoutineAndDate(
      validated.routineId,
      validated.date,
    );

    const entry = existingEntry
      ? updateRoutineEntry(existingEntry, {
          status: validated.status,
          note: validated.note ?? null,
          now,
        })
      : createRoutineEntry({
          id: this.idGenerator.next(),
          routineId: validated.routineId,
          date: validated.date,
          status: validated.status,
          note: validated.note ?? null,
          now,
        });

    await this.repository.upsertEntry(entry);

    return entry;
  }

  public async updateRoutine(input: UpdateRoutineInput) {
    const validated = updateRoutineInputSchema.parse(input);
    const routine = await this.repository.findById(validated.routineId);

    if (!routine) {
      throw new RoutineNotFoundError(validated.routineId);
    }

    const updated = updateRoutine(routine, {
      title: validated.title,
      description: validated.description ?? null,
      frequency: validated.frequency,
      targetPerPeriod: validated.targetPerPeriod,
      now: this.clock.now(),
    });

    await this.repository.update(updated);

    return updated;
  }

  public async deleteRoutine(input: DeleteRoutineInput) {
    const validated = deleteRoutineInputSchema.parse(input);
    const routine = await this.repository.findById(validated.routineId);

    if (!routine) {
      throw new RoutineNotFoundError(validated.routineId);
    }

    await this.repository.delete(validated.routineId);
  }

  public async getDailySummary(date: string): Promise<RoutineDailySummary> {
    const [routines, entries] = await Promise.all([
      this.repository.list(),
      this.repository.listEntriesByDate(date),
    ]);

    const completedRoutines = entries.filter(
      (entry) => entry.status === 'done',
    ).length;
    const skippedRoutines = entries.filter(
      (entry) => entry.status === 'skipped',
    ).length;
    const totalRoutines = routines.length;

    return {
      totalRoutines,
      completedRoutines,
      skippedRoutines,
      pendingRoutines: Math.max(
        totalRoutines - completedRoutines - skippedRoutines,
        0,
      ),
    };
  }

  public async listEntriesInRange(startDate: string, endDate: string) {
    return this.repository.listEntriesInRange(startDate, endDate);
  }
}
