import { DashboardProvider } from '../features/dashboard/dashboard-context';
import { RoutinesProvider } from '../features/routines/routines-context';
import { SkillsProvider } from '../features/skills/skills-context';
import { TasksProvider } from '../features/tasks/tasks-context';
import { AppRouter } from '../app/router';

export const App = () => (
  <DashboardProvider>
    <SkillsProvider>
      <RoutinesProvider>
        <TasksProvider>
          <AppRouter />
        </TasksProvider>
      </RoutinesProvider>
    </SkillsProvider>
  </DashboardProvider>
);
