import uuid
from datetime import UTC, datetime

from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker

from app.core.config import get_settings
from app.models.project_file import ProjectFile
from app.models.validation_job import JobStatus, ValidationJob
from app.models.validation_result import ValidationResult
from app.services.validation_service import ValidationService
from app.workers.celery_worker.celery_app import celery_app

settings = get_settings()

sync_engine = create_engine(settings.DATABASE_URL_SYNC, pool_pre_ping=True)
SyncSession = sessionmaker(bind=sync_engine)


@celery_app.task(name="run_validation_task", bind=True)
def run_validation_task(self, job_id: str) -> dict:
    """Execute GeoJSON validation asynchronously and persist results."""
    job_uuid = uuid.UUID(job_id)

    with SyncSession() as db:
        job = db.execute(
            select(ValidationJob).where(ValidationJob.id == job_uuid)
        ).scalar_one_or_none()

        if not job:
            return {"status": "error", "message": "Job not found"}

        job.status = JobStatus.RUNNING.value
        job.started_at = datetime.now(UTC)
        job.celery_task_id = self.request.id
        db.commit()

        try:
            project_file = db.execute(
                select(ProjectFile).where(ProjectFile.id == job.project_file_id)
            ).scalar_one_or_none()

            if not project_file:
                raise ValueError("Project file not found")

            raw_report = ValidationService.validate_file(project_file.file_path)
            full_report = ValidationService.build_persisted_report(
                raw_report,
                job_id=str(job.id),
                project_id=str(job.project_id),
                project_file_id=str(job.project_file_id),
                original_filename=project_file.original_filename,
            )

            stats = full_report["statistics"]
            total_issues = full_report["summary"]["total_issues"]

            existing = db.execute(
                select(ValidationResult).where(ValidationResult.job_id == job.id)
            ).scalar_one_or_none()

            if existing:
                result = existing
                result.report_json = full_report
                result.total_issues = total_issues
                result.critical_count = stats["critical"]
                result.high_count = stats["high"]
                result.medium_count = stats["medium"]
                result.low_count = stats["low"]
            else:
                result = ValidationResult(
                    job_id=job.id,
                    report_json=full_report,
                    total_issues=total_issues,
                    critical_count=stats["critical"],
                    high_count=stats["high"],
                    medium_count=stats["medium"],
                    low_count=stats["low"],
                )
                db.add(result)

            job.status = JobStatus.COMPLETED.value
            job.completed_at = datetime.now(UTC)
            job.error_message = None
            db.commit()
            db.refresh(result)

            return {
                "status": "completed",
                "job_id": job_id,
                "result_id": str(result.id),
                "total_issues": total_issues,
                "passed": full_report["summary"]["passed"],
            }

        except Exception as exc:
            job.status = JobStatus.FAILED.value
            job.completed_at = datetime.now(UTC)
            job.error_message = str(exc)
            db.commit()
            return {"status": "failed", "job_id": job_id, "error": str(exc)}
