from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.validation_job import JobStatus, ValidationJob


class JobRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, project_id: UUID, project_file_id: UUID) -> ValidationJob:
        job = ValidationJob(
            project_id=project_id,
            project_file_id=project_file_id,
            status=JobStatus.PENDING.value,
        )
        self.db.add(job)
        await self.db.flush()
        await self.db.refresh(job)
        return job

    async def get_by_id(self, job_id: UUID) -> ValidationJob | None:
        result = await self.db.execute(
            select(ValidationJob)
            .where(ValidationJob.id == job_id)
            .options(selectinload(ValidationJob.result))
        )
        return result.scalar_one_or_none()

    async def list_by_project(self, project_id: UUID) -> list[ValidationJob]:
        result = await self.db.execute(
            select(ValidationJob)
            .where(ValidationJob.project_id == project_id)
            .options(selectinload(ValidationJob.result))
            .order_by(ValidationJob.created_at.desc())
        )
        return list(result.scalars().all())

    async def list_by_owner(self, owner_id: UUID) -> list[ValidationJob]:
        from app.models.project import Project

        result = await self.db.execute(
            select(ValidationJob)
            .join(Project, ValidationJob.project_id == Project.id)
            .where(Project.owner_id == owner_id)
            .options(selectinload(ValidationJob.result))
            .order_by(ValidationJob.created_at.desc())
        )
        return list(result.scalars().all())

    async def count_by_status(self, owner_id: UUID) -> dict[str, int]:
        from app.models.project import Project

        statuses = [s.value for s in JobStatus]
        counts: dict[str, int] = {s: 0 for s in statuses}
        for status in statuses:
            count = await self.db.scalar(
                select(func.count())
                .select_from(ValidationJob)
                .join(Project, ValidationJob.project_id == Project.id)
                .where(Project.owner_id == owner_id, ValidationJob.status == status)
            )
            counts[status] = count or 0
        return counts

    async def update_status(
        self,
        job: ValidationJob,
        status: str,
        celery_task_id: str | None = None,
        error_message: str | None = None,
        started_at=None,
        completed_at=None,
    ) -> ValidationJob:
        job.status = status
        if celery_task_id is not None:
            job.celery_task_id = celery_task_id
        if error_message is not None:
            job.error_message = error_message
        if started_at is not None:
            job.started_at = started_at
        if completed_at is not None:
            job.completed_at = completed_at
        await self.db.flush()
        await self.db.refresh(job)
        return job
