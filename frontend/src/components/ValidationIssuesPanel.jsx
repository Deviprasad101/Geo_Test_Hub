import { motion } from "framer-motion";
import { AlertCircle, AlertTriangle, FileWarning, Info, MapPin } from "lucide-react";

const SEVERITY_STYLES = {
  Critical: {
    badge: "bg-red-100 text-red-700 border-red-200",
    border: "border-red-100",
    icon: AlertCircle,
    iconClass: "text-red-500",
  },
  High: {
    badge: "bg-red-50 text-red-600 border-red-100",
    border: "border-red-100",
    icon: AlertCircle,
    iconClass: "text-red-500",
  },
  Medium: {
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    border: "border-amber-100",
    icon: AlertTriangle,
    iconClass: "text-amber-500",
  },
  Low: {
    badge: "bg-blue-50 text-blue-700 border-blue-100",
    border: "border-blue-100",
    icon: Info,
    iconClass: "text-blue-500",
  },
};

const ORDER = ["Critical", "High", "Medium", "Low"];

function severityStyle(severity) {
  return SEVERITY_STYLES[severity] || SEVERITY_STYLES.Medium;
}

export default function ValidationIssuesPanel({ issues, fileName, passed, errorCount = 0, warningCount = 0 }) {
  if (!issues?.length) return null;

  const grouped = ORDER.map((severity) => ({
    severity,
    items: issues.filter((issue) => issue.severity === severity),
  })).filter((group) => group.items.length > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`overflow-hidden rounded-2xl border shadow-sm ${
        passed ? "border-amber-200 bg-amber-50/40" : "border-red-200 bg-red-50/40"
      }`}
    >
      <div
        className={`flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4 ${
          passed ? "border-amber-100 bg-amber-50/80" : "border-red-100 bg-red-50/80"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              passed ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"
            }`}
          >
            <FileWarning size={20} />
          </div>
          <div>
            <h3 className={`text-base font-bold ${passed ? "text-amber-900" : "text-red-900"}`}>
              {passed ? "Validation warnings" : "Validation errors found"}
            </h3>
            <p className={`text-sm ${passed ? "text-amber-700" : "text-red-700"}`}>
              {fileName ? `${fileName} — ` : ""}
              {errorCount} error{errorCount !== 1 ? "s" : ""}, {warningCount} warning
              {warningCount !== 1 ? "s" : ""} ({issues.length} total issue
              {issues.length !== 1 ? "s" : ""})
            </p>
          </div>
        </div>
      </div>

      <div className="max-h-[420px] space-y-5 overflow-y-auto px-5 py-4">
        {grouped.map(({ severity, items }) => {
          const style = severityStyle(severity);
          const Icon = style.icon;
          return (
            <section key={severity}>
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${style.badge}`}
                >
                  {severity}
                </span>
                <span className="text-xs text-slate-500">
                  {items.length} issue{items.length !== 1 ? "s" : ""}
                </span>
              </div>
              <ul className="space-y-2">
                {items.map((issue) => (
                  <li
                    key={issue.id}
                    className={`rounded-xl border bg-white px-4 py-3 shadow-sm ${style.border}`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon size={18} className={`mt-0.5 shrink-0 ${style.iconClass}`} />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-800">{issue.title}</p>
                        {issue.description && (
                          <p className="mt-1 text-sm leading-relaxed text-slate-600">
                            {issue.description}
                          </p>
                        )}
                        {issue.geometry_reference && (
                          <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-1 font-mono text-xs text-slate-500">
                            <MapPin size={12} />
                            {issue.geometry_reference}
                          </p>
                        )}
                        {issue.file && (
                          <p className="mt-2 text-xs text-slate-400">File: {issue.file}</p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </motion.div>
  );
}
