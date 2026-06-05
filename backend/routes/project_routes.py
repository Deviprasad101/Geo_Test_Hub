"""Project create, upload, and GitHub import (JSON API only)."""
from flask import Blueprint, jsonify, request

from extensions import db
from models.project import Project
from services.project_service import (
    ProjectServiceError,
    cleanup_duplicate_audit_projects,
    clone_github_repo,
    find_existing_audit_project,
    project_directory,
    save_zip_upload,
    validate_github_url,
    validate_project_name,
    _clear_directory,
)
from services.validation_service import validate_project_after_upload
from utils.auth import get_default_user_id

project_bp = Blueprint("project", __name__, url_prefix="/project")


def _json_error(message: str, status_code: int = 400):
    return jsonify({"success": False, "error": message}), status_code


def _frontend_project_path(project_id: int) -> str:
    return f"/projects/{project_id}"


def _get_owned_project(project_id: int):
    user_id = get_default_user_id()
    return Project.query.filter_by(id=project_id, user_id=user_id).first()


@project_bp.route("/create", methods=["POST"])
def create_project():
    """Create a project record. Body: JSON { name }."""
    data = request.get_json(silent=True) or {}
    try:
        name = validate_project_name(data.get("name"))
    except ProjectServiceError as exc:
        return _json_error(exc.message, exc.status_code)

    user_id = get_default_user_id()
    github_url = (data.get("github_url") or "").strip() or None

    cleanup_duplicate_audit_projects(user_id)

    existing = find_existing_audit_project(
        user_id, name=name, github_url=github_url
    )
    if existing:
        return jsonify(
            {
                "success": True,
                "project_id": existing.id,
                "name": existing.name,
                "status": existing.status,
                "project": existing.to_dict(),
                "reused": True,
            }
        )

    stored_github_url = None
    if github_url:
        try:
            stored_github_url = validate_github_url(github_url)
        except ProjectServiceError:
            stored_github_url = None

    project = Project(
        user_id=user_id,
        name=name,
        status="pending",
        github_url=stored_github_url,
    )
    db.session.add(project)
    db.session.commit()

    return jsonify(
        {
            "success": True,
            "project_id": project.id,
            "name": project.name,
            "status": project.status,
            "project": project.to_dict(),
            "reused": False,
        }
    )


@project_bp.route("/upload", methods=["POST"])
def upload_zip():
    """Upload and extract ZIP. FormData: project_id, zip_file."""
    project_id = request.form.get("project_id", type=int)
    if not project_id:
        return _json_error("project_id is required.")

    project = _get_owned_project(project_id)
    if not project:
        return _json_error("Project not found.", 404)

    if project.status == "processing":
        return _json_error("Project is currently being processed.")

    zip_file = request.files.get("zip_file")
    should_replace = project.status != "pending" or project.github_url is not None

    project.status = "processing"
    project.github_url = None
    db.session.commit()

    try:
        if should_replace:
            _clear_directory(project_directory(project.id))
        save_zip_upload(project.id, zip_file)
        db.session.commit()
        scan_summary = validate_project_after_upload(project)
    except ProjectServiceError as exc:
        project.status = "failed"
        db.session.commit()
        return _json_error(exc.message, exc.status_code)
    except Exception:
        project.status = "failed"
        db.session.commit()
        raise

    return jsonify(
        {
            "success": True,
            "project_id": project.id,
            "status": project.status,
            "project": project.to_dict(include_errors=True),
            "scan": scan_summary,
            "redirect_path": _frontend_project_path(project.id),
        }
    )


@project_bp.route("/github", methods=["POST"])
def import_github():
    """Clone GitHub repo. Body: JSON { project_id, github_url }."""
    data = request.get_json(silent=True) or {}
    project_id = data.get("project_id")
    if not project_id:
        return _json_error("project_id is required.")

    project = _get_owned_project(int(project_id))
    if not project:
        return _json_error("Project not found.", 404)

    if project.status == "processing":
        return _json_error("Project is currently being processed.")

    try:
        github_url = validate_github_url(data.get("github_url"))
    except ProjectServiceError as exc:
        return _json_error(exc.message, exc.status_code)

    project.status = "processing"
    project.github_url = github_url
    db.session.commit()

    try:
        clone_github_repo(project.id, github_url)
        db.session.commit()
        scan_summary = validate_project_after_upload(project)
    except ProjectServiceError as exc:
        project.status = "failed"
        db.session.commit()
        return _json_error(exc.message, exc.status_code)
    except Exception:
        project.status = "failed"
        db.session.commit()
        raise

    return jsonify(
        {
            "success": True,
            "project_id": project.id,
            "status": project.status,
            "github_url": project.github_url,
            "project": project.to_dict(include_errors=True),
            "scan": scan_summary,
            "redirect_path": _frontend_project_path(project.id),
        }
    )
