import { motion } from "framer-motion";
import { Brain, Database, FolderSearch, Trophy } from "lucide-react";

const features = [
  {
    num: "01",
    title: "Structure Analysis",
    desc: "Scan and understand your codebase structure",
    Icon: FolderSearch,
    iconBg: "bg-blue-50 text-blue-600",
    numColor: "text-blue-200",
  },
  {
    num: "02",
    title: "Code Intelligence",
    desc: "AI-powered code quality and security analysis",
    Icon: Brain,
    iconBg: "bg-violet-50 text-violet-600",
    numColor: "text-violet-200",
  },
  {
    num: "03",
    title: "Dataset Validation",
    desc: "Validate datasets for accuracy and integrity",
    Icon: Database,
    iconBg: "bg-emerald-50 text-emerald-600",
    numColor: "text-emerald-200",
  },
  {
    num: "04",
    title: "Benchmark Engine",
    desc: "Compare performance with industry standards",
    Icon: Trophy,
    iconBg: "bg-amber-50 text-amber-600",
    numColor: "text-amber-200",
  },
];

export default function FeatureHighlightCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {features.map((f, i) => (
        <motion.div
          key={f.num}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.06 }}
          className="relative overflow-hidden rounded-2xl border border-slate-100/80 bg-white/90 p-5 shadow-card backdrop-blur-sm transition-shadow hover:shadow-card-hover"
        >
          <div
            className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${f.iconBg}`}
          >
            <f.Icon size={22} strokeWidth={1.75} />
          </div>
          <h4 className="font-semibold text-slate-800">{f.title}</h4>
          <p className="mt-1 text-sm leading-snug text-slate-500">{f.desc}</p>
          <span
            className={`absolute bottom-3 right-4 text-3xl font-bold tabular-nums ${f.numColor}`}
          >
            {f.num}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
