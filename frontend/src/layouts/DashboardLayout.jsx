import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const titles = {
  "/audit/new": "New Audit",
  "/audit/past": "Past Audits",
  "/benchmarks": "Benchmarks",
  "/issues": "Issues",
  "/datasets": "Datasets",
  "/reports": "Reports",
  "/rules": "Rules",
  "/preferences": "Preferences",
};

export default function DashboardLayout() {
  const { pathname } = useLocation();
  const title = titles[pathname] || "GeoAudit";

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <div className="lg:pl-64">
        <Navbar title={pathname === "/audit/new" ? "" : title} />
        <main
          className={`p-6 lg:p-8 ${pathname === "/audit/new" ? "bg-page-glow" : ""}`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
