import {
  Navigate,
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';

import { DashboardPage } from '../pages/dashboard-page';
import { RoutinesPage } from '../pages/routines-page';
import { SettingsPage } from '../pages/settings-page';
import { SkillsPage } from '../pages/skills-page';
import { TasksPage } from '../pages/tasks-page';
import { TelegramAppPage } from '../pages/telegram-app-page';
import { TelegramRoutinesPage } from '../pages/telegram-routines-page';
import { TelegramSkillsPage } from '../pages/telegram-skills-page';
import { TelegramTasksPage } from '../pages/telegram-tasks-page';
import { AppShell } from './shell';
import { TelegramShell } from './telegram-shell';
import { TelegramDashboardPage } from '../pages/telegram-dashboard-page';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'tasks', element: <TasksPage /> },
      { path: 'routines', element: <RoutinesPage /> },
      { path: 'skills', element: <SkillsPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  {
    path: '/tg',
    element: <TelegramAppPage />,
    children: [
      {
        element: <TelegramShell />,
        children: [
          { index: true, element: <TelegramDashboardPage /> },
          { path: 'tasks', element: <TelegramTasksPage /> },
          { path: 'routines', element: <TelegramRoutinesPage /> },
          { path: 'skills', element: <TelegramSkillsPage /> },
        ],
      },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
