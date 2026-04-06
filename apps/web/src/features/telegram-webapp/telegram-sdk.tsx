import { useEffect } from 'react';

export const useTelegramBackButton = (
  enabled: boolean,
  onClick: () => void,
) => {
  useEffect(() => {
    const backButton = window.Telegram?.WebApp?.BackButton as
      | {
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
          offClick?: (callback: () => void) => void;
        }
      | undefined;

    if (!backButton) {
      return;
    }

    if (enabled) {
      backButton.show();
      backButton.onClick(onClick);
    } else {
      backButton.hide();
    }

    return () => {
      backButton.offClick?.(onClick);
    };
  }, [enabled, onClick]);
};

export const useTelegramMainButton = (params: {
  enabled: boolean;
  text: string;
  onClick?: () => void;
}) => {
  useEffect(() => {
    const mainButton = window.Telegram?.WebApp?.MainButton;

    if (!mainButton) {
      return;
    }

    mainButton.setText(params.text);

    if (params.enabled) {
      mainButton.enable();
      mainButton.show();
    } else {
      mainButton.hide();
    }
  }, [params.enabled, params.text]);

  useEffect(() => {
    const webApp = window.Telegram?.WebApp as
      | {
          MainButton?: {
            onClick?: (callback: () => void) => void;
            offClick?: (callback: () => void) => void;
          };
        }
      | undefined;

    if (!webApp?.MainButton?.onClick || !params.onClick) {
      return;
    }

    webApp.MainButton.onClick(params.onClick);

    return () => {
      webApp.MainButton?.offClick?.(params.onClick!);
    };
  }, [params.onClick]);
};

export const useTelegramThemeClass = () => {
  useEffect(() => {
    const colorScheme = window.Telegram?.WebApp?.colorScheme;

    if (colorScheme === 'dark') {
      document.documentElement.classList.add('tg-dark');
    }
  }, []);
};
