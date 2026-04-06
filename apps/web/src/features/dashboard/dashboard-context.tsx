import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import type { DashboardCharts, DashboardSummary } from '../../app/types';
import { apiClient } from '../../shared/api/client';

type DashboardContextValue = {
  summary: DashboardSummary | null;
  charts: DashboardCharts | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export const DashboardProvider = ({ children }: PropsWithChildren) => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [charts, setCharts] = useState<DashboardCharts | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);

    try {
      const [nextSummary, nextCharts] = await Promise.all([
        apiClient.getDashboardSummary(),
        apiClient.getDashboardCharts(),
      ]);

      setSummary(nextSummary);
      setCharts(nextCharts);
      setError(null);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unknown dashboard error',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      summary,
      charts,
      isLoading,
      error,
      refresh,
    }),
    [charts, error, isLoading, refresh, summary],
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }

  return context;
};
