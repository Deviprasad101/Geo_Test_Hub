import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CloudUpload,
  FileJson,
  Loader2,
  Upload,
} from "lucide-react";
import AuditHeadingCard from "./AuditHeadingCard";

export default function UploadPanel({
  geoFile,
  setGeoFile,
  projectName,
  setProjectName,
  disabled,
  onStartAudit,
  auditing,
  compact = false,
}) {
  const [dragOver, setDragOver] = useState(false);
  const canStart = canStartAudit(geoFile);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (isGeoJsonFile(file)) {
        setGeoFile(file);
      }
    },
    [setGeoFile]
  );

  return (
    <div className={`mx-auto w-full min-w-0 max-w-full ${compact ? "space-y-4" : "space-y-8"}`}>
      <AuditHeadingCard compact={compact} />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className={`audit-main-card relative overflow-hidden rounded-3xl border border-white/80 bg-white/90 shadow-xl shadow-slate-200/50 backdrop-blur-md ${
          compact ? "p-4 md:p-5 lg:p-6" : "p-6 md:p-8 lg:p-10"
        }`}
      >
        <div className="relative grid gap-8 lg:grid-cols-2 lg:gap-10">
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
              Drag &amp; Drop your GeoJSON file here
            </p>
            <p className="mt-1 text-sm text-slate-500">
              or click to browse .geojson / .json files from your device
            </p>
            <label className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition hover:bg-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50">
              <Upload size={16} />
              Choose GeoJSON File
              <input
                type="file"
                accept=".geojson,.json,application/geo+json,application/json"
                className="hidden"
                disabled={disabled}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (isGeoJsonFile(f)) {
                    setGeoFile(f);
                  }
                }}
              />
            </label>
            {geoFile && (
              <p className="mt-4 text-sm font-medium text-emerald-600">{geoFile.name}</p>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <h3 className="text-xl font-bold text-violet-700">Validation project</h3>
            <p className="mt-1 text-sm text-slate-500">
              Optional name for this GeoJSON validation run
            </p>
            <div className="relative mt-5">
              <FileJson className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. City boundaries audit"
                value={projectName}
                disabled={disabled}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
            </div>
            <p className="mt-3 text-xs text-slate-400">
              Files are validated against GeoJSON rules via the GVIP backend.
            </p>
          </div>
        </div>
      </motion.div>

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
                Validating…
              </>
            ) : (
              "Validate GeoJSON"
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

function isGeoJsonFile(file) {
  if (!file) return false;
  const name = file.name.toLowerCase();
  return name.endsWith(".geojson") || name.endsWith(".json");
}

export function canStartAudit(geoFile) {
  return Boolean(geoFile);
}
