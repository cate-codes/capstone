import React from "react";
import { useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { useAuth } from "../auth/AuthContext";

export default function Layout({ children }) {
  const nav = useNavigate();
  const { token } = useAuth();

  // ⌨️ Keep your keyboard shortcuts
  useEffect(() => {
    const isFormEl = (el) => {
      const t = el?.tagName?.toLowerCase();
      return (
        t === "input" ||
        t === "textarea" ||
        t === "select" ||
        el?.isContentEditable
      );
    };
    const onKey = (e) => {
      if (!token) return; // only when logged in
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isFormEl(document.activeElement)) return;
      const k = e.key.toLowerCase();
      if (k === "n") {
        e.preventDefault();
        nav("/entries/new");
      }
      if (k === "e") {
        e.preventDefault();
        nav("/entries");
      }
      if (k === "d") {
        e.preventDefault();
        nav("/dashboard");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nav, token]);

  return (
    <div className="mt-shell">
      {/* 🔝 Sticky top banner: your existing Navbar wrapped in a sticky container */}
      <header className="mt-topbar">
        <div className="mt-topbar-inner">
          <Navbar />
        </div>
      </header>

      {/* 🧩 Main app frame: sidebar appears only when logged in */}
      <main className="mt-main">
        {token ? (
          <aside className="mt-sidebar">
            <h3 className="mt-section-title">Navigate</h3>
            <div style={{ display: "grid", gap: 8 }}>
              <NavLink className="mt-btn" to="/dashboard">
                Dashboard
              </NavLink>
              <NavLink className="mt-btn" to="/entries">
                Entries
              </NavLink>
              <NavLink className="mt-btn" to="/entries/new">
                New Entry
              </NavLink>
            </div>
          </aside>
        ) : (
          <div /> /* keeps grid alignment on auth pages */
        )}

        <section className="mt-content">
          {/* Your routed pages */}
          {children ?? <Outlet />}
        </section>
      </main>
    </div>
  );
}
