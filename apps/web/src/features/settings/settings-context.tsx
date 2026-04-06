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

type TelegramLinkStatus = {
  linkedChat: {
    chatId: string;
    userId: string | null;
    linkedAt: string;
  } | null;
  latestLinkToken: {
    code: string;
    createdAt: string;
    expiresAt: string;
    consumedAt: string | null;
  } | null;
};

type SettingsContextValue = {
  settings: SystemSettings | null;
  linkStatus: TelegramLinkStatus | null;
  isLoading: boolean;
  error: string | null;
  createLinkCode: () => Promise<void>;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export const SettingsProvider = ({ children }: PropsWithChildren) => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [linkStatus, setLinkStatus] = useState<TelegramLinkStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);

    try {
      const [nextSettings, nextLinkStatus] = await Promise.all([
        apiClient.getSystemSettings(),
        apiClient.getTelegramLinkStatus(),
      ]);
      setSettings(nextSettings);
      setLinkStatus(nextLinkStatus);
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

  useEffect(() => {
    void load();
  }, []);

  const createLinkCode = async () => {
    await apiClient.createTelegramLinkCode();
    await load();
  };

  const value = useMemo(
    () => ({ settings, linkStatus, isLoading, error, createLinkCode }),
    [error, isLoading, linkStatus, settings],
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
