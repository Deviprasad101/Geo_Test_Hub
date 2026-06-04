import { useState } from "react";
import { motion } from "framer-motion";
import { Pencil } from "lucide-react";
import { rules as initialRules } from "../data/mockData";

export default function Rules() {
  const [rules, setRules] = useState(initialRules);

  const toggle = (id) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

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
              <th className="px-6 py-4">Rule Name</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((row) => (
              <tr key={row.id} className="border-b border-slate-50">
                <td className="px-6 py-4 font-medium text-slate-800">{row.name}</td>
                <td className="px-6 py-4">
                  <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                    {row.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={row.enabled}
                    onClick={() => toggle(row.id)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      row.enabled ? "bg-primary" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        row.enabled ? "left-5" : "left-0.5"
                      }`}
                    />
                  </button>
                </td>
                <td className="px-6 py-4">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
