import { DashboardProvider } from '../features/dashboard/dashboard-context';
import { RoutinesProvider } from '../features/routines/routines-context';
import { SettingsProvider } from '../features/settings/settings-context';
import { SkillsProvider } from '../features/skills/skills-context';
import { TasksProvider } from '../features/tasks/tasks-context';
import { TelegramWebAppProvider } from '../features/telegram-webapp/telegram-webapp-context';
import { AppRouter } from '../app/router';

export const App = () => (
  <TelegramWebAppProvider>
    <DashboardProvider>
      <SettingsProvider>
        <SkillsProvider>
          <RoutinesProvider>
            <TasksProvider>
              <AppRouter />
            </TasksProvider>
          </RoutinesProvider>
        </SkillsProvider>
      </SettingsProvider>
    </DashboardProvider>
  </TelegramWebAppProvider>
);
