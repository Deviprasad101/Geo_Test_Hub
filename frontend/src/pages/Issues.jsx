import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Loader2 } from "lucide-react";
import { listValidationIssues } from "../api/audit";

const severityStyles = {
  Critical: "bg-red-100 text-red-700 border-red-200",
  High: "bg-orange-100 text-orange-700 border-orange-200",
  Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Low: "bg-blue-100 text-blue-700 border-blue-200",
};

export default function Issues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const rows = await listValidationIssues();
        if (!cancelled) setIssues(rows);
      } catch (err) {
        if (!cancelled) {
          setIssues([]);
          setError(err.message || "Could not load validation issues.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card overflow-hidden"
    >
      {error && (
        <div className="flex items-start gap-3 border-b border-red-100 bg-red-50 px-6 py-4 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-6 py-4">Severity</th>
              <th className="px-6 py-4">File</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                  <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-primary" />
                  Loading issues…
                </td>
              </tr>
            )}

            {!loading && !error && issues.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                  No validation issues yet. Run a GeoJSON validation on the New Audit page.
                </td>
              </tr>
            )}

            {!loading &&
              issues.map((row, i) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-slate-50 hover:bg-slate-50/80"
                >
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                        severityStyles[row.severity] || severityStyles.Low
                      }`}
                    >
                      {row.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-700">{row.file}</td>
                  <td className="px-6 py-4 text-slate-600">{row.description}</td>
                  <td className="px-6 py-4 text-slate-500">{row.status}</td>
                </motion.tr>
              ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
