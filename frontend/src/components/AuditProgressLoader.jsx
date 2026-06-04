import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function AuditProgressLoader({ progress = 0 }) {
  const pct = Math.min(100, Math.max(0, Math.floor(progress)));
  const circumference = 2 * Math.PI * 56;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full min-w-0 max-w-full"
      role="status"
      aria-live="polite"
      aria-label={`Audit in progress, ${pct} percent`}
    >
      <div className="flex flex-col items-center rounded-2xl border border-slate-100/80 bg-white/95 px-8 py-8 shadow-card backdrop-blur-sm sm:flex-row sm:gap-10 sm:px-10">
        <div className="relative h-32 w-32 shrink-0 sm:h-36 sm:w-36">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 200 200" aria-hidden>
            <circle
              cx="100"
              cy="100"
              r="56"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="10"
            />
            <circle
              cx="100"
              cy="100"
              r="56"
              fill="none"
              stroke="url(#progressGrad)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-[stroke-dashoffset] duration-300 ease-out"
            />
            <defs>
              <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#0ea5e9" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Loader2 className="mb-0.5 h-6 w-6 animate-spin text-indigo-500" />
            <span className="text-3xl font-bold tabular-nums text-slate-800">
              {pct}
              <span className="text-xl">%</span>
            </span>
          </div>
        </div>
        <div className="mt-5 text-center sm:mt-0 sm:text-left">
          <p className="text-lg font-semibold text-slate-800">Running smart audit</p>
          <p className="mt-1 text-sm text-slate-500">Analyzing your project…</p>
          <div className="mt-4 h-2 w-full max-w-xs overflow-hidden rounded-full bg-slate-100 sm:max-w-sm">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 transition-all duration-300 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
