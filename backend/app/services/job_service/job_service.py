from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import inspect as sa_inspect
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.validation_job import JobStatus
from app.repositories.job_repository import JobRepository
from app.repositories.project_repository import ProjectRepository
from app.repositories.upload_repository import UploadRepository
from app.schemas.job import JobCreate, JobResponse
from app.workers.celery_worker import run_validation_task


class JobService:
    def __init__(self, db: AsyncSession):
        self.repo = JobRepository(db)
        self.project_repo = ProjectRepository(db)
        self.upload_repo = UploadRepository(db)

    async def create_job(self, data: JobCreate, user: User) -> JobResponse:
        project = await self.project_repo.get_by_id(data.project_id, user.id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

        project_file = await self.upload_repo.get_by_id(data.project_file_id, data.project_id)
        if not project_file:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project file not found")

        job = await self.repo.create(data.project_id, data.project_file_id)

        task = run_validation_task.delay(str(job.id))
        await self.repo.update_status(job, JobStatus.PENDING.value, celery_task_id=task.id)

        return self._to_response(job)

    async def get_job(self, job_id: UUID, user: User) -> JobResponse:
        job = await self.repo.get_by_id(job_id)
        if not job:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

        project = await self.project_repo.get_by_id(job.project_id, user.id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

        return self._to_response(job)

    async def list_project_jobs(self, project_id: UUID, user: User) -> list[JobResponse]:
        project = await self.project_repo.get_by_id(project_id, user.id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

        jobs = await self.repo.list_by_project(project_id)
        return [self._to_response(j) for j in jobs]

    def _to_response(self, job) -> JobResponse:
        resp = JobResponse.model_validate(job)
        if "result" not in sa_inspect(job).unloaded and job.result is not None:
            resp.result_id = job.result.id
            resp.total_issues = job.result.total_issues
            report_summary = job.result.report_json.get("summary", {})
            resp.passed = report_summary.get("passed")
        return resp
