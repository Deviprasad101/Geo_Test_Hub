import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CloudUpload,
  Github,
  Loader2,
  Sparkles,
  Upload,
} from "lucide-react";
import AuditHeadingCard from "./AuditHeadingCard";

export default function UploadPanel({
  zipFile,
  setZipFile,
  githubUrl,
  setGithubUrl,
  disabled,
  onStartAudit,
  auditing,
  compact = false,
}) {
  const [dragOver, setDragOver] = useState(false);
  const canStart = canStartAudit(zipFile, githubUrl);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file?.name.toLowerCase().endsWith(".zip")) {
        setZipFile(file);
        setGithubUrl("");
      }
    },
    [setZipFile, setGithubUrl]
  );

  return (
    <div className={`mx-auto w-full min-w-0 max-w-full ${compact ? "space-y-4" : "space-y-8"}`}>
      <AuditHeadingCard compact={compact} />

      {/* Main upload card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className={`audit-main-card relative overflow-hidden rounded-3xl border border-white/80 bg-white/90 shadow-xl shadow-slate-200/50 backdrop-blur-md ${
          compact ? "p-4 md:p-5 lg:p-6" : "p-6 md:p-8 lg:p-10"
        }`}
      >
        <div className="relative grid gap-8 lg:grid-cols-2 lg:gap-10">
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 hidden -translate-x-1/2 -translate-y-1/2 lg:block">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border-4 border-white bg-slate-100 text-xs font-bold tracking-wide text-slate-500 shadow-md">
              OR
            </span>
          </div>

          {/* ZIP */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all lg:p-10 ${
              dragOver
                ? "border-blue-400 bg-blue-50/60"
                : "border-blue-200/80 bg-gradient-to-b from-sky-50/40 to-white/50 hover:border-blue-300"
            }`}
          >
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-blue-50 shadow-inner">
              <CloudUpload className="h-10 w-10 text-sky-500" strokeWidth={1.5} />
            </div>
            <p className="text-lg font-semibold text-slate-800">
              Drag &amp; Drop your ZIP file here
            </p>
            <p className="mt-1 text-sm text-slate-500">
              or click to browse files from your device
            </p>
            <label className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition hover:bg-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50">
              <Upload size={16} />
              Choose ZIP File
              <input
                type="file"
                accept=".zip"
                className="hidden"
                disabled={disabled}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setZipFile(f);
                    setGithubUrl("");
                  }
                }}
              />
            </label>
            {zipFile && (
              <p className="mt-4 text-sm font-medium text-emerald-600">{zipFile.name}</p>
            )}
          </div>

          <div className="flex items-center justify-center lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-slate-100 text-xs font-bold text-slate-500 shadow-sm">
              OR
            </span>
          </div>

          {/* GitHub */}
          <div className="flex flex-col justify-center">
            <h3 className="text-xl font-bold text-violet-700">Clone from GitHub</h3>
            <p className="mt-1 text-sm text-slate-500">
              Enter a public repository URL to analyze
            </p>
            <div className="relative mt-5">
              <Github className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="url"
                placeholder="https://github.com/username/repository"
                value={githubUrl}
                disabled={disabled}
                onChange={(e) => {
                  setGithubUrl(e.target.value);
                  if (e.target.value) setZipFile(null);
                }}
                className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
            </div>
            <p className="mt-3 text-xs text-slate-400">
              We only access public repositories and never store your code.
            </p>
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <div className="flex justify-center">
        <motion.button
          type="button"
          whileHover={{ scale: canStart && !auditing ? 1.02 : 1 }}
          whileTap={{ scale: canStart && !auditing ? 0.98 : 1 }}
          disabled={!canStart || auditing || disabled}
          onClick={onStartAudit}
          className="audit-cta group flex w-full max-w-md items-center gap-0 overflow-hidden rounded-full p-1.5 pl-6 shadow-xl shadow-indigo-300/40 disabled:cursor-not-allowed disabled:opacity-55 sm:max-w-lg"
        >
          <span className="flex flex-1 items-center justify-center gap-2 py-3 text-base font-semibold text-white">
            {auditing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Scanning files…
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Start Smart Audit
              </>
            )}
          </span>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 transition group-hover:bg-white/30">
            <ArrowRight className="h-5 w-5 text-white" />
          </span>
        </motion.button>
      </div>
    </div>
  );
}

export function canStartAudit(zipFile, githubUrl) {
  return Boolean(zipFile || githubUrl?.trim());
}
