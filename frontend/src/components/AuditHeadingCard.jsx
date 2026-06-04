import { motion } from "framer-motion";
import AuditHeroDecor from "./AuditHeroDecor";
import GeoTestHubBrand from "./GeoTestHubBrand";

export default function AuditHeadingCard({ compact = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-br from-indigo-50/90 via-white to-sky-50/80 shadow-xl shadow-slate-200/40 backdrop-blur-md ${
        compact ? "p-5 md:p-6" : "p-8 md:p-10"
      }`}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-56 w-56 rounded-full bg-violet-200/30 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-12 left-1/4 h-40 w-40 rounded-full bg-sky-200/40 blur-3xl"
        aria-hidden
      />

      <div
        className={`relative ${compact ? "md:min-h-[10rem] lg:min-h-[11rem]" : "md:min-h-[12rem] lg:min-h-[13rem]"}`}
      >
        <AuditHeroDecor compact={compact} />
        <div className={`relative z-10 ${compact ? "max-w-xl" : "max-w-2xl"}`}>
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
            Code intelligence platform
          </p>
          <div className="mt-3">
            <GeoTestHubBrand size={compact ? "md" : "lg"} />
          </div>
          <p
            className={`mt-3 leading-relaxed text-slate-600 ${
              compact ? "text-sm md:text-base" : "text-base md:text-lg"
            }`}
          >
            Upload a ZIP archive or connect a GitHub repository to analyze structure,
            code quality, datasets, and benchmarks in one run.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
