from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.project_repository import ProjectRepository
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate


class ProjectService:
    def __init__(self, db: AsyncSession):
        self.repo = ProjectRepository(db)

    async def create(self, data: ProjectCreate, user: User) -> ProjectResponse:
        project = await self.repo.create(data.name, data.description, user.id)
        return ProjectResponse.model_validate(project)

    async def list_projects(self, user: User) -> list[ProjectResponse]:
        projects = await self.repo.list_by_owner(user.id)
        responses = []
        for project in projects:
            file_count, job_count = await self.repo.get_counts(project.id)
            resp = ProjectResponse.model_validate(project)
            resp.file_count = file_count
            resp.job_count = job_count
            responses.append(resp)
        return responses

    async def get_project(self, project_id: UUID, user: User) -> ProjectResponse:
        project = await self.repo.get_by_id(project_id, user.id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        file_count, job_count = await self.repo.get_counts(project.id)
        resp = ProjectResponse.model_validate(project)
        resp.file_count = file_count
        resp.job_count = job_count
        return resp

    async def update(self, project_id: UUID, data: ProjectUpdate, user: User) -> ProjectResponse:
        project = await self.repo.get_by_id(project_id, user.id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        updated = await self.repo.update(project, data.name, data.description)
        file_count, job_count = await self.repo.get_counts(updated.id)
        resp = ProjectResponse.model_validate(updated)
        resp.file_count = file_count
        resp.job_count = job_count
        return resp

    async def delete(self, project_id: UUID, user: User) -> None:
        project = await self.repo.get_by_id(project_id, user.id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        await self.repo.delete(project)
