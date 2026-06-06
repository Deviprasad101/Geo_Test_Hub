from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.project import Project
from app.models.project_file import ProjectFile
from app.models.validation_job import ValidationJob


class ProjectRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, project_id: UUID, owner_id: UUID) -> Project | None:
        result = await self.db.execute(
            select(Project)
            .where(Project.id == project_id, Project.owner_id == owner_id)
            .options(
                selectinload(Project.files),
                selectinload(Project.validation_jobs).selectinload(ValidationJob.result),
            )
        )
        return result.scalar_one_or_none()

    async def list_by_owner(self, owner_id: UUID) -> list[Project]:
        result = await self.db.execute(
            select(Project)
            .where(Project.owner_id == owner_id)
            .order_by(Project.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_counts(self, project_id: UUID) -> tuple[int, int]:
        file_count = await self.db.scalar(
            select(func.count()).select_from(ProjectFile).where(ProjectFile.project_id == project_id)
        )
        job_count = await self.db.scalar(
            select(func.count()).select_from(ValidationJob).where(ValidationJob.project_id == project_id)
        )
        return file_count or 0, job_count or 0

    async def create(self, name: str, description: str | None, owner_id: UUID) -> Project:
        project = Project(name=name, description=description, owner_id=owner_id)
        self.db.add(project)
        await self.db.flush()
        await self.db.refresh(project)
        return project

    async def update(self, project: Project, name: str | None, description: str | None) -> Project:
        if name is not None:
            project.name = name
        if description is not None:
            project.description = description
        await self.db.flush()
        await self.db.refresh(project)
        return project

    async def delete(self, project: Project) -> None:
        await self.db.delete(project)
