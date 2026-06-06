import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  Calendar,
  Github,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";
import {
  formatAuditDate,
  formatAuditRepository,
  listAuditProjects,
  loadAuditProjectResults,
} from "../api/audit";
import { downloadReportPdf } from "../lib/reportPdf";
import {
  buildReportBundle,
  getProjectStatusLabel,
  getReportCardMeta,
  getReportInsights,
  getReportSection,
  getReportSummaryStats,
} from "../lib/reportUtils";
import ReportCard from "../components/reports/ReportCard";
import ReportInsightsPanel from "../components/reports/ReportInsightsPanel";
import ReportSummaryCards from "../components/reports/ReportSummaryCards";

export default function Reports() {
  const [projects, setProjects] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [bundle, setBundle] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [error, setError] = useState(null);
  const [viewReportId, setViewReportId] = useState(null);

  const loadProjects = useCallback(async () => {
    setLoadingList(true);
    setError(null);
    try {
      const list = await listAuditProjects();
      const ready = list.filter((p) => p.status !== "pending" && p.status !== "processing");
      setProjects(ready);
      setSelectedId((prev) => {
        if (prev && ready.some((p) => String(p.id) === prev)) return prev;
        return ready[0] ? String(ready[0].id) : "";
      });
    } catch (err) {
      setProjects([]);
      setSelectedId("");
      setError(
        err.message ||
          "Could not load audits. Start the backend on port 8000 and try again."
      );
    } finally {
      setLoadingList(false);
    }
  }, []);

  const loadReport = useCallback(
    async (projectId) => {
      if (!projectId) {
        setBundle(null);
        return;
      }
      setLoadingReport(true);
      setError(null);
      try {
        const project = projects.find((p) => String(p.id) === String(projectId));
        const result = await loadAuditProjectResults(projectId);
        if (result.pending) {
          throw new Error("This validation is still running. Try again shortly.");
        }
        if (!result.scan) {
          throw new Error("No validation results available for this project yet.");
        }
        const projectData = result.project || project;
        setBundle(buildReportBundle(projectData, result.scan));
      } catch (err) {
        setBundle(null);
        setError(err.message || "Could not generate report for this audit.");
      } finally {
        setLoadingReport(false);
      }
    },
    [projects]
  );

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    if (selectedId) {
      loadReport(selectedId);
    } else {
      setBundle(null);
    }
  }, [selectedId, loadReport]);

  const cards = useMemo(() => (bundle ? getReportCardMeta(bundle) : []), [bundle]);
  const summaryStats = useMemo(() => (bundle ? getReportSummaryStats(bundle) : []), [bundle]);
  const insights = useMemo(() => (bundle ? getReportInsights(bundle) : null), [bundle]);
  const viewData = viewReportId && bundle ? getReportSection(bundle, viewReportId) : null;
  const selectedProject = projects.find((p) => String(p.id) === selectedId);
  const statusInfo = selectedProject ? getProjectStatusLabel(selectedProject.status) : null;

  const handleDownload = (reportId) => {
    if (!bundle) return;
    const section = getReportSection(bundle, reportId);
    downloadReportPdf(reportId, section);
  };

  const handleRefresh = () => {
    loadProjects();
    if (selectedId) loadReport(selectedId);
  };

  return (
    <div className="relative space-y-6">
      <div className="pointer-events-none absolute -left-20 -top-16 h-56 w-56 rounded-full bg-blue-200/30 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-violet-200/30 blur-3xl" />

      <div className="relative rounded-2xl border border-slate-100 bg-white/90 px-5 py-6 shadow-sm backdrop-blur-sm lg:px-8 lg:py-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-blue-700 via-violet-600 to-blue-600 bg-clip-text text-2xl font-bold text-transparent lg:text-3xl">
              Report Intelligence Center
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Generate, analyze, benchmark, and download professional reports.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[220px]">
              <Calendar
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                disabled={loadingList || projects.length === 0}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pl-9 pr-4 text-sm font-medium text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                {projects.length === 0 ? (
                  <option value="">No audits available</option>
                ) : (
                  projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {formatAuditDate(p.created_at)}
                    </option>
                  ))
                )}
              </select>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loadingList || loadingReport}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loadingList || loadingReport ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        {!loadingList && selectedProject && (
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <Github size={16} className="shrink-0 text-slate-500" />
              <span className="font-medium text-slate-500">Repository:</span>
              <span className="font-medium text-slate-700">
                {formatAuditRepository(selectedProject)}
              </span>
            </div>
            {statusInfo && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-500">Status:</span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                    statusInfo.tone === "success"
                      ? "bg-emerald-50 text-emerald-700"
                      : statusInfo.tone === "error"
                        ? "bg-red-50 text-red-700"
                        : statusInfo.tone === "warning"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      statusInfo.tone === "success"
                        ? "bg-emerald-500"
                        : statusInfo.tone === "error"
                          ? "bg-red-500"
                          : statusInfo.tone === "warning"
                            ? "bg-amber-500"
                            : "bg-slate-400"
                    }`}
                  />
                  {statusInfo.label}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {loadingList && (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Loading audits…
        </div>
      )}

      {!loadingList && projects.length === 0 && !error && (
        <div className="rounded-2xl border border-slate-100 bg-white px-6 py-14 text-center text-sm text-slate-500 shadow-sm">
          No completed audits yet. Run an audit on the New Audit page to generate reports.
        </div>
      )}

      {!loadingList && projects.length > 0 && loadingReport && (
        <div className="flex items-center justify-center gap-2 py-12 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Generating reports…
        </div>
      )}

      {!loadingList && !loadingReport && bundle && (
        <>
          <ReportSummaryCards stats={summaryStats} />

          <div className="grid gap-5 lg:grid-cols-3">
            {cards.map((report, i) => (
              <ReportCard
                key={report.id}
                report={report}
                index={i}
                onView={setViewReportId}
                onDownload={handleDownload}
              />
            ))}
          </div>

          {insights && <ReportInsightsPanel insights={insights} />}
        </>
      )}

      <AnimatePresence>
        {viewData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
            onClick={() => setViewReportId(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h3 className="font-semibold text-slate-800">{viewData.title}</h3>
                  <p className="text-xs text-slate-500">
                    {viewData.project?.name} · {formatAuditDate(viewData.project?.auditedAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewReportId(null)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>
              <pre className="max-h-[calc(85vh-4.5rem)] overflow-auto bg-slate-50 p-5 text-xs leading-relaxed text-slate-700">
                {JSON.stringify(viewData, null, 2)}
              </pre>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
