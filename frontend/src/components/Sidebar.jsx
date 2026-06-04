import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Database,
  FileText,
  FolderOpen,
  LogOut,
  PlayCircle,
  Settings,
  Shield,
  Sliders,
  AlertTriangle,
} from "lucide-react";
import { logout } from "../lib/auth";
import { useNavigate } from "react-router-dom";

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

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-20 flex h-screen w-64 flex-col border-r border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="border-b border-slate-100 px-5 py-6">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white shadow-sm">
            ●
          </span>
          <div>
            <p className="font-bold text-slate-800">GeoAudit</p>
            <p className="text-xs text-slate-500">Code Intelligence</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <NavSection title="Workspace" items={workspace} />
        <NavSection title="Reports" items={reports} />
        <NavSection title="Settings" items={settings} />
      </div>

      <div className="border-t border-slate-100 p-4">
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
  );
}
