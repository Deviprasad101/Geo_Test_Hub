import { motion } from "framer-motion";

export default function AnalysisCard({
  title,
  icon: Icon,
  children,
  delay = 0,
  className = "",
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`glass-card p-6 hover:shadow-card-hover transition-shadow ${className}`}
    >
      <div className="mb-4 flex items-center gap-3">
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-primary">
            <Icon size={20} />
          </div>
        )}
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}
