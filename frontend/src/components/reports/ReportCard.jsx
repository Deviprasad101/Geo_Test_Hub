import { motion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Code2,
  Database,
  Download,
  Eye,
  FileStack,
  Gauge,
  Search,
  Shield,
  TriangleAlert,
} from "lucide-react";

const THEMES = {
  blue: {
    card: "border-blue-100/80 bg-gradient-to-br from-blue-50/40 via-white to-white",
    iconWrap: "bg-blue-500 text-white shadow-md shadow-blue-500/25",
    illustBg: "from-blue-100/80 to-blue-50",
    metricIcon: "text-blue-500",
    download: "from-[#2563EB] to-[#3B82F6] shadow-blue-500/25 hover:from-[#1D4ED8] hover:to-[#2563EB]",
  },
  purple: {
    card: "border-violet-100/80 bg-gradient-to-br from-violet-50/40 via-white to-white",
    iconWrap: "bg-violet-500 text-white shadow-md shadow-violet-500/25",
    illustBg: "from-violet-100/80 to-violet-50",
    metricIcon: "text-violet-500",
    download: "from-[#7C3AED] to-[#8B5CF6] shadow-violet-500/25 hover:from-[#6D28D9] hover:to-[#7C3AED]",
  },
  orange: {
    card: "border-amber-100/80 bg-gradient-to-br from-amber-50/40 via-white to-white",
    iconWrap: "bg-amber-500 text-white shadow-md shadow-amber-500/25",
    illustBg: "from-amber-100/80 to-orange-50",
    metricIcon: "text-amber-500",
    download: "from-[#F59E0B] to-[#FBBF24] shadow-amber-500/25 hover:from-[#D97706] hover:to-[#F59E0B]",
  },
};

function MetricIcon({ metricKey, theme }) {
  const cls = `h-4 w-4 ${theme.metricIcon}`;
  switch (metricKey) {
    case "files":
      return <FileStack className={cls} />;
    case "errors":
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    case "warnings":
      return <TriangleAlert className="h-4 w-4 text-amber-500" />;
    case "validation":
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    case "overall":
      return <Gauge className={cls} />;
    case "security":
      return <Shield className="h-4 w-4 text-emerald-500" />;
    case "code":
      return <Code2 className={cls} />;
    case "datasets":
      return <Database className={cls} />;
    case "schema":
      return <Search className={cls} />;
    default:
      return <Gauge className={cls} />;
  }
}

function ReportIllustration({ reportId, themeKey }) {
  const theme = THEMES[themeKey];
  return (
    <div
      className={`relative flex h-20 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${theme.illustBg}`}
    >
      {reportId === "audit" && (
        <>
          <FileStack className="absolute left-3 top-4 h-8 w-8 text-blue-400/80" strokeWidth={1.5} />
          <Shield className="absolute bottom-3 right-3 h-7 w-7 text-blue-600" strokeWidth={1.75} />
        </>
      )}
      {reportId === "dataset" && (
        <>
          <Database className="absolute left-4 top-5 h-9 w-9 text-violet-400/90" strokeWidth={1.5} />
          <Search className="absolute bottom-3 right-3 h-6 w-6 text-violet-600" strokeWidth={2} />
        </>
      )}
      {reportId === "benchmark" && (
        <>
          <BarChart3 className="absolute left-3 top-4 h-8 w-8 text-amber-500/90" strokeWidth={1.5} />
          <div className="absolute bottom-4 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
            <span className="text-xs font-bold">↑</span>
          </div>
        </>
      )}
    </div>
  );
}

function CardHeaderIcon({ reportId }) {
  if (reportId === "audit") return <FileStack size={18} strokeWidth={2} />;
  if (reportId === "dataset") return <Database size={18} strokeWidth={2} />;
  return <BarChart3 size={18} strokeWidth={2} />;
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
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-3 flex items-center gap-2.5">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${theme.iconWrap}`}>
              <CardHeaderIcon reportId={report.id} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">{report.title}</h3>
          </div>
          <p className="text-sm leading-relaxed text-slate-500">{report.description}</p>
        </div>
        <ReportIllustration reportId={report.id} themeKey={report.theme} />
      </div>

      <div className="mb-6 grid grid-cols-3 gap-2">
        {report.metrics.map((metric) => (
          <div
            key={metric.key}
            className="rounded-xl border border-white/80 bg-white/90 px-2 py-3 text-center shadow-sm"
          >
            <div className="mb-1 flex justify-center">
              {metric.key === "errors" && Number(metric.value) === 0 ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : metric.key === "warnings" && Number(metric.value) > 0 ? (
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              ) : metric.key === "warnings" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : (
                <MetricIcon metricKey={metric.key} theme={theme} />
              )}
            </div>
            <p className="text-sm font-bold text-slate-800">{metric.value}</p>
            <p className="mt-0.5 text-[10px] leading-tight text-slate-500">{metric.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-auto flex gap-3">
        <button
          type="button"
          onClick={() => onView(report.id)}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <Eye size={16} />
          View
        </button>
        <button
          type="button"
          onClick={() => onDownload(report.id)}
          className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r py-2.5 text-sm font-semibold text-white shadow-md ${theme.download}`}
        >
          <Download size={16} />
          Download
        </button>
      </div>
    </motion.div>
  );
}
