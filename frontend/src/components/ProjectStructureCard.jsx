import { motion } from "framer-motion";
import {
  File,
  FileCode,
  FileImage,
  FileSpreadsheet,
  FileText,
  Folder,
  FolderOpen,
  MoreVertical,
  Files,
} from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";

const BAR_COLORS = [
  "bg-pink-400",
  "bg-orange-400",
  "bg-amber-400",
  "bg-yellow-400",
  "bg-lime-500",
  "bg-teal-400",
  "bg-cyan-400",
  "bg-sky-400",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-purple-500",
];

function typeIcon(type) {
  const t = type.toLowerCase();
  if (t.includes("png") || t.includes("jpg") || t.includes("image") || t.includes("webp"))
    return FileImage;
  if (t.includes("javascript") || t.includes("python") || t.includes("html") || t.includes("typescript"))
    return FileCode;
  if (t.includes("csv") || t.includes("json") || t.includes("geo"))
    return FileSpreadsheet;
  if (t.includes("text") || t.includes("markdown"))
    return FileText;
  return File;
}

function fileName(path) {
  const parts = path.split(/[/\\]/);
  return parts[parts.length - 1] || path;
}

export default function ProjectStructureCard({ structure, loading }) {
  if (loading) {
    return (
      <CardShell>
        <div className="animate-pulse space-y-4">
          <div className="h-14 rounded-xl bg-slate-100" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-slate-100" />
            ))}
          </div>
          <div className="h-48 rounded-xl bg-slate-100" />
        </div>
      </CardShell>
    );
  }

  if (!structure) return null;

  const maxCount = Math.max(...(structure.file_types?.map((f) => f.count) || [1]), 1);

  return (
    <CardShell>
      <header className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <FolderOpen size={22} strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Project Structure</h3>
            <p className="text-sm text-slate-500">Overview of your project files</p>
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

      <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-3">
        <StatMini
          icon={Files}
          iconBg="bg-blue-50 text-blue-600"
          value={structure.total_files}
          label="Total Files"
        />
        <StatMini
          icon={Folder}
          iconBg="bg-emerald-50 text-emerald-600"
          value={structure.total_folders}
          label="Total Folders"
        />
        <StatMini
          icon={FileText}
          iconBg="bg-violet-50 text-violet-600"
          value={structure.file_type_count}
          label="File Types"
        />
      </div>

      {structure.file_types?.length > 0 ? (
        <ul className="mb-6 space-y-2.5">
          {structure.file_types.map((f, i) => {
            const Icon = typeIcon(f.type);
            const pct = (f.count / maxCount) * 100;
            const barColor = BAR_COLORS[i % BAR_COLORS.length];
            return (
              <li key={f.type} className="flex items-center gap-3 text-sm">
                <Icon size={16} className="shrink-0 text-slate-400" />
                <span className="w-16 shrink-0 truncate font-medium text-slate-700 sm:w-20 lg:w-24">
                  {f.type}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, delay: i * 0.04 }}
                    className={`h-full rounded-full ${barColor}`}
                  />
                </div>
                <span className="w-8 text-right font-semibold tabular-nums text-slate-700">
                  {f.count}
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mb-6 text-sm text-slate-500">No files found in this project.</p>
      )}

      {structure.files?.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-bold tracking-wide text-blue-600">
            FILES IN PROJECT ({structure.files.length})
          </p>
          <ul className="max-h-44 space-y-1 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/60 p-3 pr-2 text-sm text-slate-600 [scrollbar-color:#a78bfa_#f1f5f9] [scrollbar-width:thin]">
            {structure.files.map((path) => (
              <li key={path} className="flex items-center gap-2 truncate" title={path}>
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

function StatMini({ icon: Icon, iconBg, value, label }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-3 py-3 shadow-sm">
      <div className={`mb-2 inline-flex rounded-lg p-1.5 ${iconBg}`}>
        <Icon size={16} />
      </div>
      <p className="text-xl font-bold text-slate-900">
        <AnimatedCounter value={value} />
      </p>
      <p className="text-[11px] text-slate-500">{label}</p>
    </div>
  );
}

function CardShell({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative h-full min-w-0 overflow-hidden rounded-2xl border border-slate-100/80 bg-white p-4 shadow-xl shadow-slate-200/40 sm:p-5 lg:p-6"
    >
      {children}
    </motion.div>
  );
}
