import { motion } from "framer-motion";
import { datasets } from "../data/mockData";

const statusClass = {
  Valid: "bg-emerald-100 text-emerald-700",
  Warning: "bg-amber-100 text-amber-700",
  Failed: "bg-red-100 text-red-700",
};

export default function Datasets() {
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
              <th className="px-6 py-4">Dataset Name</th>
              <th className="px-6 py-4">Records</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {datasets.map((row, i) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="border-b border-slate-50 hover:bg-blue-50/20"
              >
                <td className="px-6 py-4 font-medium text-slate-800">{row.name}</td>
                <td className="px-6 py-4 text-slate-600">
                  {row.records.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      statusClass[row.status]
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500">{row.lastUpdated}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
