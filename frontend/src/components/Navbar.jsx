import { getUserEmail } from "../lib/auth";

export default function Navbar({ title }) {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/70 px-6 py-4 backdrop-blur-md lg:px-8">
      <div className="flex items-center justify-between">
        {title ? (
          <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
        ) : (
          <span className="text-sm font-medium text-slate-400">GeoAudit</span>
        )}
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-500 sm:inline">{getUserEmail()}</span>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white">
            GA
          </div>
        </div>
      </div>
    </header>
  );
}
