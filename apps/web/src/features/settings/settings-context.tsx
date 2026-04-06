import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { apiClient } from '../../shared/api/client';

type SystemSettings = {
  webDashboardUrl: string;
  timezone: string;
  telegramEnabled: boolean;
  ownerChatConfigured: boolean;
  remindersEnabled: boolean;
  dailyReminderTime: string;
};

type SettingsContextValue = {
  settings: SystemSettings | null;
  isLoading: boolean;
  error: string | null;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export const SettingsProvider = ({ children }: PropsWithChildren) => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);

      try {
        const nextSettings = await apiClient.getSystemSettings();
        setSettings(nextSettings);
        setError(null);
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Unknown settings error',
        );
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  const value = useMemo(
    () => ({ settings, isLoading, error }),
    [error, isLoading, settings],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }

  return context;
};
