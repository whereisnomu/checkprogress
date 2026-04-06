import { TaskPanel } from '../features/tasks/task-panel';

export const TasksPage = () => (
  <main className="page-shell">
    <section className="hero-card hero-card--compact">
      <p className="eyebrow">Task Workspace</p>
      <h1>Manage the full task lifecycle</h1>
      <p className="hero-copy">
        Add, update, complete, and remove tasks from a dedicated workspace.
      </p>
    </section>

    <TaskPanel variant="full" />
  </main>
);
