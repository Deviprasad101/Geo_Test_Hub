import { motion } from "framer-motion";
import { issues } from "../data/mockData";

const severityStyles = {
  Critical: "bg-red-100 text-red-700 border-red-200",
  High: "bg-orange-100 text-orange-700 border-orange-200",
  Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Low: "bg-blue-100 text-blue-700 border-blue-200",
};

export default function Issues() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card overflow-hidden"
    >
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
            {issues.map((row, i) => (
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
                      severityStyles[row.severity]
                    }`}
                  >
                    {row.severity}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-slate-600">{row.file}</td>
                <td className="px-6 py-4 text-slate-700">{row.description}</td>
                <td className="px-6 py-4 text-slate-500">{row.status}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
