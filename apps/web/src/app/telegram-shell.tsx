import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import {
  useTelegramBackButton,
  useTelegramMainButton,
  useTelegramThemeClass,
} from '../features/telegram-webapp/telegram-sdk';

const navClassName = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? 'tg-shell__nav-link tg-shell__nav-link--active'
    : 'tg-shell__nav-link';

export const TelegramShell = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useTelegramThemeClass();
  useTelegramBackButton(location.pathname !== '/tg', () => navigate('/tg'));
  useTelegramMainButton({ enabled: false, text: 'Ready' });

  return (
    <div className="tg-shell">
      <main className="tg-shell__content">
        <Outlet />
      </main>

      <nav className="tg-shell__nav">
        <NavLink to="/tg" end className={navClassName}>
          Home
        </NavLink>
        <NavLink to="/tg/tasks" className={navClassName}>
          Tasks
        </NavLink>
        <NavLink to="/tg/routines" className={navClassName}>
          Routines
        </NavLink>
        <NavLink to="/tg/skills" className={navClassName}>
          Skills
        </NavLink>
      </nav>
    </div>
  );
};
