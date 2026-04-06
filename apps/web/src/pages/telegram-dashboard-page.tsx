import { useDashboard } from '../features/dashboard/dashboard-context';
import { Card, CardContent } from '@/components/ui/card';

export const TelegramDashboardPage = () => {
  const { summary, charts } = useDashboard();

  return (
    <main className="tg-page">
      <section className="hero-card hero-card--compact">
        <p className="eyebrow">Telegram App</p>
        <h1>Daily control surface</h1>
        <p className="hero-copy">
          Tasks: {summary?.tasks.totalTasks ?? 0} | Routines:{' '}
          {summary?.routines.totalRoutines ?? 0} | Skills:{' '}
          {summary?.skills.totalSkills ?? 0}
        </p>
      </section>

      <div className="grid gap-3">
        <Card className="bg-card/80 backdrop-blur">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Open tasks</p>
            <p className="text-2xl font-semibold">
              {summary?.tasks.activeTasks ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/80 backdrop-blur">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Routines done today</p>
            <p className="text-2xl font-semibold">
              {summary?.routines.completedRoutines ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/80 backdrop-blur">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Completed stages</p>
            <p className="text-2xl font-semibold">
              {summary?.skills.completedStages ?? 0}
            </p>
          </CardContent>
        </Card>
        {charts ? (
          <Card className="bg-card/80 backdrop-blur">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                Task completion trend
              </p>
              <div className="mt-3 grid grid-cols-7 gap-1">
                {charts.taskCompletionSeries.map((item) => (
                  <div key={item.label} className="tg-mini-bar">
                    <span
                      style={{ height: `${Math.max(item.value, 1) * 10}px` }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </main>
  );
};
