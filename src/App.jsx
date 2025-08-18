import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import Layout from "./layout/Layout";
import Login from "./auth/Login";
import Register from "./auth/Register";
import EntriesList from "./entries/EntriesList";
import NewEntry from "./entries/NewEntry";
import EntryDetail from "./entries/EntryDetail";
import Dashboard from "./dashboard/Dashboard";
import Home from "./home/Home";
import { useAuth } from "./auth/AuthContext";

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
  return token ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public */}
        <Route index element={<Home />} />
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

        {/* Private */}
        <Route element={<PrivateGroup />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/entries" element={<EntriesList />} />
          <Route path="/entries/new" element={<NewEntry />} />
          <Route path="/entries/:id" element={<EntryDetail />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

// export default function App() {
//   return (
//     <div style={{ padding: 16 }}>
//       <h1>App alive ✅</h1>
//       <p>If you can see this, the crash is inside your routes/components.</p>
//     </div>
//   );
// }
