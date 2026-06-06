from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.job_repository import JobRepository
from app.repositories.project_repository import ProjectRepository
from app.repositories.report_repository import ReportRepository
from app.schemas.report import DashboardStats, ReportJSON, ReportResponse


class ReportService:
    def __init__(self, db: AsyncSession):
        self.repo = ReportRepository(db)
        self.job_repo = JobRepository(db)
        self.project_repo = ProjectRepository(db)

    async def get_report(self, report_id: UUID, user: User) -> ReportResponse:
        result = await self.repo.get_by_id(report_id)
        if not result:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

        job = result.job
        project = await self.project_repo.get_by_id(job.project_id, user.id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

        return ReportResponse(
            id=result.id,
            job_id=result.job_id,
            report=ReportJSON.model_validate(result.report_json),
            total_issues=result.total_issues,
            critical_count=result.critical_count,
            high_count=result.high_count,
            medium_count=result.medium_count,
            low_count=result.low_count,
            created_at=result.created_at,
        )

    async def get_report_by_job(self, job_id: UUID, user: User) -> ReportResponse:
        job = await self.job_repo.get_by_id(job_id)
        if not job:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

        project = await self.project_repo.get_by_id(job.project_id, user.id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

        result = await self.repo.get_by_job_id(job_id)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Report not yet available",
            )

        return ReportResponse(
            id=result.id,
            job_id=result.job_id,
            report=ReportJSON.model_validate(result.report_json),
            total_issues=result.total_issues,
            critical_count=result.critical_count,
            high_count=result.high_count,
            medium_count=result.medium_count,
            low_count=result.low_count,
            created_at=result.created_at,
        )

    async def get_dashboard_stats(self, user: User) -> DashboardStats:
        projects = await self.project_repo.list_by_owner(user.id)
        status_counts = await self.job_repo.count_by_status(user.id)
        recent = await self.repo.list_recent(user.id, limit=5)

        recent_reports = []
        for result in recent:
            recent_reports.append(
                ReportResponse(
                    id=result.id,
                    job_id=result.job_id,
                    report=ReportJSON.model_validate(result.report_json),
                    total_issues=result.total_issues,
                    critical_count=result.critical_count,
                    high_count=result.high_count,
                    medium_count=result.medium_count,
                    low_count=result.low_count,
                    created_at=result.created_at,
                )
            )

        total_jobs = sum(status_counts.values())
        return DashboardStats(
            total_projects=len(projects),
            total_jobs=total_jobs,
            pending_jobs=status_counts.get("pending", 0),
            running_jobs=status_counts.get("running", 0),
            completed_jobs=status_counts.get("completed", 0),
            failed_jobs=status_counts.get("failed", 0),
            recent_reports=recent_reports,
        )
