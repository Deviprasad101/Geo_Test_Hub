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

export async function createAuditProject(name) {
  const res = await fetch(`${API_BASE}/project/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name }),
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
  const created = await createAuditProject(name);
  const projectId = created.project_id;

  if (zipFile) {
    return uploadAuditZip(projectId, zipFile);
  }
  return importAuditGithub(projectId, githubUrl);
}
