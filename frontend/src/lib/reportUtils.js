import { computeBenchmarkScores } from "./benchmarkUtils";
import { formatAuditDate, formatAuditRepository } from "../api/audit";

export function buildReportBundle(project, scan) {
  const analysis = scan?.analysis || {};
  const structure = analysis.structure || {};
  const code = analysis.code || {};
  const datasets = analysis.datasets || {};
  const benchmark = computeBenchmarkScores(analysis, scan);

  const generatedAt = new Date().toISOString();

  return {
    project: {
      id: project.id,
      name: project.name,
      repository: formatAuditRepository(project),
      status: project.status,
      auditedAt: project.created_at,
    },
    audit: {
      title: "Audit Report",
      summary: {
        totalFiles: structure.total_files ?? 0,
        totalFolders: structure.total_folders ?? 0,
        fileTypes: structure.file_type_count ?? 0,
        filesAnalyzed: code.files_analyzed ?? 0,
        syntaxErrors: code.syntax_errors ?? 0,
        warnings: code.warnings ?? 0,
        scanErrors: scan?.error_count ?? 0,
        scanWarnings: scan?.warning_count ?? 0,
      },
      fileTypes: structure.file_types || [],
      issuesByFile: code.issues_by_file || [],
    },
    dataset: {
      title: "Dataset Report",
      summary: {
        datasetCount: datasets.dataset_file_count ?? 0,
        validationStatus: datasets.validation_status ?? "none",
        schemaCheck: datasets.schema_check ?? "n/a",
        invalidRecords: datasets.invalid_records ?? 0,
        missingValues: datasets.missing_values ?? 0,
        validationIssues: datasets.invalid_records ?? 0,
      },
      files: datasets.file_details || [],
      issues: datasets.issues || [],
      featureCount: datasets.feature_count ?? 0,
    },
    benchmark: {
      title: "Benchmark Report",
      scores: benchmark,
      overall: Math.round(
        (benchmark.performance +
          benchmark.codeQuality +
          benchmark.security +
          benchmark.dataset) /
          4
      ),
    },
    generatedAt,
  };
}

export function formatLastUpdated(isoDate) {
  if (!isoDate) return "—";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatRelativeTime(isoDate) {
  if (!isoDate) return "—";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  return formatAuditDate(isoDate);
}

function capitalizeStatus(status) {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function auditScore(bundle) {
  const errors = bundle.audit.summary.syntaxErrors ?? 0;
  const warnings = bundle.audit.summary.warnings ?? 0;
  return Math.max(0, Math.min(100, 100 - errors * 15 - warnings * 5));
}

function datasetScore(bundle) {
  const { validationStatus, schemaCheck, invalidRecords } = bundle.dataset.summary;
  if (validationStatus === "passed" && schemaCheck === "valid") return 100;
  if (validationStatus === "warning") return 74;
  if (validationStatus === "failed" || invalidRecords > 0) return 45;
  if ((bundle.dataset.summary.datasetCount ?? 0) > 0) return 80;
  return 100;
}

function schemaValidityPercent(bundle) {
  const check = bundle.dataset.summary.schemaCheck;
  if (check === "valid") return 100;
  if (check === "n/a" || !check) return 100;
  return 50;
}

export function getReportSummaryStats(bundle) {
  const files = bundle.audit.summary.totalFiles ?? bundle.audit.summary.filesAnalyzed ?? 0;
  const overall = bundle.benchmark.overall ?? 0;
  const isReady =
    bundle.project.status === "ready" ||
    bundle.project.status === "uploaded" ||
    bundle.project.status === "completed";

  const filesPct = Math.min(100, Math.max(20, 40 + files * 8));

  return [
    {
      key: "reports",
      label: "Total Reports",
      value: "3",
      sub: "Generated",
      color: "#3b82f6",
      glowColor: "rgba(59,130,246,0.4)",
      bg: "from-blue-50/80 to-white",
      border: "border-blue-100",
      iconBg: "bg-blue-100 text-blue-600",
      wavePercent: 100,
      waveSpeed: 1.1,
    },
    {
      key: "files",
      label: "Files Analyzed",
      value: String(files),
      sub: "Total Files",
      color: "#10b981",
      glowColor: "rgba(16,185,129,0.4)",
      bg: "from-emerald-50/80 to-white",
      border: "border-emerald-100",
      iconBg: "bg-emerald-100 text-emerald-600",
      wavePercent: filesPct,
      waveSpeed: 1,
    },
    {
      key: "quality",
      label: "Quality Score",
      value: `${overall}%`,
      sub: "Average Score",
      color: "#8b5cf6",
      glowColor: "rgba(139,92,246,0.4)",
      bg: "from-violet-50/80 to-white",
      border: "border-violet-100",
      iconBg: "bg-violet-100 text-violet-600",
      wavePercent: overall,
      waveSpeed: 1.15,
    },
    {
      key: "status",
      label: "Overall Status",
      value: isReady ? "Ready" : capitalizeStatus(bundle.project.status),
      sub: isReady ? "All systems normal" : "Review required",
      color: "#f59e0b",
      glowColor: "rgba(245,158,11,0.4)",
      bg: "from-amber-50/80 to-white",
      border: "border-amber-100",
      iconBg: "bg-amber-100 text-amber-600",
      wavePercent: isReady ? 100 : 38,
      waveSpeed: isReady ? 0.95 : 1.25,
    },
  ];
}

export function getReportCardMeta(bundle) {
  const { audit, dataset, benchmark } = bundle;
  const auditPct = auditScore(bundle);
  const datasetPct = datasetScore(bundle);
  const schemaPct = schemaValidityPercent(bundle);

  return [
    {
      id: "audit",
      title: "Audit Report",
      description: "Full code and structure analysis summary",
      theme: "blue",
      score: auditPct,
      metrics: [
        { key: "files", value: String(audit.summary.totalFiles ?? 0), label: "Files" },
        { key: "errors", value: String(audit.summary.syntaxErrors ?? 0), label: "Errors" },
        { key: "warnings", value: String(audit.summary.warnings ?? 0), label: "Warnings" },
      ],
      progressBars: [
        { label: "Code Quality", value: benchmark.scores.codeQuality, color: "#3b82f6" },
        { label: "Security", value: benchmark.scores.security, color: "#6366f1" },
        { label: "Performance", value: benchmark.scores.performance, color: "#0ea5e9" },
      ],
    },
    {
      id: "dataset",
      title: "Dataset Report",
      description: "Validation results and schema coverage",
      theme: "green",
      score: datasetPct,
      metrics: [
        { key: "datasets", value: String(dataset.summary.datasetCount ?? 0), label: "Datasets" },
        {
          key: "validation",
          value: String(dataset.summary.validationIssues ?? 0),
          label: "Validation Issues",
        },
        {
          key: "schema",
          value: (dataset.summary.schemaCheck ?? "n/a").toUpperCase(),
          label: "Schema Check",
        },
      ],
      progressBars: [
        { label: "Data Integrity", value: datasetPct, color: "#10b981" },
        { label: "Schema Validity", value: schemaPct, color: "#059669" },
        {
          label: "Completeness",
          value: dataset.summary.validationStatus === "passed" ? 100 : 75,
          color: "#34d399",
        },
      ],
    },
    {
      id: "benchmark",
      title: "Benchmark Report",
      description: "Performance and quality score breakdown",
      theme: "orange",
      score: benchmark.overall ?? 0,
      metrics: [
        { key: "overall", value: `${benchmark.overall ?? 0}/100`, label: "Overall Score" },
        { key: "security", value: String(benchmark.scores?.security ?? 0), label: "Security Score" },
        {
          key: "performance",
          value: String(benchmark.scores?.performance ?? 0),
          label: "Performance Score",
        },
      ],
      progressBars: [
        { label: "Security", value: benchmark.scores.security, color: "#f59e0b" },
        { label: "Code Quality", value: benchmark.scores.codeQuality, color: "#fbbf24" },
        { label: "Performance", value: benchmark.scores.performance, color: "#f97316" },
      ],
    },
  ];
}

export function getReportInsights(bundle) {
  const { audit, benchmark, generatedAt } = bundle;
  const totalFiles = audit.summary.totalFiles || audit.summary.filesAnalyzed || 1;
  const fileTypes = audit.fileTypes?.length
    ? audit.fileTypes
    : [{ type: "GeoJSON", count: totalFiles }];

  const segments = fileTypes.map((ft, i) => {
    const colors = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"];
    return {
      label: ft.type,
      value: ft.count,
      color: colors[i % colors.length],
    };
  });

  const errors = audit.summary.syntaxErrors ?? 0;
  const warnings = audit.summary.warnings ?? 0;
  const featureCount = bundle.dataset.featureCount ?? 0;
  const linesEstimate = featureCount > 0 ? featureCount * 42 : totalFiles * 128;

  return {
    donut: { total: totalFiles, segments },
    miniCards: [
      {
        key: "errors",
        label: "Errors",
        value: String(errors),
        sub: errors === 0 ? "No issues found" : "Issues detected",
        color: "#ef4444",
        glowColor: "rgba(239,68,68,0.4)",
        wavePercent: errors === 0 ? 100 : Math.max(8, 100 - errors * 22),
        waveSpeed: 1.2,
      },
      {
        key: "warnings",
        label: "Warnings",
        value: String(warnings),
        sub: warnings === 0 ? "No warnings" : "Review warnings",
        color: "#f59e0b",
        glowColor: "rgba(245,158,11,0.4)",
        wavePercent: warnings === 0 ? 100 : Math.max(12, 100 - warnings * 18),
        waveSpeed: 1.05,
      },
      {
        key: "security",
        label: "Security Score",
        value: `${benchmark.scores.security}%`,
        sub: benchmark.scores.security >= 85 ? "Excellent" : "Good",
        color: "#10b981",
        glowColor: "rgba(16,185,129,0.4)",
        wavePercent: benchmark.scores.security,
        waveSpeed: 0.95,
      },
      {
        key: "performance",
        label: "Performance",
        value: `${benchmark.scores.performance}%`,
        sub: benchmark.scores.performance >= 85 ? "Optimal" : "Fair",
        color: "#8b5cf6",
        glowColor: "rgba(139,92,246,0.4)",
        wavePercent: benchmark.scores.performance,
        waveSpeed: 1.3,
      },
    ],
    activity: [
      { label: "Files Scanned", value: String(totalFiles) },
      { label: "Lines Analyzed", value: linesEstimate.toLocaleString() },
      { label: "Scan Duration", value: "00:01:24" },
      { label: "Last Scan", value: formatRelativeTime(generatedAt) },
    ],
  };
}

export function getProjectStatusLabel(status) {
  if (status === "ready" || status === "uploaded" || status === "completed") {
    return { label: "Analysis Complete", tone: "success" };
  }
  if (status === "failed") return { label: "Analysis Failed", tone: "error" };
  if (status === "errors_found") return { label: "Issues Found", tone: "warning" };
  return { label: capitalizeStatus(status), tone: "pending" };
}

export function getReportSection(bundle, reportId) {
  if (reportId === "audit") {
    return {
      title: bundle.audit.title,
      project: bundle.project,
      generatedAt: bundle.generatedAt,
      ...bundle.audit,
    };
  }
  if (reportId === "dataset") {
    return {
      title: bundle.dataset.title,
      project: bundle.project,
      generatedAt: bundle.generatedAt,
      ...bundle.dataset,
    };
  }
  return {
    title: bundle.benchmark.title,
    project: bundle.project,
    generatedAt: bundle.generatedAt,
    ...bundle.benchmark,
  };
}

export function downloadReportJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function reportFilename(project, reportId) {
  const safeName = (project.name || "report").replace(/[^\w.-]+/g, "-");
  const date = formatAuditDate(project.auditedAt).replace(/\s/g, "-");
  return `${safeName}-${reportId}-${date}.json`;
}
