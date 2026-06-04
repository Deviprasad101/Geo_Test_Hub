import { motion } from "framer-motion";
import { Download, Eye, FileBarChart } from "lucide-react";

const reports = [
  {
    id: 1,
    title: "Audit Report",
    description: "Full code and structure analysis summary",
    icon: FileBarChart,
  },
  {
    id: 2,
    title: "Dataset Report",
    description: "Validation results and schema coverage",
    icon: FileBarChart,
  },
  {
    id: 3,
    title: "Benchmark Report",
    description: "Performance and quality score breakdown",
    icon: FileBarChart,
  },
];

export default function Reports() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {reports.map((report, i) => (
        <motion.div
          key={report.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ y: -4 }}
          className="glass-card p-6"
        >
          <report.icon className="mb-4 h-10 w-10 text-primary" />
          <h3 className="mb-2 text-lg font-semibold text-slate-800">{report.title}</h3>
          <p className="mb-6 text-sm text-slate-500">{report.description}</p>
          <div className="flex gap-3">
            <button
              type="button"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Eye size={16} />
              View
            </button>
            <button
              type="button"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Download size={16} />
              Download
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
