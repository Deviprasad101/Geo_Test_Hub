"""Rescan a project by id: python scripts/rescan_project.py 2"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from app import create_app
from extensions import db
from models.project import Project
from services.validation_service import validate_project_after_upload

project_id = int(sys.argv[1]) if len(sys.argv) > 1 else 2

app = create_app()
with app.app_context():
    project = db.session.get(Project, project_id)
    if not project:
        print(f"Project {project_id} not found")
        sys.exit(1)
    summary = validate_project_after_upload(project)
    print(f"Project {project_id}: status={project.status}")
    print(f"  errors={summary['error_count']} warnings={summary['warning_count']}")
    for issue in summary.get("issues", [])[:10]:
        print(f"  [{issue['severity']}] {issue['file_path']}: {issue['message']}")
