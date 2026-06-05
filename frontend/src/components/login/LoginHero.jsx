import { motion } from "framer-motion";

export default function LoginHero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative z-10 shrink-0"
    >
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#2563EB] lg:text-sm">
        Sandbox
      </p>
      <h1 className="mt-2 text-2xl font-extrabold leading-tight tracking-tight text-[#0F172A] lg:text-3xl xl:text-[2.1rem]">
        Geospatial Intelligence &amp; Code Quality Platform
      </h1>
      <p className="mt-3 max-w-xl text-xs leading-relaxed text-slate-600 lg:text-sm">
        AI-powered auditing, dataset validation, benchmarking, and intelligent project
        insights — built for research teams and enterprises.
      </p>
    </motion.div>
  );
}
