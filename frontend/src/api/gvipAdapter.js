function countSeverity(errors, severity) {
  return errors.filter((issue) => issue.severity === severity).length;
}

function normalizeReportPayload(reportData) {
  if (reportData?.report) {
    return {
      reportJson: reportData.report,
      counts: {
        critical: reportData.critical_count ?? 0,
        high: reportData.high_count ?? 0,
        medium: reportData.medium_count ?? 0,
        low: reportData.low_count ?? 0,
      },
    };
  }

  const reportJson = reportData;
  const errors = reportJson.errors || [];
  return {
    reportJson,
    counts: {
      critical: reportJson.statistics?.critical ?? countSeverity(errors, "Critical"),
      high: reportJson.statistics?.high ?? countSeverity(errors, "High"),
      medium: reportJson.statistics?.medium ?? countSeverity(errors, "Medium"),
      low: reportJson.statistics?.low ?? countSeverity(errors, "Low"),
    },
  };
}

export function adaptGvipReportToScan(reportData, project, fileMeta = {}) {
  const { reportJson, counts } = normalizeReportPayload(reportData);
  const summary = reportJson.summary || {};
  const statistics = reportJson.statistics || {};
  const errors = reportJson.errors || [];
  const filename =
    summary.original_filename || fileMeta.original_filename || fileMeta.filename || "upload.geojson";

  const errorCount = counts.critical + counts.high;
  const warningCount = counts.medium + counts.low;
  const passed = summary.passed ?? errorCount === 0;
  const validationStatus = passed
    ? "passed"
    : errorCount > 0
      ? "failed"
      : "warning";

  const mappedErrors = errors
    .filter((issue) => issue.severity === "Critical" || issue.severity === "High")
    .map((issue) => ({
      severity: issue.severity,
      line: issue.geometry_reference || "—",
      message: issue.title,
      detail: issue.description,
    }));
  const mappedWarnings = errors
    .filter((issue) => issue.severity === "Medium" || issue.severity === "Low")
    .map((issue) => ({
      severity: issue.severity,
      line: issue.geometry_reference || "—",
      message: issue.title,
      detail: issue.description,
    }));
  const issuesByFile = [
    {
      file: filename,
      errors: mappedErrors,
      warnings: mappedWarnings,
      issues: [...mappedErrors, ...mappedWarnings],
    },
  ];

  return {
    scan: {
      error_count: errorCount,
      warning_count: warningCount,
      total_count: summary.total_issues ?? errors.length,
      passed,
      analysis: {
        structure: {
          total_files: 1,
          total_folders: 0,
          file_type_count: 1,
          file_types: [{ type: "GeoJSON", count: 1 }],
          root_files: [filename],
        },
        code: {
          files_analyzed: 1,
          syntax_errors: errorCount,
          warnings: warningCount,
          issues_by_file: issuesByFile,
        },
        datasets: {
          validation_status: validationStatus,
          dataset_file_count: 1,
          schema_check: passed ? "valid" : "invalid",
          invalid_records: errorCount,
          missing_values: warningCount,
          file_details: [
            {
              path: filename,
              name: filename,
              size_bytes: fileMeta.file_size || 0,
              status: passed ? "valid" : errorCount > 0 ? "invalid" : "warning",
            },
          ],
          issues: errors.map((issue) => ({
            severity: issue.severity,
            title: issue.title,
            description: issue.description,
            geometry_reference: issue.geometry_reference,
          })),
          feature_count: statistics.feature_count ?? fileMeta.feature_count ?? null,
          rules_checked: reportJson.rules_checked || [],
        },
      },
    },
    project: {
      id: project.id,
      name: project.name,
      description: project.description,
      created_at: project.created_at,
      updated_at: project.updated_at,
      status: passed ? "ready" : "errors_found",
      file_count: project.file_count,
      job_count: project.job_count,
    },
  };
}

export function deriveProjectStatus(project, latestJob) {
  if (!latestJob) {
    if ((project.file_count ?? 0) === 0) return "pending";
    return "uploaded";
  }
  if (latestJob.status === "pending" || latestJob.status === "running") {
    return "processing";
  }
  if (latestJob.status === "failed") return "failed";
  if (latestJob.passed === false) return "errors_found";
  return "ready";
}

export function toAuditProject(project, latestJob) {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    created_at: project.created_at,
    updated_at: project.updated_at,
    status: deriveProjectStatus(project, latestJob),
    file_count: project.file_count,
    job_count: project.job_count,
  };
}

export function flattenReportIssues(reports) {
  return reports.flatMap((report) => {
    const filename = report.report?.summary?.original_filename || "GeoJSON file";
    return (report.report?.errors || []).map((issue, index) => ({
      id: `${report.id}-${index}`,
      severity: issue.severity,
      file: filename,
      description: issue.description || issue.title,
      status: issue.severity === "Critical" || issue.severity === "High" ? "Open" : "Review",
    }));
  });
}
