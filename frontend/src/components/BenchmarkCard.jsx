import { motion } from "framer-motion";
import {
  BarChart3,
  ChevronRight,
  LineChart,
  Lock,
  MoreVertical,
  Shield,
} from "lucide-react";
import DonutChart from "./DonutChart";
import Sparkline from "./Sparkline";
import { scoreRating, sparklinePoints } from "../lib/benchmarkUtils";

const METRICS = [
  {
    key: "performance",
    label: "Performance",
    color: "#3b82f6",
    badgeClass: "bg-blue-100 text-blue-700",
    sparkSeed: 1,
  },
  {
    key: "codeQuality",
    label: "Code Quality",
    color: "#06b6d4",
    badgeClass: "bg-cyan-100 text-cyan-700",
    sparkSeed: 2,
  },
  {
    key: "security",
    label: "Security",
    color: "#10b981",
    badgeClass: "bg-emerald-100 text-emerald-700",
    sparkSeed: 3,
  },
  {
    key: "dataset",
    label: "Dataset",
    color: "#8b5cf6",
    badgeClass: "bg-violet-100 text-violet-700",
    sparkSeed: 4,
  },
];

export default function BenchmarkCard({ scores, visible }) {
  if (!visible || !scores) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.16 }}
      className="min-w-0 overflow-hidden rounded-2xl border border-slate-100/80 bg-white p-4 shadow-xl shadow-slate-200/40 sm:p-5 lg:p-6"
    >
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <BarChart3 size={22} strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Benchmarks</h3>
            <p className="text-sm text-slate-500">Performance overview across key metrics</p>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
        >
          <LineChart size={16} className="text-slate-400" />
          View detailed report
          <ChevronRight size={16} className="text-slate-400" />
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-4">
        {METRICS.map((m, i) => {
          const value = scores[m.key] ?? 0;
          const rating = scoreRating(value);
          const segments = [{ label: m.label, value, color: m.color }];

          return (
            <motion.div
              key={m.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.06 }}
              className="relative rounded-2xl border border-slate-100 bg-gradient-to-b from-white to-slate-50/50 p-4 shadow-sm"
            >
              <button
                type="button"
                className="absolute right-3 top-3 rounded p-1 text-slate-300 hover:bg-slate-100 hover:text-slate-500"
                aria-label="Options"
              >
                <MoreVertical size={14} />
              </button>

              <div className="flex items-center gap-3">
                <div className="relative h-[72px] w-[72px] shrink-0">
                  <DonutChart segments={segments} size={72} stroke={10} />
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-800">
                    {value}%
                  </span>
                </div>
                <div className="min-w-0 pt-1">
                  <p className="font-semibold text-slate-800">{m.label}</p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${rating.className}`}
                  >
                    {rating.label}
                  </span>
                </div>
              </div>

              <div className="mt-3 border-t border-slate-100 pt-3">
                <Sparkline
                  points={sparklinePoints(value, m.sparkSeed)}
                  color={m.color}
                  width={140}
                  height={28}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export function AuditFooter() {
  return (
    <footer className="mx-auto flex w-full min-w-0 max-w-full flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-slate-100 pt-8 text-xs text-slate-400">
      <span className="inline-flex items-center gap-1.5">
        <Shield size={14} className="text-slate-300" />
        Enterprise-grade security
      </span>
      <span className="hidden h-3 w-px bg-slate-200 sm:inline" />
      <span className="inline-flex items-center gap-1.5">
        <BarChart3 size={14} className="text-slate-300" />
        SOC 2 Compliant
      </span>
      <span className="hidden h-3 w-px bg-slate-200 sm:inline" />
      <span className="inline-flex items-center gap-1.5">
        <Lock size={14} className="text-slate-300" />
        GDPR Ready
      </span>
    </footer>
  );
}
