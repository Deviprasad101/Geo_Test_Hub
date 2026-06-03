/**
 * API client — talks to Flask backend (port 5000).
 * In dev, Vite proxies /api and /project when VITE_API_URL is unset.
 */
const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

function apiUrl(path) {
  return `${API_BASE}${path}`;
}

async function parseJson(response) {
  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(data.error || response.statusText || "Request failed");
  }
  return data;
}

export async function fetchProjects() {
  const res = await fetch(apiUrl("/api/projects"));
  const data = await parseJson(res);
  return data.projects;
}

export async function fetchProject(projectId) {
  const res = await fetch(apiUrl(`/api/projects/${projectId}`));
  const data = await parseJson(res);
  return data.project;
}

export async function rescanProject(projectId) {
  const res = await fetch(apiUrl(`/api/projects/${projectId}/scan`), {
    method: "POST",
  });
  return parseJson(res);
}

export async function createProject(name) {
  const res = await fetch(apiUrl("/project/create"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return parseJson(res);
}

export async function uploadZip(projectId, file) {
  const formData = new FormData();
  formData.append("project_id", String(projectId));
  formData.append("zip_file", file);

  const res = await fetch(apiUrl("/project/upload"), {
    method: "POST",
    body: formData,
  });
  return parseJson(res);
}

export async function importGithub(projectId, githubUrl) {
  const res = await fetch(apiUrl("/project/github"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ project_id: projectId, github_url: githubUrl }),
  });
  return parseJson(res);
}
