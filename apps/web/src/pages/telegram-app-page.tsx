import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Outlet } from 'react-router-dom';

import { useTelegramWebApp } from '../features/telegram-webapp/telegram-webapp-context';

export const TelegramAppPage = () => {
  const { isTelegramWebApp, isVerified, error } = useTelegramWebApp();

  if (!isTelegramWebApp) {
    return (
      <main className="page-shell">
        <Card className="bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Telegram App</CardTitle>
            <CardDescription>
              This route is intended to be opened from Telegram Web Apps.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  if (!isVerified) {
    return (
      <main className="page-shell">
        <Card className="bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Telegram verification</CardTitle>
            <CardDescription>
              {error ?? 'Telegram Web App verification is pending.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            The app must verify Telegram initData before showing the dashboard.
          </CardContent>
        </Card>
      </main>
    );
  }

  return <Outlet />;
};
