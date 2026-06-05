import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { NewAuditProvider, useNewAudit } from "../context/NewAuditContext";

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

const AUDIT_STYLE_ROUTES = new Set(["/audit/new", "/audit/past", "/reports"]);

function DashboardShell({ isNewAudit }) {
  const { pathname } = useLocation();
  const auditCtx = useNewAudit();
  const sidebarOpen = auditCtx?.sidebarOpen ?? true;
  const useAuditStyle = AUDIT_STYLE_ROUTES.has(pathname);
  const title = titles[pathname] || "GeoAudit";

  const mainPad = sidebarOpen ? "lg:pl-64" : "lg:pl-0";

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar showUserProfile={useAuditStyle} />
      <div
        className={`relative z-0 min-w-0 w-full transition-[padding] duration-300 ${mainPad} ${
          isNewAudit && auditCtx?.allowScroll ? "overflow-x-hidden" : ""
        }`}
      >
        <Navbar title={useAuditStyle ? "" : title} isNewAudit={useAuditStyle} />
        <main
          className={`min-w-0 w-full p-6 lg:p-8 ${useAuditStyle ? "bg-page-glow" : ""} ${
            isNewAudit && !auditCtx?.allowScroll
              ? "overflow-hidden max-h-[calc(100dvh-4.25rem)]"
              : "overflow-x-hidden"
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  const { pathname } = useLocation();
  const isNewAudit = pathname === "/audit/new";

  return (
    <NewAuditProvider>
      <DashboardShell isNewAudit={isNewAudit} />
    </NewAuditProvider>
  );
}
