import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createProject, importGithub, uploadZip } from "../api/client";
import AlertBox from "../components/AlertBox";

export default function CreateProject() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("zip");
  const [name, setName] = useState("");
  const [zipFile, setZipFile] = useState(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "" });

  const showError = (message) => setAlert({ message, type: "danger" });
  const showInfo = (message) => setAlert({ message, type: "info" });

  const getName = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      showError("Please enter a project name.");
      return null;
    }
    return trimmed;
  };

  const handleUploadZip = async () => {
    setAlert({ message: "", type: "" });
    const projectName = getName();
    if (!projectName) return;

    if (!zipFile) {
      showError("Please choose a .zip file.");
      return;
    }
    if (!zipFile.name.toLowerCase().endsWith(".zip")) {
      showError("Only .zip files are allowed.");
      return;
    }

    setLoading(true);
    try {
      const created = await createProject(projectName);
      showInfo("Project created. Uploading ZIP…");
      const result = await uploadZip(created.project_id, zipFile);
      const scan = result.scan || {};
      if (scan.error_count > 0) {
        showError(
          `Upload complete but ${scan.error_count} error(s) found. See project details.`
        );
      }
      navigate(result.redirect_path || `/projects/${created.project_id}`);
    } catch (err) {
      showError(err.message || "Upload failed.");
      setLoading(false);
    }
  };

  const handleImportGithub = async () => {
    setAlert({ message: "", type: "" });
    const projectName = getName();
    if (!projectName) return;

    const url = githubUrl.trim();
    if (!url) {
      showError("Please paste a GitHub repository URL.");
      return;
    }

    setLoading(true);
    try {
      const created = await createProject(projectName);
      showInfo("Project created. Cloning repository…");
      const result = await importGithub(created.project_id, url);
      const scan = result.scan || {};
      if (scan.error_count > 0) {
        showError(
          `Import complete but ${scan.error_count} error(s) found. See project details.`
        );
      }
      navigate(result.redirect_path || `/projects/${created.project_id}`);
    } catch (err) {
      showError(err.message || "Import failed.");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-header mb-4">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/">Dashboard</Link>
            </li>
            <li className="breadcrumb-item active">Create Project</li>
          </ol>
        </nav>
        <h1 className="page-title mb-1">Create Project</h1>
        <p className="page-subtitle mb-0">
          Name your project, then upload a ZIP or paste a GitHub URL
        </p>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card create-card shadow-sm">
            <div className="card-body p-4 p-lg-5">
              <AlertBox message={alert.message} type={alert.type} />

              <div className="mb-4">
                <label htmlFor="projectName" className="form-label fw-semibold">
                  Project name
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  id="projectName"
                  placeholder="e.g. Urban Flood Simulation"
                  maxLength={255}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <ul className="nav nav-tabs upload-tabs mb-4" role="tablist">
                <li className="nav-item" role="presentation">
                  <button
                    type="button"
                    className={`nav-link${tab === "zip" ? " active" : ""}`}
                    onClick={() => setTab("zip")}
                  >
                    <i className="bi bi-file-earmark-zip me-1" />
                    ZIP File
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    type="button"
                    className={`nav-link${tab === "github" ? " active" : ""}`}
                    onClick={() => setTab("github")}
                  >
                    <i className="bi bi-github me-1" />
                    GitHub URL
                  </button>
                </li>
              </ul>

              {tab === "zip" && (
                <div>
                  <label htmlFor="zipFile" className="form-label">
                    ZIP archive (max 200 MB)
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    id="zipFile"
                    accept=".zip,application/zip"
                    onChange={(e) => setZipFile(e.target.files?.[0] || null)}
                    disabled={loading}
                  />
                  <div className="form-text">
                    Project files will be extracted securely on the server.
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-lg w-100 mt-4"
                    onClick={handleUploadZip}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        />
                        Working…
                      </>
                    ) : (
                      <>
                        <i className="bi bi-cloud-upload me-1" />
                        Upload ZIP
                      </>
                    )}
                  </button>
                </div>
              )}

              {tab === "github" && (
                <div>
                  <label htmlFor="githubUrl" className="form-label">
                    Repository URL
                  </label>
                  <input
                    type="url"
                    className="form-control form-control-lg"
                    id="githubUrl"
                    placeholder="https://github.com/owner/repository"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    disabled={loading}
                  />
                  <div className="form-text">
                    Public repositories only. Git must be installed on the server.
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-lg w-100 mt-4"
                    onClick={handleImportGithub}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        />
                        Working…
                      </>
                    ) : (
                      <>
                        <i className="bi bi-git me-1" />
                        Import from GitHub
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
