import { motion } from "framer-motion";

export default function StatusDot({ running = false, complete = false, label }) {
  if (complete) {
    return (
      <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600">
        <span className="text-emerald-500">✓</span>
        {label || "Complete"}
      </span>
    );
  }

  if (running) {
    return (
      <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
        <motion.span
          className="h-2.5 w-2.5 rounded-full bg-emerald-500"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
        {label || "Running…"}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 text-sm text-slate-400">
      <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
      {label || "Pending"}
    </span>
  );
}
