import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Loader2 } from "lucide-react";
import { formatAuditDate, listDatasetFiles } from "../api/audit";

const statusClass = {
  Valid: "bg-emerald-100 text-emerald-700",
  Warning: "bg-amber-100 text-amber-700",
  Failed: "bg-red-100 text-red-700",
};

export default function Datasets() {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const rows = await listDatasetFiles();
        if (!cancelled) setDatasets(rows);
      } catch (err) {
        if (!cancelled) {
          setDatasets([]);
          setError(err.message || "Could not load dataset files.");
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
              <th className="px-6 py-4">Dataset Name</th>
              <th className="px-6 py-4">Project</th>
              <th className="px-6 py-4">Records</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-primary" />
                  Loading datasets…
                </td>
              </tr>
            )}

            {!loading && !error && datasets.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  No GeoJSON files uploaded yet.
                </td>
              </tr>
            )}

            {!loading &&
              datasets.map((row, i) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-slate-50 hover:bg-blue-50/20"
                >
                  <td className="px-6 py-4 font-medium text-slate-800">{row.name}</td>
                  <td className="px-6 py-4 text-slate-600">{row.projectName}</td>
                  <td className="px-6 py-4 text-slate-600">
                    {row.records.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        statusClass[row.status] || statusClass.Warning
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {formatAuditDate(row.lastUpdated)}
                  </td>
                </motion.tr>
              ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
