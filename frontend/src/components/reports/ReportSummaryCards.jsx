import { motion } from "framer-motion";
import { Award, FileStack, FileText, Shield } from "lucide-react";
import AnimatedWaveChart from "../AnimatedWaveChart";

const ICONS = {
  reports: FileText,
  files: FileStack,
  quality: Shield,
  status: Award,
};

export default function ReportSummaryCards({ stats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, i) => {
        const Icon = ICONS[stat.key] || FileText;
        return (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 shadow-sm ${stat.border} ${stat.bg}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className={`mb-3 inline-flex rounded-xl p-2.5 ${stat.iconBg}`}>
                  <Icon size={18} strokeWidth={2} />
                </div>
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                <p className="mt-0.5 text-[11px] text-slate-400">{stat.sub}</p>
              </div>
              <div className="min-w-[72px] flex-1 max-w-[100px] opacity-95">
                <AnimatedWaveChart
                  value={stat.wavePercent}
                  color={stat.color}
                  glowColor={stat.glowColor}
                  height={36}
                  speed={stat.waveSpeed}
                  pulsePosition={0.7 + i * 0.03}
                />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
