from pathlib import Path
from typing import Any

from app.models.validation_job import JobStatus
from app.validators.geojson_validator import GeoJSONValidator


class ValidationService:
    """Runs GeoJSON validation and builds the canonical report structure."""

    @staticmethod
    def validate_file(file_path: str) -> dict[str, Any]:
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"GeoJSON file not found: {file_path}")

        validator = GeoJSONValidator(str(path))
        return validator.validate()

    @staticmethod
    def build_persisted_report(
        raw_report: dict[str, Any],
        *,
        job_id: str,
        project_id: str,
        project_file_id: str,
        original_filename: str | None = None,
    ) -> dict[str, Any]:
        stats = raw_report["statistics"]
        summary = raw_report["summary"]

        return {
            "summary": {
                "job_id": job_id,
                "project_id": project_id,
                "project_file_id": project_file_id,
                "status": JobStatus.COMPLETED.value,
                "total_issues": summary["total_issues"],
                "passed": summary["passed"],
                "original_filename": original_filename,
            },
            "statistics": stats,
            "errors": raw_report["errors"],
            "rules_checked": [
                "Valid JSON structure",
                "FeatureCollection exists",
                "CRS validation",
                "Geometry validation",
                "Missing geometry detection",
                "Invalid coordinates",
                "Empty features",
                "Duplicate features",
                "Self-intersecting polygons",
            ],
        }
