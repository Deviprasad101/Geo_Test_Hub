import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, Eye, Loader2, RefreshCw } from "lucide-react";
import {
  formatAuditDate,
  formatAuditRepository,
  formatAuditStatus,
  listAuditProjects,
} from "../api/audit";

const STATUS_STYLES = {
  success: "bg-emerald-100 text-emerald-700",
  error: "bg-red-100 text-red-700",
  pending: "bg-amber-100 text-amber-700",
  warning: "bg-orange-100 text-orange-700",
};

const ROW_STYLES = [
  "bg-blue-50/60 hover:bg-blue-50",
  "bg-violet-50/50 hover:bg-violet-50/80",
  "bg-sky-50/50 hover:bg-sky-50/80",
  "bg-emerald-50/45 hover:bg-emerald-50/75",
  "bg-amber-50/45 hover:bg-amber-50/75",
  "bg-slate-50/60 hover:bg-slate-100",
];

export default function PastAudits() {
  const navigate = useNavigate();
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAudits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const projects = await listAuditProjects();
      setAudits(projects);
    } catch (err) {
      setAudits([]);
      setError(
        err.message ||
          "Could not load past audits. Start the backend on port 8000 and try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAudits();
  }, [loadAudits]);

  const handleView = (projectId) => {
    navigate("/audit/new", { state: { projectId } });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
    >
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-6 py-3">
        <p className="text-sm font-medium text-slate-600">
          {loading ? "Loading audits…" : `${audits.length} saved audit${audits.length === 1 ? "" : "s"}`}
        </p>
        <button
          type="button"
          onClick={loadAudits}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-white disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 border-b border-red-100 bg-red-50 px-6 py-4 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-6 py-4">Audit Name</th>
              <th className="px-6 py-4">Repository</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-primary" />
                  Loading past audits…
                </td>
              </tr>
            )}

            {!loading && !error && audits.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  No audits yet. Run an audit on the New Audit page and it will appear here.
                </td>
              </tr>
            )}

            {!loading &&
              audits.map((row, i) => {
                const status = formatAuditStatus(row.status);
                return (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`border-b border-slate-100/80 transition-colors ${ROW_STYLES[i % ROW_STYLES.length]}`}
                  >
                    <td className="px-6 py-4 font-medium text-slate-800">{row.name}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {formatAuditRepository(row)}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {formatAuditDate(row.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          STATUS_STYLES[status.tone]
                        }`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => handleView(row.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-primary hover:bg-white"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
