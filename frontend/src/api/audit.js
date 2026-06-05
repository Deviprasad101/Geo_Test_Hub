const API_BASE = "";

async function parseJson(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.message || `Request failed (${res.status})`);
  }
  return data;
}

export function auditProjectName(zipFile, githubUrl) {
  if (zipFile?.name) {
    return zipFile.name.replace(/\.zip$/i, "") || "zip-upload";
  }
  const match = githubUrl?.trim().match(/github\.com\/[^/]+\/([^/.]+)/i);
  return match?.[1] || `github-audit-${Date.now()}`;
}

export async function createAuditProject(name, githubUrl) {
  const body = { name };
  if (githubUrl?.trim()) {
    body.github_url = githubUrl.trim();
  }
  const res = await fetch(`${API_BASE}/project/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  return parseJson(res);
}

export async function uploadAuditZip(projectId, zipFile) {
  const form = new FormData();
  form.append("project_id", String(projectId));
  form.append("zip_file", zipFile);
  const res = await fetch(`${API_BASE}/project/upload`, {
    method: "POST",
    credentials: "include",
    body: form,
  });
  return parseJson(res);
}

export async function importAuditGithub(projectId, githubUrl) {
  const res = await fetch(`${API_BASE}/project/github`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ project_id: projectId, github_url: githubUrl.trim() }),
  });
  return parseJson(res);
}

export async function runAudit({ zipFile, githubUrl }) {
  const name = auditProjectName(zipFile, githubUrl);
  const created = await createAuditProject(name, githubUrl);
  const projectId = created.project_id;

  if (zipFile) {
    return uploadAuditZip(projectId, zipFile);
  }
  return importAuditGithub(projectId, githubUrl);
}

export async function listAuditProjects() {
  const res = await fetch(`${API_BASE}/api/projects`, {
    credentials: "include",
  });
  const data = await parseJson(res);
  return data.projects || [];
}

export async function getAuditProject(projectId) {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}`, {
    credentials: "include",
  });
  const data = await parseJson(res);
  return data.project;
}

export async function loadAuditProjectResults(projectId) {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/scan`, {
    method: "POST",
    credentials: "include",
  });
  return parseJson(res);
}

export function formatAuditRepository(project) {
  if (project.github_url) {
    return project.github_url.replace(/^https?:\/\//i, "");
  }
  return "ZIP upload";
}

export function formatAuditDate(isoDate) {
  if (!isoDate) return "—";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatAuditStatus(status) {
  switch (status) {
    case "ready":
    case "uploaded":
      return { label: "Complete", tone: "success" };
    case "failed":
      return { label: "Failed", tone: "error" };
    case "processing":
    case "pending":
      return { label: "Pending", tone: "pending" };
    case "errors_found":
      return { label: "Issues Found", tone: "warning" };
    default:
      return { label: status || "Unknown", tone: "pending" };
  }
}
