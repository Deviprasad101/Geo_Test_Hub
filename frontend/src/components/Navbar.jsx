import { Menu } from "lucide-react";
import { getUserEmail } from "../lib/auth";
import { useNewAudit } from "../context/NewAuditContext";
import HeaderLogos from "./HeaderLogos";
import GeoTestHubBrand from "./GeoTestHubBrand";

export default function Navbar({ title, isNewAudit = false }) {
  const auditCtx = useNewAudit();
  const sidebarOpen = auditCtx?.sidebarOpen ?? true;

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/70 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
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
          <HeaderLogos />
          {!isNewAudit && title ? (
            <h1 className="hidden truncate text-lg font-semibold text-slate-800 lg:block xl:text-xl">
              {title}
            </h1>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {isNewAudit ? (
            <GeoTestHubBrand size="sm" />
          ) : (
            <>
              <span className="hidden text-sm text-slate-500 sm:inline">{getUserEmail()}</span>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white">
                GA
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
