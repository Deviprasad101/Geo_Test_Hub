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
      },
      files: datasets.file_details || [],
      issues: datasets.issues || [],
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

function capitalizeStatus(status) {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function getReportCardMeta(bundle) {
  const { audit, dataset, benchmark } = bundle;
  return [
    {
      id: "audit",
      title: "Audit Report",
      description: "Full code and structure analysis summary",
      theme: "blue",
      metrics: [
        {
          key: "files",
          value: String(audit.summary.totalFiles ?? 0),
          label: "Files Scanned",
        },
        {
          key: "errors",
          value: String(audit.summary.syntaxErrors ?? 0),
          label: "Errors",
        },
        {
          key: "warnings",
          value: String(audit.summary.warnings ?? 0),
          label: "Warnings",
        },
      ],
    },
    {
      id: "dataset",
      title: "Dataset Report",
      description: "Validation results and schema coverage",
      theme: "purple",
      metrics: [
        {
          key: "datasets",
          value: String(dataset.summary.datasetCount ?? 0),
          label: "Datasets",
        },
        {
          key: "validation",
          value: capitalizeStatus(dataset.summary.validationStatus),
          label: "Validation",
        },
        {
          key: "schema",
          value: (dataset.summary.schemaCheck ?? "n/a").toUpperCase(),
          label: "Schema Check",
        },
      ],
    },
    {
      id: "benchmark",
      title: "Benchmark Report",
      description: "Performance and quality score breakdown",
      theme: "orange",
      metrics: [
        {
          key: "overall",
          value: `${benchmark.overall ?? 0} / 100`,
          label: "Overall Score",
        },
        {
          key: "security",
          value: String(benchmark.scores?.security ?? 0),
          label: "Security Score",
        },
        {
          key: "code",
          value: String(benchmark.scores?.codeQuality ?? 0),
          label: "Code Quality",
        },
      ],
    },
  ];
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
