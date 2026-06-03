"""Validation / scan errors found in uploaded projects."""
from extensions import db


class ProjectError(db.Model):
    __tablename__ = "project_errors"

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(
        db.Integer,
        db.ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    file_path = db.Column(db.String(512), nullable=False)
    line = db.Column(db.Integer, nullable=True)
    column = db.Column(db.Integer, nullable=True)
    severity = db.Column(db.String(16), nullable=False)  # error, warning, info
    rule_id = db.Column(db.String(64), nullable=True)
    message = db.Column(db.Text, nullable=False)

    project = db.relationship(
        "Project",
        backref=db.backref(
            "errors",
            lazy="dynamic",
            cascade="all, delete-orphan",
            order_by="ProjectError.file_path",
        ),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "project_id": self.project_id,
            "file_path": self.file_path,
            "line": self.line,
            "column": self.column,
            "severity": self.severity,
            "rule_id": self.rule_id,
            "message": self.message,
        }
