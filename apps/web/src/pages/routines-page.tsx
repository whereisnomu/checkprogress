import { RoutinePanel } from '../features/routines/routine-panel';

export const RoutinesPage = () => (
  <main className="page-shell">
    <section className="hero-card hero-card--compact">
      <p className="eyebrow">Routine Workspace</p>
      <h1>Manage daily routines and check-ins</h1>
      <p className="hero-copy">
        Create recurring routines, update cadence, and mark today's execution.
      </p>
    </section>

    <RoutinePanel variant="full" />
  </main>
);
