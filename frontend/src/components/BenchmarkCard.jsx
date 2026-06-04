import { motion } from "framer-motion";
import CircularProgress from "./CircularProgress";

export default function BenchmarkCard({ scores, visible }) {
  if (!visible) return null;

  const items = [
    { key: "performance", label: "Performance", value: scores.performance, color: "#2563EB" },
    { key: "codeQuality", label: "Code Quality", value: scores.codeQuality, color: "#0EA5E9" },
    { key: "security", label: "Security", value: scores.security, color: "#10B981" },
    { key: "dataset", label: "Dataset", value: scores.dataset, color: "#8B5CF6" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <h3 className="mb-6 text-lg font-semibold text-slate-800">Benchmarks</h3>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        {items.map((item, i) => (
          <motion.div
            key={item.key}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.15 }}
            className="flex justify-center"
          >
            <CircularProgress value={item.value} label={item.label} color={item.color} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
