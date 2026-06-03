import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchProject, rescanProject } from "../api/client";
import StatusBadge from "../components/StatusBadge";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function severityClass(severity) {
  if (severity === "error") return "text-danger";
  if (severity === "warning") return "text-warning";
  return "text-muted";
}

export default function ProjectDetail() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");

  const loadProject = async () => {
    const data = await fetchProject(projectId);
    setProject(data);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchProject(projectId);
        if (!cancelled) setProject(data);
      } catch (err) {
        if (!cancelled) setError(err.message || "Project not found.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const handleRescan = async () => {
    setScanning(true);
    setError("");
    try {
      const data = await rescanProject(projectId);
      setProject(data.project);
    } catch (err) {
      setError(err.message || "Scan failed.");
    } finally {
      setScanning(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="alert alert-danger">
        {error}
        <div className="mt-3">
          <Link to="/" className="btn btn-outline-secondary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const errors = project?.errors || [];
  const errorCount = project?.error_count ?? errors.filter((e) => e.severity === "error").length;
  const warningCount =
    project?.warning_count ?? errors.filter((e) => e.severity === "warning").length;

  return (
    <>
      <div className="page-header mb-4">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/">Dashboard</Link>
            </li>
            <li className="breadcrumb-item active">{project.name}</li>
          </ol>
        </nav>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-10">
          {error && (
            <div className="alert alert-danger mb-3" role="alert">
              {error}
            </div>
          )}

          <div className="card detail-card shadow-sm mb-4">
            <div className="card-body p-4 p-lg-5">
              <div className="d-flex flex-wrap align-items-center gap-2 mb-4">
                <h1 className="page-title mb-0">{project.name}</h1>
                <StatusBadge status={project.status} />
              </div>

              <dl className="row detail-list mb-0">
                <dt className="col-sm-4">Project ID</dt>
                <dd className="col-sm-8">
                  <code>#{project.id}</code>
                </dd>

                <dt className="col-sm-4">User ID</dt>
                <dd className="col-sm-8">
                  <code>{project.user_id}</code>
                </dd>

                <dt className="col-sm-4">Source</dt>
                <dd className="col-sm-8">
                  {project.github_url ? (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="bi bi-github me-1" />
                      {project.github_url}
                    </a>
                  ) : (
                    <span>
                      <i className="bi bi-file-earmark-zip me-1" />
                      ZIP upload
                    </span>
                  )}
                </dd>

                <dt className="col-sm-4">Status</dt>
                <dd className="col-sm-8">{project.status}</dd>

                <dt className="col-sm-4">Scan results</dt>
                <dd className="col-sm-8">
                  <span className="badge bg-danger me-1">{errorCount} errors</span>
                  <span className="badge bg-warning text-dark">{warningCount} warnings</span>
                </dd>

                <dt className="col-sm-4">Created</dt>
                <dd className="col-sm-8">{formatDate(project.created_at)}</dd>

                <dt className="col-sm-4">Storage path</dt>
                <dd className="col-sm-8">
                  <code className="small">uploads/projects/{project.id}/</code>
                </dd>
              </dl>

              <div className="d-flex flex-wrap gap-2 mt-4 pt-4 border-top">
                <Link to="/" className="btn btn-outline-secondary">
                  <i className="bi bi-arrow-left me-1" />
                  Back to Dashboard
                </Link>
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={handleRescan}
                  disabled={scanning}
                >
                  {scanning ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" />
                      Scanning…
                    </>
                  ) : (
                    <>
                      <i className="bi bi-search me-1" />
                      Scan for errors
                    </>
                  )}
                </button>
                {["pending", "failed"].includes(project.status) && (
                  <Link to="/create" className="btn btn-primary">
                    Try upload again
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h2 className="h5 mb-0">
                <i className="bi bi-bug me-2" />
                Issues found in project
              </h2>
            </div>
            <div className="card-body p-0">
              {errors.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  <i className="bi bi-check-circle text-success fs-3 d-block mb-2" />
                  No issues detected. Click &quot;Scan for errors&quot; to analyze files.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0 issues-table">
                    <thead>
                      <tr>
                        <th>Severity</th>
                        <th>File</th>
                        <th>Line</th>
                        <th>Rule</th>
                        <th>Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {errors.map((item) => (
                        <tr key={item.id}>
                          <td className={severityClass(item.severity)}>
                            <strong>{item.severity}</strong>
                          </td>
                          <td>
                            <code className="small">{item.file_path}</code>
                          </td>
                          <td>{item.line ?? "—"}</td>
                          <td>
                            <code className="small">{item.rule_id ?? "—"}</code>
                          </td>
                          <td>{item.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
