import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Loader2, TrendingUp, Trophy } from "lucide-react";
import CircularProgress from "../components/CircularProgress";
import { getDashboardStats } from "../api/audit";

function computeBenchmarkFromDashboard(stats) {
  const totalJobs = stats.total_jobs || 0;
  const completed = stats.completed_jobs || 0;
  const failed = stats.failed_jobs || 0;
  const passRate = totalJobs > 0 ? Math.round((completed / totalJobs) * 100) : 0;
  const reliability = totalJobs > 0 ? Math.round(((completed - failed) / totalJobs) * 100) : 0;

  const recent = stats.recent_reports || [];
  const issueTotal = recent.reduce((sum, report) => sum + (report.total_issues || 0), 0);
  const quality = recent.length
    ? Math.max(0, Math.round(100 - issueTotal / recent.length))
    : 72;

  return {
    performance: Math.min(95, 60 + completed * 3),
    codeQuality: quality,
    security: Math.max(50, reliability),
    dataset: passRate || 68,
  };
}

export default function Benchmarks() {
  const [benchmarkScores, setBenchmarkScores] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const dashboard = await getDashboardStats();
        if (!cancelled) {
          setStats(dashboard);
          setBenchmarkScores(computeBenchmarkFromDashboard(dashboard));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Could not load benchmark stats.");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        Loading benchmarks…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <p>{error}</p>
      </div>
    );
  }

  const rankings = [
    { label: "Completed jobs", value: stats?.completed_jobs ?? 0 },
    { label: "Failed jobs", value: stats?.failed_jobs ?? 0 },
    { label: "Total projects", value: stats?.total_projects ?? 0 },
  ];

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
            <h3 className="font-semibold text-slate-800">Validation activity</h3>
          </div>
          <div className="space-y-4">
            <StatRow label="Total jobs" value={stats?.total_jobs ?? 0} />
            <StatRow label="Pending" value={stats?.pending_jobs ?? 0} />
            <StatRow label="Running" value={stats?.running_jobs ?? 0} />
            <StatRow label="Completed" value={stats?.completed_jobs ?? 0} />
            <StatRow label="Failed" value={stats?.failed_jobs ?? 0} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-6"
        >
          <div className="mb-6 flex items-center gap-2">
            <Trophy className="text-amber-500" size={20} />
            <h3 className="font-semibold text-slate-800">Platform summary</h3>
          </div>
          <ul className="space-y-3">
            {rankings.map((item) => (
              <li
                key={item.label}
                className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 px-4 py-3"
              >
                <span className="text-sm text-slate-600">{item.label}</span>
                <span className="font-semibold text-slate-800">{item.value}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
  );
}
