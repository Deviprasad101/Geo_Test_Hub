import { motion } from "framer-motion";
import { Archive, Code2, Database, Github } from "lucide-react";

const icons = [
  { Icon: Archive, className: "left-[8%] top-[12%] text-amber-500", delay: 0 },
  { Icon: Github, className: "left-[38%] top-[4%] text-slate-700", delay: 0.15 },
  { Icon: Code2, className: "right-[28%] top-[8%] text-violet-500", delay: 0.3 },
  { Icon: Database, className: "right-[6%] top-[18%] text-emerald-500", delay: 0.45 },
];

export default function AuditHeroDecor() {
  return (
    <div className="pointer-events-none absolute right-0 top-0 hidden h-48 w-72 md:block lg:w-96">
      <svg
        className="absolute inset-0 h-full w-full opacity-40"
        viewBox="0 0 320 180"
        fill="none"
        aria-hidden
      >
        <path
          d="M20 90 Q120 20 200 60 T300 80"
          stroke="url(#auditTrail)"
          strokeWidth="2"
          strokeDasharray="6 8"
        />
        <defs>
          <linearGradient id="auditTrail" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
      </svg>
      {icons.map(({ Icon, className, delay }) => (
        <motion.div
          key={className}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: [0, -6, 0] }}
          transition={{
            opacity: { duration: 0.5, delay },
            y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay },
          }}
          className={`absolute ${className}`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/80 bg-white/90 shadow-lg shadow-indigo-100/80 backdrop-blur-sm">
            <Icon size={22} strokeWidth={1.75} />
          </div>
        </motion.div>
      ))}
      {[...Array(6)].map((_, i) => (
        <span
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-indigo-300/60"
          style={{
            left: `${15 + i * 14}%`,
            top: `${20 + (i % 3) * 18}%`,
          }}
        />
      ))}
    </div>
  );
}
