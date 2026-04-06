export const ROUTINE_FREQUENCIES = ['daily'] as const;
export const ROUTINE_ENTRY_STATUSES = ['done', 'skipped'] as const;

export type RoutineFrequency = (typeof ROUTINE_FREQUENCIES)[number];
export type RoutineEntryStatus = (typeof ROUTINE_ENTRY_STATUSES)[number];

export type Routine = {
  id: string;
  title: string;
  description: string | null;
  frequency: RoutineFrequency;
  targetPerPeriod: number;
  createdAt: string;
  updatedAt: string;
};

export type RoutineEntry = {
  id: string;
  routineId: string;
  date: string;
  status: RoutineEntryStatus;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export const createRoutine = (params: {
  id: string;
  title: string;
  description?: string | null;
  frequency: RoutineFrequency;
  targetPerPeriod: number;
  now: string;
}): Routine => ({
  id: params.id,
  title: params.title.trim(),
  description: params.description?.trim() || null,
  frequency: params.frequency,
  targetPerPeriod: params.targetPerPeriod,
  createdAt: params.now,
  updatedAt: params.now,
});

export const createRoutineEntry = (params: {
  id: string;
  routineId: string;
  date: string;
  status: RoutineEntryStatus;
  note?: string | null;
  now: string;
}): RoutineEntry => ({
  id: params.id,
  routineId: params.routineId,
  date: params.date,
  status: params.status,
  note: params.note?.trim() || null,
  createdAt: params.now,
  updatedAt: params.now,
});

export const updateRoutineEntry = (
  entry: RoutineEntry,
  params: {
    status: RoutineEntryStatus;
    note?: string | null;
    now: string;
  },
): RoutineEntry => ({
  ...entry,
  status: params.status,
  note: params.note?.trim() || null,
  updatedAt: params.now,
});

export const updateRoutine = (
  routine: Routine,
  params: {
    title: string;
    description?: string | null;
    frequency: RoutineFrequency;
    targetPerPeriod: number;
    now: string;
  },
): Routine => ({
  ...routine,
  title: params.title.trim(),
  description: params.description?.trim() || null,
  frequency: params.frequency,
  targetPerPeriod: params.targetPerPeriod,
  updatedAt: params.now,
});
