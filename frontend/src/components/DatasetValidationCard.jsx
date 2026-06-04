import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Database,
  File,
  FileStack,
  MoreVertical,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";
import { formatFileSize } from "../lib/benchmarkUtils";

function statusBanner(status, fileCount, invalid, warnings) {
  if (status === "passed") {
    return {
      title: "Validation Passed",
      sub: `${fileCount} dataset file${fileCount !== 1 ? "s" : ""} checked • All integrity checks passed`,
      bannerClass: "border-emerald-100 bg-gradient-to-r from-emerald-50 to-emerald-50/40",
      iconClass: "text-emerald-500",
    };
  }
  if (status === "failed") {
    return {
      title: "Validation Failed",
      sub: `${fileCount} file${fileCount !== 1 ? "s" : ""} checked • ${invalid} invalid record${invalid !== 1 ? "s" : ""} found`,
      bannerClass: "border-red-100 bg-gradient-to-r from-red-50 to-red-50/40",
      iconClass: "text-red-500",
    };
  }
  if (status === "warning") {
    return {
      title: "Validation Warning",
      sub: `${fileCount} file${fileCount !== 1 ? "s" : ""} checked • ${warnings} warning${warnings !== 1 ? "s" : ""} detected`,
      bannerClass: "border-amber-100 bg-gradient-to-r from-amber-50 to-amber-50/40",
      iconClass: "text-amber-500",
    };
  }
  return {
    title: "No Datasets Found",
    sub: "Upload GeoJSON, CSV, or other data files to validate",
    bannerClass: "border-slate-100 bg-slate-50",
    iconClass: "text-slate-400",
  };
}

function fileStatusBadge(status) {
  if (status === "valid")
    return (
      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
        Valid
      </span>
    );
  if (status === "warning")
    return (
      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
        Warning
      </span>
    );
  return (
    <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
      Invalid
    </span>
  );
}

export default function DatasetValidationCard({ datasets, loading }) {
  if (loading) {
    return (
      <CardShell>
        <div className="animate-pulse space-y-4">
          <div className="h-14 rounded-xl bg-slate-100" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-slate-100" />
            ))}
          </div>
          <div className="h-32 rounded-xl bg-slate-100" />
        </div>
      </CardShell>
    );
  }

  if (!datasets) return null;

  const passed = datasets.validation_status === "passed";
  const banner = statusBanner(
    datasets.validation_status,
    datasets.dataset_file_count,
    datasets.invalid_records,
    datasets.missing_values
  );
  const schemaValid = datasets.schema_check === "valid";
  const fileDetails =
    datasets.file_details?.length > 0
      ? datasets.file_details
      : (datasets.dataset_files || []).map((path) => ({
          path,
          name: path.split(/[/\\]/).pop(),
          size_bytes: 0,
          status: "valid",
        }));

  return (
    <CardShell>
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
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="More options"
        >
          <MoreVertical size={18} />
        </button>
      </header>

      <div
        className={`mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border px-5 py-4 ${banner.bannerClass}`}
      >
        <div className="flex items-start gap-3">
          <ShieldCheck size={24} className={`mt-0.5 shrink-0 ${banner.iconClass}`} />
          <div>
            <p
              className={`font-semibold ${
                datasets.validation_status === "passed"
                  ? "text-emerald-800"
                  : datasets.validation_status === "failed"
                    ? "text-red-800"
                    : datasets.validation_status === "warning"
                      ? "text-amber-800"
                      : "text-slate-700"
              }`}
            >
              {banner.title}
            </p>
            <p className="text-sm text-slate-600">{banner.sub}</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center justify-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100/80 shadow-inner">
            <ShieldCheck size={32} className="text-emerald-500" />
            {passed && (
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow">
                <CheckCircle2 size={14} />
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard
          icon={FileStack}
          iconBg="bg-blue-50 text-blue-600"
          value={datasets.dataset_file_count}
          label="Dataset files"
          hint="Checked"
          hintClass="text-blue-600"
        />
        <MetricCard
          icon={AlertTriangle}
          iconBg="bg-amber-50 text-amber-600"
          value={datasets.missing_values}
          label="Warnings"
          hint="Detected"
          hintClass="text-amber-600"
        />
        <MetricCard
          icon={XCircle}
          iconBg="bg-violet-50 text-violet-600"
          value={datasets.invalid_records}
          label="Invalid records"
          hint="Found"
          hintClass="text-violet-600"
        />
        <div className="rounded-xl border border-slate-100 bg-gradient-to-br from-white to-emerald-50/30 p-4 shadow-sm">
          <div className="mb-2 inline-flex rounded-lg bg-emerald-50 p-1.5 text-emerald-600">
            <CheckCircle2 size={16} />
          </div>
          <p className="text-[11px] font-medium text-slate-500">Schema check</p>
          <span
            className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              schemaValid ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
            }`}
          >
            {schemaValid ? "Valid" : datasets.schema_check === "n/a" ? "N/A" : "Invalid"}
          </span>
          <p className="mt-1 text-[10px] text-slate-400">
            {schemaValid ? "All schemas are valid" : "Review schema issues"}
          </p>
        </div>
      </div>

      {fileDetails.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="mb-3 text-xs font-bold tracking-wide text-emerald-600">
              DATA FILES CHECKED ({fileDetails.length})
            </p>
            <ul className="space-y-2">
              {fileDetails.map((file) => (
                <li
                  key={file.path}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 transition hover:bg-white hover:shadow-sm"
                >
                  <File size={18} className="shrink-0 text-slate-400" />
                  <span className="min-w-0 flex-1 truncate font-mono text-sm text-slate-700">
                    {file.name}
                  </span>
                  {fileStatusBadge(file.status)}
                  <span className="hidden text-xs text-slate-400 sm:inline">
                    {formatFileSize(file.size_bytes)}
                  </span>
                  <ChevronRight size={16} className="shrink-0 text-slate-300" />
                </li>
              ))}
            </ul>
          </div>
          <div className="hidden lg:flex items-center justify-center px-4">
            <div className="relative">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-14 w-10 rounded-lg border border-slate-200 bg-white shadow-sm"
                    style={{ transform: `rotate(${-6 + i * 6}deg) translateY(${i * 2}px)` }}
                  />
                ))}
              </div>
              <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
                <CheckCircle2 size={16} />
              </span>
            </div>
          </div>
        </div>
      )}
    </CardShell>
  );
}

function MetricCard({ icon: Icon, iconBg, value, label, hint, hintClass }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className={`mb-2 inline-flex rounded-lg p-1.5 ${iconBg}`}>
        <Icon size={16} />
      </div>
      <p className="text-2xl font-bold tabular-nums text-slate-900">
        <AnimatedCounter value={value} />
      </p>
      <p className="text-[11px] font-medium text-slate-500">{label}</p>
      {hint && <p className={`mt-0.5 text-[10px] font-medium ${hintClass}`}>{hint}</p>}
    </div>
  );
}

function CardShell({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.12 }}
      className="overflow-hidden rounded-2xl border border-slate-100/80 bg-white p-6 shadow-xl shadow-slate-200/40"
    >
      {children}
    </motion.div>
  );
}
