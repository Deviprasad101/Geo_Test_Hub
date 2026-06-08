import { motion } from "framer-motion";
import { Activity, BarChart3, Database, Globe } from "lucide-react";
import AnimatedCounter from "../AnimatedCounter";

const STATS = [
  { value: 50, suffix: "+", label: "Projects Audited", icon: Globe },
  { value: 100, suffix: "+", label: "Datasets Validated", icon: Database },
  { value: 95, suffix: "%", label: "Accuracy Score", icon: BarChart3 },
  { value: 24, suffix: "/7", label: "Monitoring", icon: Activity },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export default function LoginHero() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="relative z-10 w-full">
      <motion.div variants={item} className="mb-5 flex items-center gap-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563EB] via-[#7C3AED] to-[#06B6D4] shadow-lg shadow-[#2563EB]/30">
          <Globe size={22} className="text-white" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p className="text-base font-bold tracking-wide text-[#0F172A]">GEO TEST HUB</p>
          <p className="text-sm text-slate-500">Geospatial Intelligence &amp; Code Quality</p>
        </div>
      </motion.div>

      <motion.span
        variants={item}
        className="inline-flex rounded-full border border-[#7C3AED]/25 bg-[#7C3AED]/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-[#7C3AED] sm:text-xs"
      >
        Sandbox
      </motion.span>

      <motion.h1
        variants={item}
        className="mt-4 max-w-2xl text-[1.65rem] font-extrabold leading-[1.2] tracking-tight text-[#0F172A] sm:text-3xl lg:text-[2rem]"
      >
        <span className="login-gradient-text">Geospatial Intelligence</span>
        <br />
        &amp; <span className="login-gradient-text">Code Quality</span> Platform
      </motion.h1>

      <motion.p
        variants={item}
        className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-[15px]"
      >
        AI-powered auditing, dataset validation, benchmarking, and intelligent project
        insights — built for research teams and enterprises.
      </motion.p>

      <motion.div
        variants={item}
        className="login-stat-grid mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-3"
      >
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="login-stat-card flex h-full min-h-[5.5rem] flex-col items-center justify-center rounded-2xl border border-white/60 bg-white/50 px-2 py-3 text-center backdrop-blur-md sm:min-h-[6rem] sm:px-3 sm:py-3.5"
          >
            <stat.icon size={14} className="mb-1.5 shrink-0 text-[#2563EB]" />
            <p className="text-lg font-bold leading-none text-[#0F172A] sm:text-xl">
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
            </p>
            <p className="mt-1.5 min-h-[2rem] text-[10px] font-medium leading-tight text-slate-500 sm:text-[11px]">
              {stat.label}
            </p>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
