"""Sync validation endpoint for testing (primary flow uses Celery)."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.repositories.upload_repository import UploadRepository
from app.services.validation_service import ValidationService

router = APIRouter()


@router.post("/validate/{project_file_id}")
async def validate_file_sync(
    project_file_id: UUID,
    project_id: UUID = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Run validation synchronously (dev/testing). Production uses POST /jobs."""
    upload_repo = UploadRepository(db)
    project = await upload_repo.get_project_for_owner(project_id, current_user.id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    project_file = await upload_repo.get_by_id(project_file_id, project_id)
    if not project_file:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    try:
        report = ValidationService.validate_file(project_file.file_path)
        return ValidationService.build_persisted_report(
            report,
            job_id="sync",
            project_id=str(project_id),
            project_file_id=str(project_file_id),
            original_filename=project_file.original_filename,
        )
    except FileNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
