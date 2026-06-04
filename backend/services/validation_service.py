"""Persist scan results and set project status."""
from extensions import db
from models.project import Project
from models.project_error import ProjectError
from services.project_scanner import ScanIssue, scan_project, summarize_scan


def clear_project_errors(project_id: int) -> None:
    ProjectError.query.filter_by(project_id=project_id).delete()


def save_scan_results(project: Project, issues: list[ScanIssue]) -> dict:
    """Store issues in DB and update project status."""
    clear_project_errors(project.id)

    for issue in issues:
        db.session.add(
            ProjectError(
                project_id=project.id,
                file_path=issue.file_path,
                line=issue.line,
                column=issue.column,
                severity=issue.severity,
                rule_id=issue.rule_id,
                message=issue.message,
            )
        )

    summary = summarize_scan(issues)
    if summary["error_count"] > 0:
        project.status = "failed"
    elif summary["warning_count"] > 0:
        project.status = "ready"
    else:
        project.status = "ready"

    db.session.commit()
    return summary


def validate_project_after_upload(project: Project) -> dict:
    """Scan project files and save errors. Returns summary + issues."""
    issues = scan_project(project.id)
    summary = save_scan_results(project, issues)
    return {
        **summary,
        "issues": [i.to_dict() for i in issues],
    }
