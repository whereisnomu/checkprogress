import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { useSettings } from '../features/settings/settings-context';

export const SettingsPage = () => {
  const { settings, linkStatus, isLoading, error, createLinkCode } =
    useSettings();

  return (
    <main className="page-shell">
      <section className="hero-card hero-card--compact">
        <p className="eyebrow">Settings</p>
        <h1>System and integration status</h1>
        <p className="hero-copy">
          Review current runtime values and integration availability for the
          panel and bot.
        </p>
      </section>

      {error ? <p className="error-banner">{error}</p> : null}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading settings...</p>
      ) : null}

      {settings ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle>Web</CardTitle>
              <CardDescription>Current dashboard surface</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <p>
                <span className="font-medium">Dashboard URL:</span>{' '}
                {settings.webDashboardUrl}
              </p>
              <p>
                <span className="font-medium">Timezone:</span>{' '}
                {settings.timezone}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle>Telegram</CardTitle>
              <CardDescription>Bot integration readiness</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <p>
                <span className="font-medium">Bot enabled:</span>{' '}
                {settings.telegramEnabled ? 'Yes' : 'No'}
              </p>
              <p>
                <span className="font-medium">Owner chat configured:</span>{' '}
                {settings.ownerChatConfigured ? 'Yes' : 'No'}
              </p>
              <p>
                <span className="font-medium">Daily reminders:</span>{' '}
                {settings.remindersEnabled ? 'Yes' : 'No'}
              </p>
              <p>
                <span className="font-medium">Reminder time:</span>{' '}
                {settings.dailyReminderTime}
              </p>
              <div className="grid gap-2 pt-2">
                <p>
                  <span className="font-medium">Linked chat:</span>{' '}
                  {linkStatus?.linkedChat?.chatId ?? 'Not linked'}
                </p>
                <p>
                  <span className="font-medium">Active link code:</span>{' '}
                  {linkStatus?.latestLinkToken?.code ?? 'No active code'}
                </p>
                <Button type="button" onClick={() => void createLinkCode()}>
                  Generate link code
                </Button>
                <p className="text-sm text-muted-foreground">
                  After generating a code, send `/link CODE` to the bot from
                  your Telegram chat. If the bot is not linked yet, `/link` is
                  always allowed.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </main>
  );
};
