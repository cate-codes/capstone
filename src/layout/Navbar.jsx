import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { token, logout } = useAuth();
  const link = ({ isActive }) => "nav-link" + (isActive ? " active" : "");

  return (
    <header className="navbar scalloped">
      <div className="container nav-inner">
        <NavLink to="/" className="brand">
          MoodTune
        </NavLink>

        <nav className="nav">
          {token ? (
            <>
              <NavLink to="/dashboard" className={link}>
                Dashboard
              </NavLink>
              <NavLink to="/entries" className={link}>
                Entries
              </NavLink>
              <NavLink to="/entries/new" className={link}>
                New
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/" end className={link}>
                Home
              </NavLink>
              <NavLink to="/login" className={link}>
                Log in
              </NavLink>
              <NavLink to="/register" className={link}>
                Sign up
              </NavLink>
            </>
          )}
        </nav>

        <div className="nav-actions">
          {token && (
            <button className="btn btn-light" onClick={logout}>
              Log out
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
