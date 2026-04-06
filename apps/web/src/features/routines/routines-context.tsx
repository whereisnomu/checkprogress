import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import type { Routine } from '../../app/types';
import { apiClient } from '../../shared/api/client';

type RoutinesContextValue = {
  routines: Routine[];
  isLoading: boolean;
  error: string | null;
  createRoutine: (input: {
    title: string;
    description?: string;
    targetPerPeriod: number;
  }) => Promise<void>;
  updateRoutine: (input: {
    routineId: string;
    title: string;
    description?: string;
    targetPerPeriod: number;
  }) => Promise<void>;
  deleteRoutine: (routineId: string) => Promise<void>;
  checkInRoutine: (routineId: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const RoutinesContext = createContext<RoutinesContextValue | null>(null);

const todayDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const RoutinesProvider = ({ children }: PropsWithChildren) => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);

    try {
      const nextRoutines = await apiClient.listRoutines();
      setRoutines(Array.isArray(nextRoutines) ? nextRoutines : []);
      setError(null);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unknown routines error',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createRoutine = useCallback(
    async (input: {
      title: string;
      description?: string;
      targetPerPeriod: number;
    }) => {
      const payload = {
        title: input.title,
        frequency: 'daily' as const,
        targetPerPeriod: input.targetPerPeriod,
        ...(input.description !== undefined
          ? { description: input.description }
          : {}),
      };
      const created = await apiClient.createRoutine(payload);

      setRoutines((current) => [created, ...current]);
    },
    [],
  );

  const updateRoutine = useCallback(
    async (input: {
      routineId: string;
      title: string;
      description?: string;
      targetPerPeriod: number;
    }) => {
      const payload = {
        title: input.title,
        frequency: 'daily' as const,
        targetPerPeriod: input.targetPerPeriod,
        ...(input.description !== undefined
          ? { description: input.description }
          : {}),
      };
      const updated = await apiClient.updateRoutine(input.routineId, payload);
      setRoutines((current) =>
        current.map((routine) =>
          routine.id === input.routineId ? updated : routine,
        ),
      );
    },
    [],
  );

  const deleteRoutine = useCallback(async (routineId: string) => {
    await apiClient.deleteRoutine(routineId);
    setRoutines((current) =>
      current.filter((routine) => routine.id !== routineId),
    );
  }, []);

  const checkInRoutine = useCallback(async (routineId: string) => {
    await apiClient.checkInRoutine(routineId, {
      date: todayDate(),
      status: 'done',
    });
  }, []);

  const value = useMemo(
    () => ({
      routines,
      isLoading,
      error,
      createRoutine,
      updateRoutine,
      deleteRoutine,
      checkInRoutine,
      refresh,
    }),
    [
      checkInRoutine,
      createRoutine,
      deleteRoutine,
      error,
      isLoading,
      refresh,
      routines,
      updateRoutine,
    ],
  );

  return (
    <RoutinesContext.Provider value={value}>
      {children}
    </RoutinesContext.Provider>
  );
};

export const useRoutines = () => {
  const context = useContext(RoutinesContext);

  if (!context) {
    throw new Error('useRoutines must be used within RoutinesProvider');
  }

  return context;
};
