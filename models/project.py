"""Project model for ZIP / GitHub uploads."""
from datetime import datetime, timezone

from extensions import db

PROJECT_STATUSES = ("pending", "processing", "uploaded", "ready", "failed", "errors_found")


class Project(db.Model):
    __tablename__ = "projects"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    name = db.Column(db.String(255), nullable=False)
    github_url = db.Column(db.String(512), nullable=True)
    status = db.Column(db.String(32), default="pending", nullable=False)
    created_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user = db.relationship("User", backref=db.backref("projects", lazy=True))

    def to_dict(self, include_errors=False):
        data = {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "github_url": self.github_url,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_errors:
            errors = self.errors.all()
            data["error_count"] = sum(1 for e in errors if e.severity == "error")
            data["warning_count"] = sum(1 for e in errors if e.severity == "warning")
            data["errors"] = [e.to_dict() for e in errors]
        return data

    def __repr__(self):
        return f"<Project {self.id} {self.name!r}>"
