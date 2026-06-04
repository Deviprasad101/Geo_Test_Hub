import { motion } from "framer-motion";
import { Eye } from "lucide-react";
import { pastAudits } from "../data/mockData";

export default function PastAudits() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-6 py-4">Audit Name</th>
              <th className="px-6 py-4">Repository</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {pastAudits.map((row, i) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border-b border-slate-50 hover:bg-blue-50/30"
              >
                <td className="px-6 py-4 font-medium text-slate-800">{row.name}</td>
                <td className="px-6 py-4 text-slate-600">{row.repository}</td>
                <td className="px-6 py-4 text-slate-500">{row.date}</td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      row.status === "Complete"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-primary hover:bg-blue-50"
                  >
                    <Eye size={14} />
                    View
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
