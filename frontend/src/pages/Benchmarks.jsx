import { motion } from "framer-motion";
import { TrendingUp, Trophy } from "lucide-react";
import CircularProgress from "../components/CircularProgress";
import {
  benchmarkScores,
  benchmarkTrend,
  rankings,
} from "../data/mockData";

export default function Benchmarks() {
  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(benchmarkScores).map(([key, value], i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card flex flex-col items-center p-6"
          >
            <CircularProgress
              value={value}
              label={key.replace(/([A-Z])/g, " $1").trim()}
              color={["#2563EB", "#0EA5E9", "#10B981", "#8B5CF6"][i]}
            />
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-6"
        >
          <div className="mb-6 flex items-center gap-2">
            <TrendingUp className="text-primary" size={20} />
            <h3 className="font-semibold text-slate-800">Score Trend</h3>
          </div>
          <div className="flex h-48 items-end justify-between gap-2">
            {benchmarkTrend.map((point, i) => (
              <div key={point.month} className="flex flex-1 flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${point.score}%` }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-primary to-secondary"
                  style={{ maxHeight: "160px" }}
                />
                <span className="text-xs text-slate-500">{point.month}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-6"
        >
          <div className="mb-6 flex items-center gap-2">
            <Trophy className="text-amber-500" size={20} />
            <h3 className="font-semibold text-slate-800">Rankings</h3>
          </div>
          <ul className="space-y-3">
            {rankings.map((r) => (
              <li
                key={r.name}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    #{r.rank}
                  </span>
                  {r.name}
                </span>
                <span className="font-semibold text-slate-800">{r.score}%</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
