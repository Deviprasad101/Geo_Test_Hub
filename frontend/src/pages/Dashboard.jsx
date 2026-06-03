import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProjects } from "../api/client";
import StatusBadge from "../components/StatusBadge";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchProjects();
        if (!cancelled) setProjects(list);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load projects.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <div className="page-header d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="page-title mb-1">Dashboard</h1>
          <p className="page-subtitle mb-0">Manage your geospatial test projects</p>
        </div>
        <Link to="/create" className="btn btn-primary btn-lg">
          <i className="bi bi-plus-lg me-1" />
          Create Project
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
          <div className="small mt-2">Is the Flask backend running on port 5000?</div>
        </div>
      )}

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      )}

      {!loading && !error && projects.length > 0 && (
        <div className="row g-4">
          {projects.map((project) => (
            <div key={project.id} className="col-md-6 col-lg-4">
              <article className="card project-card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h2 className="h5 card-title mb-0 text-truncate" title={project.name}>
                      {project.name}
                    </h2>
                    <StatusBadge status={project.status} />
                  </div>
                  {project.github_url ? (
                    <p className="card-text small text-muted mb-2 text-truncate">
                      <i className="bi bi-github me-1" />
                      {project.github_url}
                    </p>
                  ) : (
                    <p className="card-text small text-muted mb-2">
                      <i className="bi bi-file-earmark-zip me-1" />
                      ZIP upload
                    </p>
                  )}
                  <p className="card-text small text-muted mb-0">
                    <i className="bi bi-calendar3 me-1" />
                    {formatDate(project.created_at)}
                  </p>
                </div>
                <div className="card-footer bg-transparent border-0 pt-0">
                  <Link
                    to={`/projects/${project.id}`}
                    className="btn btn-outline-primary btn-sm w-100"
                  >
                    View details
                  </Link>
                </div>
              </article>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && projects.length === 0 && (
        <div className="empty-state card text-center py-5">
          <div className="card-body">
            <i className="bi bi-folder2-open display-4 text-muted mb-3" />
            <h2 className="h4">No projects yet</h2>
            <p className="text-muted mb-4">
              Upload a ZIP archive or import from GitHub to get started.
            </p>
            <Link to="/create" className="btn btn-primary">
              Create your first project
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
