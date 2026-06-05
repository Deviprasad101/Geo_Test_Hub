import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  Calendar,
  Cpu,
  FileText,
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
  formatLastUpdated,
  getReportCardMeta,
  getReportSection,
} from "../lib/reportUtils";
import ReportCard from "../components/reports/ReportCard";
import ReportFeatureFooter from "../components/reports/ReportFeatureFooter";

function StatusBadge({ status }) {
  const isReady = status === "ready" || status === "uploaded";
  const isFailed = status === "failed";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        isReady
          ? "bg-emerald-50 text-emerald-700"
          : isFailed
            ? "bg-red-50 text-red-700"
            : "bg-amber-50 text-amber-700"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isReady ? "bg-emerald-500" : isFailed ? "bg-red-500" : "bg-amber-500"
        }`}
      />
      {status || "unknown"}
    </span>
  );
}

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
          "Could not load audits. Start the backend (python app.py in backend/) and try again."
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
  const viewData = viewReportId && bundle ? getReportSection(bundle, viewReportId) : null;
  const selectedProject = projects.find((p) => String(p.id) === selectedId);

  const handleDownload = (reportId) => {
    if (!bundle) return;
    const section = getReportSection(bundle, reportId);
    downloadReportPdf(reportId, section);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white px-5 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between lg:px-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white shadow-md shadow-blue-500/20">
            <FileText size={22} strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Report source</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Reports are generated from your saved audit results.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[240px] flex-1 sm:flex-none">
            <Calendar
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              disabled={loadingList || projects.length === 0}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-9 pr-4 text-sm font-medium text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              {projects.length === 0 ? (
                <option value="">No audits available</option>
              ) : (
                projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {formatAuditDate(p.created_at)}
                  </option>
                ))
              )}
            </select>
          </div>
          <button
            type="button"
            onClick={() => {
              loadProjects();
              if (selectedId) loadReport(selectedId);
            }}
            disabled={loadingList || loadingReport}
            className="inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-100 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loadingList || loadingReport ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
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

      {!loadingList && projects.length > 0 && selectedProject && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-slate-100 bg-white px-5 py-3 text-sm shadow-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <Github size={16} className="shrink-0 text-slate-500" />
            <span className="font-medium text-slate-500">Repository:</span>
            <span className="text-slate-700">{formatAuditRepository(selectedProject)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-500">Status:</span>
            <StatusBadge status={selectedProject.status} />
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <span className="font-medium text-slate-500">Last updated:</span>
            <span>{formatLastUpdated(bundle?.generatedAt || selectedProject.created_at)}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Cpu size={15} className="text-violet-500" />
            <span className="font-medium text-slate-500">Generated by:</span>
            <span className="font-medium text-slate-700">Geo Test Hub Engine</span>
          </div>
        </div>
      )}

      {!loadingList && projects.length > 0 && loadingReport && (
        <div className="flex items-center justify-center gap-2 py-12 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Generating reports…
        </div>
      )}

      {!loadingList && !loadingReport && bundle && (
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
      )}

      {!loadingList && projects.length > 0 && <ReportFeatureFooter />}

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
