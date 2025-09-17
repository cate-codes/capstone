import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const linkClass = ({ isActive }) => `navlink${isActive ? " active" : ""}`;

export default function Navbar() {
  const { token, logout } = useAuth();

  return (
    // make navbar itself sticky top
    <header className="appbar mt-topbar">
      <div className="appbar-inner mt-topbar-inner">
        <NavLink to="/" className="brand">
          MoodTune
        </NavLink>

        <nav className="nav">
          {token ? (
            <>
              <NavLink to="/dashboard" className={linkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/entries" className={linkClass}>
                Entries
              </NavLink>
              <NavLink to="/entries/new" className={linkClass}>
                New
              </NavLink>
              <button className="btn ghost" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Log in
              </NavLink>
              <NavLink to="/register" className={linkClass}>
                Sign up
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
