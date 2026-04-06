import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        ready: () => void;
        expand: () => void;
        close?: () => void;
        colorScheme?: 'light' | 'dark';
        BackButton?: {
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
        };
        MainButton?: {
          setText: (text: string) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
        };
      };
    };
  }
}

type TelegramWebAppState = {
  isTelegramWebApp: boolean;
  isVerified: boolean;
  error: string | null;
  user: unknown;
};

const TelegramWebAppContext = createContext<TelegramWebAppState | null>(null);

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

export const TelegramWebAppProvider = ({ children }: PropsWithChildren) => {
  const [state, setState] = useState<TelegramWebAppState>({
    isTelegramWebApp: false,
    isVerified: false,
    error: null,
    user: null,
  });

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;

    if (!webApp) {
      return;
    }

    webApp.ready();
    webApp.expand();

    const verify = async () => {
      try {
        const response = await fetch(
          `${apiBaseUrl}/api/telegram-webapp/verify`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ initData: webApp.initData }),
          },
        );

        if (!response.ok) {
          throw new Error('Telegram Web App verification failed');
        }

        const payload = (await response.json()) as { data: { user: unknown } };

        setState({
          isTelegramWebApp: true,
          isVerified: true,
          error: null,
          user: payload.data.user,
        });
      } catch (error) {
        setState({
          isTelegramWebApp: true,
          isVerified: false,
          error:
            error instanceof Error
              ? error.message
              : 'Telegram Web App verification failed',
          user: null,
        });
      }
    };

    void verify();
  }, []);

  const value = useMemo(() => state, [state]);

  return (
    <TelegramWebAppContext.Provider value={value}>
      {children}
    </TelegramWebAppContext.Provider>
  );
};

export const useTelegramWebApp = () => {
  const context = useContext(TelegramWebAppContext);

  if (!context) {
    throw new Error(
      'useTelegramWebApp must be used within TelegramWebAppProvider',
    );
  }

  return context;
};
