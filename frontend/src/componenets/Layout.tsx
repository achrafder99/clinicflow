import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  return (
    <>
      <header className="nav">
        <strong>ClinicFlow</strong>
        <nav>
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/patients">Patients</NavLink>
          <NavLink to="/appointments">Appointments</NavLink>
        </nav>
        <span className="spacer" />
        <small>{user?.fullName} ({user?.role})</small>
        <button className="btn secondary" onClick={logout}>Logout</button>
      </header>
      <main className="container"><Outlet /></main>
    </>
  );
}