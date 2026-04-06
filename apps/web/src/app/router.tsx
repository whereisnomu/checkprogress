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
import { AppShell } from './shell';

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
]);

export const AppRouter = () => <RouterProvider router={router} />;
