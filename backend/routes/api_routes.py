"""JSON API for the React frontend."""
from flask import Blueprint, jsonify

from models.project import Project
from services.project_service import cleanup_duplicate_audit_projects
from services.validation_service import validate_project_after_upload
from utils.auth import get_default_user_id

api_bp = Blueprint("api", __name__, url_prefix="/api")


@api_bp.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "geo-test-hub-api"})


@api_bp.route("/projects", methods=["GET"])
def list_projects():
    """List unique audit projects for the default user (one per repo or ZIP)."""
    user_id = get_default_user_id()
    cleanup_duplicate_audit_projects(user_id)
    projects = (
        Project.query.filter_by(user_id=user_id)
        .order_by(Project.created_at.desc())
        .all()
    )
    return jsonify({"success": True, "projects": [p.to_dict() for p in projects]})


@api_bp.route("/projects/<int:project_id>", methods=["GET"])
def get_project(project_id: int):
    """Single project by id."""
    user_id = get_default_user_id()
    project = Project.query.filter_by(id=project_id, user_id=user_id).first()
    if not project:
        return jsonify({"success": False, "error": "Project not found."}), 404
    return jsonify({"success": True, "project": project.to_dict(include_errors=True)})


@api_bp.route("/projects/<int:project_id>/scan", methods=["POST"])
def rescan_project(project_id: int):
    """Re-run error scan on an existing uploaded project."""
    user_id = get_default_user_id()
    project = Project.query.filter_by(id=project_id, user_id=user_id).first()
    if not project:
        return jsonify({"success": False, "error": "Project not found."}), 404

    if project.status == "pending":
        return jsonify(
            {"success": False, "error": "Project has no uploaded content yet."}
        ), 400

    scan_summary = validate_project_after_upload(project)
    return jsonify(
        {
            "success": True,
            "project": project.to_dict(include_errors=True),
            "scan": scan_summary,
        }
    )
