import { NavLink, Outlet } from 'react-router-dom';

const navClassName = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? 'app-shell__nav-link app-shell__nav-link--active'
    : 'app-shell__nav-link';

export const AppShell = () => (
  <div className="app-shell">
    <aside className="app-shell__sidebar">
      <div>
        <p className="eyebrow">Progress State</p>
        <h1 className="app-shell__title">Execution panel</h1>
      </div>

      <nav className="app-shell__nav">
        <NavLink to="/dashboard" className={navClassName}>
          Dashboard
        </NavLink>
        <NavLink to="/tasks" className={navClassName}>
          Tasks
        </NavLink>
        <NavLink to="/routines" className={navClassName}>
          Routines
        </NavLink>
        <NavLink to="/skills" className={navClassName}>
          Skills
        </NavLink>
      </nav>
    </aside>

    <div className="app-shell__content">
      <Outlet />
    </div>
  </div>
);
