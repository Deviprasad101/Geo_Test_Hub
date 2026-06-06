import { motion } from "framer-motion";
import {
  BarChart3,
  Clock,
  Crosshair,
  Gauge,
  Shield,
  TriangleAlert,
} from "lucide-react";
import AnimatedWaveChart from "../AnimatedWaveChart";
import DonutChart from "../DonutChart";

const MINI_ICONS = {
  errors: Crosshair,
  warnings: TriangleAlert,
  security: Shield,
  performance: Gauge,
};

export default function ReportInsightsPanel({ insights }) {
  const total = insights.donut.total;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:p-6"
    >
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
          <BarChart3 size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Report Insights</h3>
          <p className="text-sm text-slate-500">Key metrics from the latest analysis</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[auto_1fr_auto]">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/50 px-6 py-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
            File Distribution
          </p>
          <div className="relative">
            <DonutChart segments={insights.donut.segments} size={140} stroke={20} />
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-800">{total}</span>
              <span className="text-[10px] font-medium text-slate-500">Total Files</span>
            </div>
          </div>
          <ul className="mt-4 w-full space-y-1.5 text-xs">
            {insights.donut.segments.map((seg) => {
              const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0;
              return (
                <li key={seg.label} className="flex items-center justify-between gap-2 text-slate-600">
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: seg.color }}
                    />
                    {seg.label}
                  </span>
                  <span className="tabular-nums text-slate-700">
                    {seg.value} ({pct}%)
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4">
          {insights.miniCards.map((card, i) => {
            const Icon = MINI_ICONS[card.key] || Gauge;
            return (
              <div
                key={card.key}
                className="flex flex-col rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
              >
                <div
                  className="mb-2 inline-flex w-fit rounded-lg p-1.5"
                  style={{ backgroundColor: `${card.color}18`, color: card.color }}
                >
                  <Icon size={16} />
                </div>
                <p className="text-xs font-medium text-slate-500">{card.label}</p>
                <p className="text-xl font-bold text-slate-800">{card.value}</p>
                <p className="text-[11px] text-slate-400">{card.sub}</p>
                <div className="mt-3 w-full min-w-0">
                  <AnimatedWaveChart
                    value={card.wavePercent}
                    color={card.color}
                    glowColor={card.glowColor}
                    height={34}
                    speed={card.waveSpeed}
                    pulsePosition={0.68 + i * 0.04}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
          <p className="mb-4 text-xs font-bold uppercase tracking-wide text-slate-500">
            Activity Summary
          </p>
          <ul className="space-y-3">
            {insights.activity.map((item) => (
              <li
                key={item.label}
                className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 text-sm last:border-0 last:pb-0"
              >
                <span className="flex items-center gap-2 text-slate-500">
                  <Clock size={14} className="text-slate-400" />
                  {item.label}
                </span>
                <span className="font-semibold tabular-nums text-slate-800">{item.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
