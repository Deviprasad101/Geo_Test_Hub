const API_BASE = import.meta.env.VITE_API_URL || "";
const TOKEN_KEY = "geoaudit_token";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

async function parseResponse(res) {
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data.detail;
    const message =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail.map((item) => item.msg).join(", ")
          : data.message || data.error || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

async function request(path, options = {}, token = getToken()) {
  const headers = { ...(options.headers || {}) };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE}/api/v1${path}`, {
    ...options,
    headers,
  });
  return parseResponse(res);
}

export async function healthCheck() {
  const res = await fetch(`${API_BASE}/health`);
  return parseResponse(res);
}

export const gvip = {
  auth: {
    register: (data) =>
      request("/auth/register", { method: "POST", body: JSON.stringify(data) }, null),
    login: (data) =>
      request("/auth/login", { method: "POST", body: JSON.stringify(data) }, null),
    me: () => request("/auth/me"),
  },
  projects: {
    list: () => request("/projects"),
    get: (id) => request(`/projects/${id}`),
    create: (data) =>
      request("/projects", { method: "POST", body: JSON.stringify(data) }),
    files: (id) => request(`/projects/${id}/files`),
    jobs: (id) => request(`/projects/${id}/jobs`),
  },
  upload: {
    geojson: (projectId, file) => {
      const form = new FormData();
      form.append("project_id", projectId);
      form.append("file", file);
      return request("/upload", { method: "POST", body: form });
    },
  },
  jobs: {
    create: (data) =>
      request("/jobs", { method: "POST", body: JSON.stringify(data) }),
    get: (id) => request(`/jobs/${id}`),
    status: (id) => request(`/jobs/${id}/status`),
  },
  reports: {
    get: (id) => request(`/reports/${id}`),
    byJob: (jobId) => request(`/reports/job/${jobId}`),
    dashboard: () => request("/reports/dashboard"),
    exportUrl: (id) => `${API_BASE}/api/v1/reports/${id}/export`,
  },
  validators: {
    validateSync: (projectFileId, projectId) =>
      request(
        `/validators/validate/${projectFileId}?project_id=${projectId}`,
        { method: "POST" }
      ),
  },
};

export async function pollJobUntilDone(jobId, { intervalMs = 2000, maxAttempts = 60 } = {}) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const job = await gvip.jobs.status(jobId);
    if (job.status === "completed" || job.status === "failed") {
      return job;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error("Validation timed out. Ensure Redis and the Celery worker are running.");
}
