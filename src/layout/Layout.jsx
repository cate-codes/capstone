// src/layout/Layout.jsx
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { useAuth } from "../auth/AuthContext";

export default function Layout({ children }) {
  const nav = useNavigate();
  const { token } = useAuth();

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
    <div>
      <Navbar />
      <main className="p-4">{children ?? <Outlet />}</main>
    </div>
  );
}
