import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Brain, Database, FolderSearch } from "lucide-react";

const FEATURES = [
  {
    title: "Structure Analysis",
    desc: "Analyze repositories with AI insights",
    icon: FolderSearch,
    gradient: "from-[#2563EB] to-[#06B6D4]",
    accent: "text-[#2563EB]",
  },
  {
    title: "Code Intelligence",
    desc: "AI-powered quality and security scans",
    icon: Brain,
    gradient: "from-[#7C3AED] to-[#2563EB]",
    accent: "text-[#7C3AED]",
  },
  {
    title: "Dataset Validation",
    desc: "Validate integrity, schemas & compliance",
    icon: Database,
    gradient: "from-[#10B981] to-[#06B6D4]",
    accent: "text-[#10B981]",
  },
  {
    title: "Benchmark Engine",
    desc: "Compare quality with industry standards",
    icon: BarChart3,
    gradient: "from-[#F59E0B] to-[#EF4444]",
    accent: "text-[#F59E0B]",
  },
];

export default function LoginFeatureCards() {
  return (
    <motion.div
      id="features"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="login-features-panel mt-5 hidden w-full shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm lg:mt-6 lg:block"
    >
      <div className="grid grid-cols-2">
        {FEATURES.map((f, i) => {
          const isLeft = i % 2 === 0;
          const isTop = i < 2;
          return (
            <div
              key={f.title}
              className={`login-feature-cell flex items-start gap-3 p-4 lg:gap-4 lg:p-5 ${
                isLeft ? "border-r border-slate-100" : ""
              } ${isTop ? "border-b border-slate-100" : ""}`}
            >
              <div
                className={`login-feature-icon shrink-0 rounded-xl bg-gradient-to-br ${f.gradient} p-2.5 text-white shadow-sm lg:p-3`}
                style={{ animationDelay: `${i * 0.4}s` }}
              >
                <f.icon size={20} strokeWidth={1.75} className="lg:h-[22px] lg:w-[22px]" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className={`text-sm font-bold leading-tight lg:text-base ${f.accent}`}>
                  {f.title}
                </h3>
                <p className="mt-1 text-xs leading-snug text-slate-500 lg:text-sm">
                  {f.desc}
                </p>
              </div>
              <ArrowRight
                size={16}
                className={`mt-1 shrink-0 lg:h-[18px] lg:w-[18px] ${f.accent}`}
                strokeWidth={2.5}
              />
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
