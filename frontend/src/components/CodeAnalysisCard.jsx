import { motion } from "framer-motion";
import {
  CheckCircle2,
  ClipboardList,
  Code2,
  Info,
  LineChart,
  Search,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";
import DonutChart from "./DonutChart";

export default function CodeAnalysisCard({ code, scanSummary, loading }) {
  if (loading) {
    return (
      <CardShell>
        <div className="animate-pulse space-y-4">
          <div className="h-14 rounded-xl bg-slate-100" />
          <div className="h-16 rounded-xl bg-slate-100" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-slate-100" />
            ))}
          </div>
          <div className="h-32 rounded-xl bg-slate-100" />
        </div>
      </CardShell>
    );
  }

  if (!code) return null;

  const errors = code.syntax_errors ?? scanSummary?.error_count ?? 0;
  const warnings = code.warnings ?? scanSummary?.warning_count ?? 0;
  const total = scanSummary?.total_count ?? errors + warnings;
  const infoOthers = Math.max(0, total - errors - warnings);
  const passed = errors === 0 && scanSummary?.passed !== false;

  const segments = [
    { label: "Errors", value: errors, color: "#ef4444" },
    { label: "Warnings", value: warnings, color: "#f59e0b" },
    { label: "Info", value: infoOthers, color: "#8b5cf6" },
  ].filter((s) => s.value > 0);

  const displaySegments =
    segments.length > 0 ? segments : [{ label: "None", value: 1, color: "#e2e8f0" }];

  const pct = (n) => (total > 0 ? Math.round((n / total) * 100) : 0);
  const hasFileIssues = (code.issues_by_file?.length ?? 0) > 0;

  return (
    <CardShell>
      <header className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <Code2 size={22} strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Code Analysis</h3>
            <p className="text-sm text-slate-500">Results of static code scan</p>
          </div>
        </div>
        <button
          type="button"
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="View chart"
        >
          <LineChart size={18} />
        </button>
      </header>

      <div
        className={`mb-5 flex items-start gap-3 rounded-xl border px-4 py-3 ${
          passed
            ? "border-emerald-100 bg-emerald-50/80"
            : "border-amber-100 bg-amber-50/80"
        }`}
      >
        <CheckCircle2
          size={22}
          className={`mt-0.5 shrink-0 ${passed ? "text-emerald-500" : "text-amber-500"}`}
        />
        <div>
          <p className={`font-semibold ${passed ? "text-emerald-800" : "text-amber-800"}`}>
            {passed
              ? "Analysis complete — no syntax errors"
              : "Analysis complete — issues found"}
          </p>
          <p className={`text-sm ${passed ? "text-emerald-600" : "text-amber-600"}`}>
            {passed
              ? "Your code is clean and looks good!"
              : "Review the issues below and fix critical errors."}
          </p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <MetricTile
          icon={Search}
          iconClass="text-blue-500 bg-blue-50"
          label="Files analyzed"
          value={code.files_analyzed}
        />
        <MetricTile
          icon={ShieldAlert}
          iconClass="text-red-500 bg-red-50"
          label="Syntax errors"
          value={errors}
          valueClass={errors > 0 ? "text-red-600" : "text-slate-900"}
        />
        <MetricTile
          icon={AlertTriangle}
          iconClass="text-amber-500 bg-amber-50"
          label="Warnings"
          value={warnings}
          valueClass={warnings > 0 ? "text-amber-600" : "text-slate-900"}
        />
        <MetricTile
          icon={ClipboardList}
          iconClass="text-violet-500 bg-violet-50"
          label="Total issues"
          value={total}
        />
      </div>

      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Issue summary
      </p>
      <div className="mb-5 flex flex-wrap items-center gap-6">
        <DonutChart segments={displaySegments} />
        <ul className="space-y-2 text-sm">
          <LegendRow color="bg-red-500" label="Errors" count={errors} percent={pct(errors)} />
          <LegendRow
            color="bg-amber-500"
            label="Warnings"
            count={warnings}
            percent={pct(warnings)}
          />
          <LegendRow
            color="bg-violet-500"
            label="Info / Others"
            count={infoOthers}
            percent={pct(infoOthers)}
          />
          <li className="border-t border-slate-100 pt-2 font-semibold text-slate-700">
            Total <span className="ml-2 tabular-nums">{total}</span>
          </li>
        </ul>
      </div>

      {hasFileIssues ? (
        <ul className="mb-4 max-h-28 space-y-2 overflow-y-auto text-xs">
          {code.issues_by_file.map(({ file, issues }) => (
            <li key={file} className="rounded-lg bg-slate-50 p-2">
              <p className="font-mono font-medium text-slate-700">{file}</p>
              {issues.map((issue, idx) => (
                <p key={idx} className="mt-1 text-slate-500">
                  {issue.severity}: {issue.message}
                </p>
              ))}
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex items-start gap-2 rounded-xl bg-violet-50/80 px-4 py-3 text-sm text-violet-800">
          <Info size={18} className="mt-0.5 shrink-0 text-violet-500" />
          <span>No code issues detected in scanned files.</span>
        </div>
      )}
    </CardShell>
  );
}

function MetricTile({ icon: Icon, iconClass, label, value, valueClass = "text-slate-900" }) {
  const [bg, text] = iconClass.split(" ");
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-3 py-3 shadow-sm">
      <div className={`mb-2 inline-flex rounded-lg p-1.5 ${bg} ${text}`}>
        <Icon size={16} />
      </div>
      <p className={`text-xl font-bold tabular-nums ${valueClass}`}>
        <AnimatedCounter value={value} />
      </p>
      <p className="text-[11px] text-slate-500">{label}</p>
    </div>
  );
}

function LegendRow({ color, label, count, percent }) {
  return (
    <li className="flex items-center gap-2 text-slate-600">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span className="min-w-[100px]">{label}</span>
      <span className="tabular-nums text-slate-800">
        {count} ({percent}%)
      </span>
    </li>
  );
}

function CardShell({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.08 }}
      className="h-full min-w-0 overflow-hidden rounded-2xl border border-slate-100/80 bg-white p-4 shadow-xl shadow-slate-200/40 sm:p-5 lg:p-6"
    >
      {children}
    </motion.div>
  );
}
