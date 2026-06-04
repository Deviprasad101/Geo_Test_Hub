import { motion } from "framer-motion";
import { Database, File, MoreVertical, CheckCircle2, AlertTriangle } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";

function validationBadge(status) {
  const map = {
    passed: { label: "Passed", className: "bg-emerald-100 text-emerald-700" },
    warning: { label: "Warning", className: "bg-amber-100 text-amber-700" },
    failed: { label: "Failed", className: "bg-red-100 text-red-700" },
    none: { label: "No datasets", className: "bg-slate-100 text-slate-600" },
  };
  return map[status] || map.none;
}

function schemaLabel(check) {
  if (check === "valid") return { label: "Valid", className: "bg-emerald-100 text-emerald-700" };
  if (check === "invalid") return { label: "Invalid", className: "bg-red-100 text-red-700" };
  return { label: "N/A", className: "bg-slate-100 text-slate-600" };
}

function fileName(path) {
  const parts = path.split(/[/\\]/);
  return parts[parts.length - 1] || path;
}

export default function DatasetValidationCard({ datasets, loading }) {
  if (loading) {
    return (
      <CardShell className="lg:col-span-2">
        <div className="animate-pulse h-40 rounded-xl bg-slate-100" />
      </CardShell>
    );
  }

  if (!datasets) return null;

  const badge = validationBadge(datasets.validation_status);
  const schema = schemaLabel(datasets.schema_check);
  const passed = datasets.validation_status === "passed";

  return (
    <CardShell className="lg:col-span-2">
      <header className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Database size={22} strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Dataset Validation</h3>
            <p className="text-sm text-slate-500">GeoJSON and data file integrity</p>
          </div>
        </div>
        <button
          type="button"
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100"
          aria-label="More options"
        >
          <MoreVertical size={18} />
        </button>
      </header>

      <div
        className={`mb-5 flex items-start gap-3 rounded-xl border px-4 py-3 ${
          passed
            ? "border-emerald-100 bg-emerald-50/80"
            : datasets.validation_status === "failed"
              ? "border-red-100 bg-red-50/80"
              : "border-amber-100 bg-amber-50/80"
        }`}
      >
        {passed ? (
          <CheckCircle2 size={22} className="shrink-0 text-emerald-500" />
        ) : (
          <AlertTriangle size={22} className="shrink-0 text-amber-500" />
        )}
        <div>
          <p className="font-semibold text-slate-800">Validation {badge.label}</p>
          <p className="text-sm text-slate-500">
            {datasets.dataset_file_count} dataset file
            {datasets.dataset_file_count !== 1 ? "s" : ""} checked
          </p>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat label="Dataset files" value={datasets.dataset_file_count} />
        <MiniStat label="Warnings" value={datasets.missing_values} accent="text-amber-600" />
        <MiniStat label="Invalid records" value={datasets.invalid_records} accent="text-red-600" />
        <div className="rounded-xl border border-slate-100 bg-white px-3 py-3 shadow-sm">
          <p className="text-[11px] text-slate-500">Schema check</p>
          <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${schema.className}`}>
            {schema.label}
          </span>
        </div>
      </div>

      {datasets.dataset_files?.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-bold tracking-wide text-emerald-600">
            DATA FILES CHECKED ({datasets.dataset_files.length})
          </p>
          <ul className="max-h-36 space-y-1 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-sm">
            {datasets.dataset_files.map((path) => (
              <li key={path} className="flex items-center gap-2 truncate text-slate-600">
                <File size={14} className="shrink-0 text-slate-400" />
                <span className="truncate font-mono text-xs">{fileName(path)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </CardShell>
  );
}

function MiniStat({ label, value, accent = "text-slate-900" }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-3 py-3 shadow-sm">
      <p className={`text-xl font-bold tabular-nums ${accent}`}>
        <AnimatedCounter value={value} />
      </p>
      <p className="text-[11px] text-slate-500">{label}</p>
    </div>
  );
}

function CardShell({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.12 }}
      className={`overflow-hidden rounded-2xl border border-slate-100/80 bg-white p-6 shadow-xl shadow-slate-200/40 ${className}`}
    >
      {children}
    </motion.div>
  );
}
