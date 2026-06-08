import { motion } from "framer-motion";
import { BarChart3, Brain, Database, FolderSearch } from "lucide-react";

const FEATURES = [
  {
    title: "Structure Analysis",
    desc: "Analyze repositories with AI insights",
    icon: FolderSearch,
    gradient: "from-[#2563EB] to-[#06B6D4]",
    accent: "text-[#2563EB]",
    glow: "shadow-[#2563EB]/20",
  },
  {
    title: "Code Intelligence",
    desc: "AI-powered quality and security scans",
    icon: Brain,
    gradient: "from-[#7C3AED] to-[#2563EB]",
    accent: "text-[#7C3AED]",
    glow: "shadow-[#7C3AED]/20",
  },
  {
    title: "Dataset Validation",
    desc: "Validate integrity, schemas & compliance",
    icon: Database,
    gradient: "from-[#10B981] to-[#06B6D4]",
    accent: "text-[#10B981]",
    glow: "shadow-[#10B981]/20",
  },
  {
    title: "Benchmark Engine",
    desc: "Compare quality with industry standards",
    icon: BarChart3,
    gradient: "from-[#F59E0B] to-[#EF4444]",
    accent: "text-[#F59E0B]",
    glow: "shadow-[#F59E0B]/20",
  },
];

export default function LoginFeatureCards() {
  return (
    <motion.div
      id="features"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5 }}
      className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:mt-8"
    >
      {FEATURES.map((f, i) => (
        <motion.div
          key={f.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 + i * 0.08 }}
          whileHover={{ y: -8, scale: 1.03 }}
          className={`login-premium-feature-card group relative overflow-hidden rounded-2xl border border-white/70 bg-white/55 p-4 backdrop-blur-xl transition-shadow duration-300 hover:shadow-xl ${f.glow} sm:p-5`}
        >
          <div className="login-feature-card-border pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="relative flex items-start gap-3.5">
            <motion.div
              whileHover={{ rotate: [0, -6, 6, 0] }}
              transition={{ duration: 0.5 }}
              className={`login-feature-icon shrink-0 rounded-xl bg-gradient-to-br ${f.gradient} p-2.5 text-white shadow-lg sm:p-3`}
              style={{ animationDelay: `${i * 0.4}s` }}
            >
              <f.icon size={20} strokeWidth={1.75} />
            </motion.div>
            <div className="min-w-0 flex-1">
              <h3 className={`text-sm font-bold leading-tight sm:text-base ${f.accent}`}>
                {f.title}
              </h3>
              <p className="mt-1.5 text-xs leading-snug text-slate-500 sm:text-sm">{f.desc}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
