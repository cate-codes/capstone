import React from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import Layout from "./layout/Layout";
import Login from "./auth/Login";
import Register from "./auth/Register";
import Dashboard from "./dashboard/Dashboard";
import EntriesList from "./entries/EntriesList";
import NewEntry from "./entries/NewEntry";
import EntryDetail from "./entries/EntryDetail";
import { useAuth } from "./auth/AuthContext";
// import "./styles.css";

function PrivateGroup() {
  const { token } = useAuth();
  const location = useLocation();
  return token ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
}
function PublicOnly({ children }) {
  const { token } = useAuth();
  return token ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route
          path="/login"
          element={
            <PublicOnly>
              <Login />
            </PublicOnly>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnly>
              <Register />
            </PublicOnly>
          }
        />

        <Route element={<PrivateGroup />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="entries" element={<EntriesList />} />
          <Route path="entries/new" element={<NewEntry />} />
          <Route path="entries/:id" element={<EntryDetail />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
