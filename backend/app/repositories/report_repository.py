from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.validation_job import ValidationJob
from app.models.validation_result import ValidationResult


class ReportRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(
        self,
        job_id: UUID,
        report_json: dict,
        total_issues: int,
        critical_count: int,
        high_count: int,
        medium_count: int,
        low_count: int,
    ) -> ValidationResult:
        result = ValidationResult(
            job_id=job_id,
            report_json=report_json,
            total_issues=total_issues,
            critical_count=critical_count,
            high_count=high_count,
            medium_count=medium_count,
            low_count=low_count,
        )
        self.db.add(result)
        await self.db.flush()
        await self.db.refresh(result)
        return result

    async def get_by_id(self, result_id: UUID) -> ValidationResult | None:
        query = await self.db.execute(
            select(ValidationResult)
            .where(ValidationResult.id == result_id)
            .options(selectinload(ValidationResult.job))
        )
        return query.scalar_one_or_none()

    async def get_by_job_id(self, job_id: UUID) -> ValidationResult | None:
        result = await self.db.execute(
            select(ValidationResult).where(ValidationResult.job_id == job_id)
        )
        return result.scalar_one_or_none()

    async def list_recent(self, owner_id: UUID, limit: int = 5) -> list[ValidationResult]:
        from app.models.project import Project

        query = await self.db.execute(
            select(ValidationResult)
            .join(ValidationJob, ValidationResult.job_id == ValidationJob.id)
            .join(Project, ValidationJob.project_id == Project.id)
            .where(Project.owner_id == owner_id)
            .options(selectinload(ValidationResult.job))
            .order_by(ValidationResult.created_at.desc())
            .limit(limit)
        )
        return list(query.scalars().all())
