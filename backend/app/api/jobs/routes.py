from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.job import JobCreate, JobResponse
from app.services.job_service import JobService

router = APIRouter()


@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_validation_job(
    data: JobCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = JobService(db)
    return await service.create_job(data, current_user)


@router.get("/{job_id}", response_model=JobResponse)
async def get_validation_job(
    job_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = JobService(db)
    return await service.get_job(job_id, current_user)


@router.get("/{job_id}/status", response_model=JobResponse)
async def get_validation_job_status(
    job_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Poll job status until completed or failed."""
    service = JobService(db)
    return await service.get_job(job_id, current_user)
