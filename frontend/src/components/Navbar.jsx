import { Menu } from "lucide-react";
import { getUserEmail } from "../lib/auth";
import { useNewAudit } from "../context/NewAuditContext";

export default function Navbar({ title, isNewAudit = false }) {
  const auditCtx = useNewAudit();
  const sidebarOpen = auditCtx?.sidebarOpen ?? true;

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/70 px-6 py-4 backdrop-blur-md lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {isNewAudit && !sidebarOpen && (
            <button
              type="button"
              onClick={() => auditCtx?.setSidebarOpen(true)}
              aria-label="Open sidebar"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100"
            >
              <Menu size={20} />
            </button>
          )}
          {title ? (
            <h1 className="truncate text-xl font-semibold text-slate-800">{title}</h1>
          ) : isNewAudit ? (
            <h1 className="text-xl font-bold text-slate-900">Geo Test Hub</h1>
          ) : null}
        </div>

        {!isNewAudit && (
          <div className="flex min-w-0 items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:inline">{getUserEmail()}</span>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white">
              GA
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
