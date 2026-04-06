import { useDashboard } from '../features/dashboard/dashboard-context';
import { TaskPanel } from '../features/tasks/task-panel';
import { ChartCard } from '../ui/chart-card';

const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

export const DashboardPage = () => {
  const { summary, charts, error: loadError } = useDashboard();
  const taskSummary = summary?.tasks;
  const routineSummary = summary?.routines;
  const skillSummary = summary?.skills;

  return (
    <main className="page-shell">
      <section className="hero-card">
        <p className="eyebrow">Progress State</p>
        <h1>Daily execution with a shared web and Telegram workflow</h1>
        <p className="hero-copy">
          The first slice focuses on dashboard visibility so tasks, routines,
          and skill progression can converge into a single execution view.
        </p>
      </section>

      {loadError ? <p className="error-banner">{loadError}</p> : null}

      <section className="summary-grid">
        <article className="metric-card">
          <span>Total tasks</span>
          <strong>{taskSummary?.totalTasks ?? 0}</strong>
        </article>
        <article className="metric-card">
          <span>Completed</span>
          <strong>{taskSummary?.completedTasks ?? 0}</strong>
        </article>
        <article className="metric-card">
          <span>Active</span>
          <strong>{taskSummary?.activeTasks ?? 0}</strong>
        </article>
        <article className="metric-card accent-card">
          <span>Completion rate</span>
          <strong>
            {taskSummary ? formatPercent(taskSummary.completionRate) : '0%'}
          </strong>
        </article>
        <article className="metric-card">
          <span>Routines today</span>
          <strong>{routineSummary?.totalRoutines ?? 0}</strong>
        </article>
        <article className="metric-card">
          <span>Routines done</span>
          <strong>{routineSummary?.completedRoutines ?? 0}</strong>
        </article>
        <article className="metric-card">
          <span>Routines pending</span>
          <strong>{routineSummary?.pendingRoutines ?? 0}</strong>
        </article>
        <article className="metric-card">
          <span>Skills tracked</span>
          <strong>{skillSummary?.totalSkills ?? 0}</strong>
        </article>
        <article className="metric-card accent-card">
          <span>Skill completion</span>
          <strong>
            {skillSummary ? formatPercent(skillSummary.completionRate) : '0%'}
          </strong>
        </article>
      </section>

      {charts ? (
        <section className="chart-grid">
          <ChartCard
            title="Task Distribution"
            subtitle="Open versus completed task load"
            data={charts.taskDistribution}
          />
          <ChartCard
            title="Routine Status"
            subtitle="Today's routine execution breakdown"
            data={charts.routineDistribution}
          />
          <ChartCard
            title="Skill Stage Progress"
            subtitle="Completed versus open skill stages"
            data={charts.skillDistribution}
          />
        </section>
      ) : null}

      <TaskPanel />
    </main>
  );
};
