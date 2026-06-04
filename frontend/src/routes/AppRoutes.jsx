import { Navigate, Route, Routes } from "react-router-dom";
import { isAuthenticated } from "../lib/auth";
import DashboardLayout from "../layouts/DashboardLayout";
import Login from "../pages/Login";
import NewAudit from "../pages/NewAudit";
import PastAudits from "../pages/PastAudits";
import Benchmarks from "../pages/Benchmarks";
import Issues from "../pages/Issues";
import Datasets from "../pages/Datasets";
import Reports from "../pages/Reports";
import Rules from "../pages/Rules";
import Preferences from "../pages/Preferences";

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/audit/new" replace />} />
        <Route path="audit/new" element={<NewAudit />} />
        <Route path="audit/past" element={<PastAudits />} />
        <Route path="benchmarks" element={<Benchmarks />} />
        <Route path="issues" element={<Issues />} />
        <Route path="datasets" element={<Datasets />} />
        <Route path="reports" element={<Reports />} />
        <Route path="rules" element={<Rules />} />
        <Route path="preferences" element={<Preferences />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
