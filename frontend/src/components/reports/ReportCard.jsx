import { motion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  BadgeCheck,
  CheckCircle2,
  Database,
  Download,
  Eye,
  FileStack,
  Gauge,
  Search,
  Settings2,
  Shield,
} from "lucide-react";

const THEMES = {
  blue: {
    card: "border-blue-100 bg-gradient-to-br from-blue-50/50 via-white to-white",
    iconWrap: "bg-blue-500 text-white shadow-md shadow-blue-500/25",
    gauge: "#3b82f6",
    download: "from-[#2563EB] to-[#3B82F6] shadow-blue-500/25 hover:from-[#1D4ED8] hover:to-[#2563EB]",
    metricBg: "bg-blue-50/60",
  },
  green: {
    card: "border-emerald-100 bg-gradient-to-br from-emerald-50/50 via-white to-white",
    iconWrap: "bg-emerald-500 text-white shadow-md shadow-emerald-500/25",
    gauge: "#10b981",
    download: "from-[#059669] to-[#10B981] shadow-emerald-500/25 hover:from-[#047857] hover:to-[#059669]",
    metricBg: "bg-emerald-50/60",
  },
  orange: {
    card: "border-amber-100 bg-gradient-to-br from-amber-50/50 via-white to-white",
    iconWrap: "bg-amber-500 text-white shadow-md shadow-amber-500/25",
    gauge: "#f59e0b",
    download: "from-[#F59E0B] to-[#FBBF24] shadow-amber-500/25 hover:from-[#D97706] hover:to-[#F59E0B]",
    metricBg: "bg-amber-50/60",
  },
};

function ScoreGauge({ value, color, size = 80 }) {
  const radius = 30;
  const stroke = 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;
  const displayValue = `${Math.min(100, Math.max(0, value))}%`;

  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full"
      style={{ width: size, height: size }}
      aria-label={`Score ${displayValue}`}
    >
      <svg
        className="absolute inset-0 -rotate-90"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-1.5 text-center leading-none">
        <span className="max-w-full truncate text-base font-bold tabular-nums text-slate-800">
          {displayValue}
        </span>
        <span className="mt-0.5 text-[9px] font-medium text-slate-500">Score</span>
      </div>
    </div>
  );
}

function ProgressBar({ label, value, color }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="font-bold tabular-nums text-slate-800">{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function CardHeaderIcon({ reportId }) {
  if (reportId === "audit") return <FileStack size={18} strokeWidth={2} />;
  if (reportId === "dataset") return <Database size={18} strokeWidth={2} />;
  return <BarChart3 size={18} strokeWidth={2} />;
}

function MetricIcon({ metricKey, value }) {
  const num = Number(value);
  if (metricKey === "errors" && num === 0) {
    return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  }
  if (metricKey === "warnings" && num > 0) {
    return <AlertTriangle className="h-4 w-4 text-amber-500" />;
  }
  if (metricKey === "warnings") {
    return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  }
  if (metricKey === "files") return <FileStack className="h-4 w-4 text-blue-500" />;
  if (metricKey === "datasets") return <Database className="h-4 w-4 text-emerald-500" />;
  if (metricKey === "validation") return <Search className="h-4 w-4 text-emerald-500" />;
  if (metricKey === "schema") return <Shield className="h-4 w-4 text-emerald-500" />;
  if (metricKey === "overall") return <Gauge className="h-4 w-4 text-amber-500" />;
  if (metricKey === "security") return <Shield className="h-4 w-4 text-emerald-500" />;
  if (metricKey === "performance") return <Gauge className="h-4 w-4 text-amber-500" />;
  return <Gauge className="h-4 w-4 text-slate-400" />;
}

export default function ReportCard({ report, index, onView, onDownload }) {
  const theme = THEMES[report.theme] || THEMES.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className={`flex flex-col rounded-2xl border p-5 shadow-sm lg:p-6 ${theme.card}`}
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1 sm:pr-2">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${theme.iconWrap}`}>
              <CardHeaderIcon reportId={report.id} />
            </div>
            <h3 className="min-w-0 text-lg font-bold text-slate-800">{report.title}</h3>
            {report.id !== "benchmark" ? (
              <BadgeCheck className="h-5 w-5 shrink-0 text-blue-500" strokeWidth={2} />
            ) : (
              <Settings2 className="h-4 w-4 shrink-0 text-amber-500" />
            )}
          </div>
          <p className="text-sm leading-relaxed text-slate-500">{report.description}</p>
        </div>
        <div className="flex shrink-0 justify-end sm:justify-start">
          <ScoreGauge value={report.score} color={theme.gauge} />
        </div>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-2">
        {report.metrics.map((metric) => (
          <div
            key={metric.key}
            className={`rounded-xl border border-white/80 px-2 py-3 text-center shadow-sm ${theme.metricBg}`}
          >
            <div className="mb-1 flex justify-center">
              <MetricIcon metricKey={metric.key} value={metric.value} />
            </div>
            <p className="text-sm font-bold text-slate-800">{metric.value}</p>
            <p className="mt-0.5 text-[10px] leading-tight text-slate-500">{metric.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 space-y-3">
        {report.progressBars.map((bar) => (
          <ProgressBar key={bar.label} label={bar.label} value={bar.value} color={bar.color} />
        ))}
      </div>

      <div className="mt-auto flex gap-3">
        <button
          type="button"
          onClick={() => onView(report.id)}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <Eye size={16} />
          View Report
        </button>
        <button
          type="button"
          onClick={() => onDownload(report.id)}
          className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r py-2.5 text-sm font-semibold text-white shadow-md transition ${theme.download}`}
        >
          <Download size={16} />
          Download PDF
        </button>
      </div>
    </motion.div>
  );
}
