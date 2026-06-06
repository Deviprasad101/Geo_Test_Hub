from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.project import Project
from app.models.project_file import ProjectFile


class UploadRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_project_for_owner(self, project_id: UUID, owner_id: UUID) -> Project | None:
        result = await self.db.execute(
            select(Project).where(Project.id == project_id, Project.owner_id == owner_id)
        )
        return result.scalar_one_or_none()

    async def create_file(
        self,
        project_id: UUID,
        filename: str,
        original_filename: str,
        file_path: str,
        file_type: str,
        file_size: int,
        feature_count: int | None,
    ) -> ProjectFile:
        project_file = ProjectFile(
            project_id=project_id,
            filename=filename,
            original_filename=original_filename,
            file_path=file_path,
            file_type=file_type,
            file_size=file_size,
            feature_count=feature_count,
        )
        self.db.add(project_file)
        await self.db.flush()
        await self.db.refresh(project_file)
        return project_file

    async def list_by_project(self, project_id: UUID) -> list[ProjectFile]:
        result = await self.db.execute(
            select(ProjectFile)
            .where(ProjectFile.project_id == project_id)
            .order_by(ProjectFile.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_by_id(self, file_id: UUID, project_id: UUID) -> ProjectFile | None:
        result = await self.db.execute(
            select(ProjectFile).where(
                ProjectFile.id == file_id, ProjectFile.project_id == project_id
            )
        )
        return result.scalar_one_or_none()
