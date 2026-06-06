import { gvip, pollJobUntilDone } from "./gvip";
import {
  adaptGvipReportToScan,
  deriveProjectStatus,
  flattenReportIssues,
  toAuditProject,
} from "./gvipAdapter";

export function auditProjectName(geoFile, projectName) {
  if (projectName?.trim()) return projectName.trim();
  if (geoFile?.name) {
    return geoFile.name.replace(/\.geojson$/i, "").replace(/\.json$/i, "") || "geojson-upload";
  }
  return `validation-${Date.now()}`;
}

async function getLatestJob(projectId) {
  const jobs = await gvip.projects.jobs(projectId);
  if (!jobs.length) return null;
  return jobs.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0];
}

async function loadProjectReport(projectId) {
  const project = await gvip.projects.get(projectId);
  const latestJob = await getLatestJob(projectId);

  if (!latestJob) {
    return {
      project: toAuditProject(project, null),
      scan: null,
    };
  }

  if (latestJob.status === "pending" || latestJob.status === "running") {
    return {
      project: toAuditProject(project, latestJob),
      scan: null,
      pending: true,
    };
  }

  if (latestJob.status === "failed") {
    throw new Error(latestJob.error_message || "Validation job failed.");
  }

  const report = latestJob.result_id
    ? await gvip.reports.get(latestJob.result_id)
    : await gvip.reports.byJob(latestJob.id);

  const files = await gvip.projects.files(projectId);
  const fileMeta = files.find((file) => file.id === latestJob.project_file_id) || files[0] || {};

  const adapted = adaptGvipReportToScan(report, project, fileMeta);
  adapted.project.status = deriveProjectStatus(project, latestJob);
  return adapted;
}

async function runValidation(projectId, uploadedFile) {
  let job;
  try {
    job = await gvip.jobs.create({
      project_id: projectId,
      project_file_id: uploadedFile.id,
    });
    job = await pollJobUntilDone(job.id);
  } catch (err) {
    const syncReport = await gvip.validators.validateSync(uploadedFile.id, projectId);
    const project = await gvip.projects.get(projectId);
    return adaptGvipReportToScan(syncReport, project, uploadedFile);
  }

  if (job.status === "failed") {
    try {
      const syncReport = await gvip.validators.validateSync(uploadedFile.id, projectId);
      const project = await gvip.projects.get(projectId);
      const adapted = adaptGvipReportToScan(syncReport, project, uploadedFile);
      adapted.project.status = deriveProjectStatus(project, {
        status: "completed",
        passed: syncReport.summary?.passed ?? false,
      });
      return adapted;
    } catch {
      throw new Error(job.error_message || "Validation job failed.");
    }
  }

  const report = job.result_id
    ? await gvip.reports.get(job.result_id)
    : await gvip.reports.byJob(job.id);
  const project = await gvip.projects.get(projectId);
  const adapted = adaptGvipReportToScan(report, project, uploadedFile);
  adapted.project.status = deriveProjectStatus(project, job);
  return adapted;
}

export async function createAuditProject(name, description) {
  const project = await gvip.projects.create({
    name,
    description: description?.trim() || undefined,
  });
  return { success: true, project_id: project.id, project };
}

export async function uploadAuditGeojson(projectId, geoFile) {
  const uploaded = await gvip.upload.geojson(projectId, geoFile);
  return { success: true, upload: uploaded };
}

export async function runAudit({ geoFile, projectName, description }) {
  const name = auditProjectName(geoFile, projectName);
  const fileLabel = geoFile?.name || description;
  const created = await createAuditProject(name, fileLabel);
  const uploaded = await uploadAuditGeojson(created.project_id, geoFile);
  return runValidation(created.project_id, uploaded.upload);
}

export function extractValidationIssues(scanSummary, fileName) {
  if (!scanSummary?.analysis) return [];

  const datasets = scanSummary.analysis.datasets || {};
  const code = scanSummary.analysis.code || {};
  const defaultFile =
    fileName ||
    datasets.file_details?.[0]?.name ||
    code.issues_by_file?.[0]?.file ||
    scanSummary.analysis.structure?.root_files?.[0] ||
    "uploaded file";

  const fromDatasets = (datasets.issues || []).map((issue, index) => ({
    id: `dataset-${index}`,
    file: defaultFile,
    severity: issue.severity || "Medium",
    title: issue.title || issue.message || "Validation issue",
    description: issue.description || issue.detail || "",
    geometry_reference: issue.geometry_reference || issue.line || null,
  }));

  if (fromDatasets.length > 0) return fromDatasets;

  return (code.issues_by_file || []).flatMap((entry, fileIndex) =>
    (entry.issues || [...(entry.errors || []), ...(entry.warnings || [])]).map(
      (issue, issueIndex) => ({
        id: `code-${fileIndex}-${issueIndex}`,
        file: entry.file || defaultFile,
        severity: issue.severity || "Medium",
        title: issue.message || issue.title || "Validation issue",
        description: issue.detail || issue.description || "",
        geometry_reference: issue.line && issue.line !== "—" ? issue.line : null,
      })
    )
  );
}

function auditDedupeKey(project) {
  if (project.description?.trim()) {
    return project.description.trim().toLowerCase();
  }
  return project.name.trim().toLowerCase();
}

function dedupeAuditProjects(projects) {
  const latestByFile = new Map();

  for (const project of projects) {
    const key = auditDedupeKey(project);
    const existing = latestByFile.get(key);
    if (
      !existing ||
      new Date(project.created_at).getTime() > new Date(existing.created_at).getTime()
    ) {
      latestByFile.set(key, project);
    }
  }

  return Array.from(latestByFile.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function listAuditProjects() {
  const projects = await gvip.projects.list();
  const withStatus = await Promise.all(
    projects.map(async (project) => {
      const latestJob = project.job_count > 0 ? await getLatestJob(project.id) : null;
      return toAuditProject(project, latestJob);
    })
  );
  return dedupeAuditProjects(withStatus);
}

export async function getAuditProject(projectId) {
  const project = await gvip.projects.get(projectId);
  const latestJob = await getLatestJob(projectId);
  return toAuditProject(project, latestJob);
}

export async function loadAuditProjectResults(projectId) {
  return loadProjectReport(projectId);
}

export async function getDashboardStats() {
  return gvip.reports.dashboard();
}

export async function listValidationIssues() {
  const dashboard = await getDashboardStats();
  return flattenReportIssues(dashboard.recent_reports || []);
}

export async function listDatasetFiles() {
  const projects = await gvip.projects.list();
  const rows = await Promise.all(
    projects.map(async (project) => {
      const files = await gvip.projects.files(project.id);
      return files.map((file) => ({
        id: file.id,
        name: file.original_filename || file.filename,
        records: file.feature_count ?? 0,
        status:
          file.feature_count === null
            ? "Warning"
            : file.feature_count > 0
              ? "Valid"
              : "Failed",
        lastUpdated: file.created_at,
        projectName: project.name,
      }));
    })
  );
  return rows.flat();
}

export function formatAuditRepository(project) {
  if (project.description?.trim()) return project.description.trim();
  if ((project.file_count ?? 0) > 0) return "GeoJSON validation";
  return "No files uploaded";
}

export function formatAuditDate(isoDate) {
  if (!isoDate) return "—";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatAuditStatus(status) {
  switch (status) {
    case "ready":
    case "uploaded":
    case "completed":
      return { label: "Complete", tone: "success" };
    case "failed":
      return { label: "Failed", tone: "error" };
    case "processing":
    case "pending":
    case "running":
      return { label: "Pending", tone: "pending" };
    case "errors_found":
      return { label: "Issues Found", tone: "warning" };
    default:
      return { label: status || "Unknown", tone: "pending" };
  }
}
