import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Database,
  FileText,
  FolderOpen,
  LogOut,
  Menu,
  PlayCircle,
  Shield,
  Sliders,
  AlertTriangle,
} from "lucide-react";
import { getUserEmail, logout } from "../lib/auth";
import { useNavigate } from "react-router-dom";
import { useNewAudit } from "../context/NewAuditContext";

const workspace = [
  { to: "/audit/new", label: "New Audit", icon: PlayCircle },
  { to: "/audit/past", label: "Past Audits", icon: FolderOpen },
  { to: "/benchmarks", label: "Benchmarks", icon: BarChart3 },
];

const reports = [
  { to: "/issues", label: "Issues", icon: AlertTriangle },
  { to: "/datasets", label: "Datasets", icon: Database },
  { to: "/reports", label: "Reports", icon: FileText },
];

const settings = [
  { to: "/rules", label: "Rules", icon: Shield },
  { to: "/preferences", label: "Preferences", icon: Sliders },
];

function NavSection({ title, items }) {
  return (
    <div className="mb-6">
      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {title}
      </p>
      <nav className="space-y-1">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "sidebar-link-active" : "hover:bg-slate-50"}`
            }
          >
            <Icon size={18} className="shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default function Sidebar({ isNewAudit = false }) {
  const navigate = useNavigate();
  const auditCtx = useNewAudit();
  const sidebarOpen = auditCtx?.sidebarOpen ?? true;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleSidebar = () => {
    auditCtx?.setSidebarOpen((open) => !open);
  };

  const asideClass = sidebarOpen
    ? "w-64 translate-x-0"
    : "-translate-x-full lg:w-0 lg:translate-x-0 lg:overflow-hidden lg:border-r-0 lg:opacity-0";

  return (
    <>
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-10 bg-slate-900/20 lg:hidden"
          onClick={() => auditCtx?.setSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed left-0 top-0 z-20 flex h-screen flex-col border-r border-slate-200/80 bg-white/90 backdrop-blur-md transition-all duration-300 ${asideClass}`}
      >
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white shadow-sm">
                ●
              </span>
              <div className="min-w-0">
                <p className="truncate font-bold text-slate-800">GeoAudit</p>
                <p className="text-xs text-slate-500">Code Intelligence</p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <NavSection title="Workspace" items={workspace} />
          <NavSection title="Reports" items={reports} />
          <NavSection title="Settings" items={settings} />
        </div>

        <div className="border-t border-slate-100 p-4">
          {isNewAudit && (
            <div className="mb-3 flex min-w-0 items-center gap-3 px-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white"
                aria-hidden
              >
                GA
              </div>
              <p
                className="min-w-0 truncate text-sm text-slate-600"
                title={getUserEmail()}
              >
                {getUserEmail()}
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="sidebar-link w-full text-red-600 hover:bg-red-50"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
