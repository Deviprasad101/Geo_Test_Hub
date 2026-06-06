from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.upload import UploadResponse
from app.services.upload_service import UploadService

router = APIRouter()


@router.post("", response_model=UploadResponse, status_code=201)
async def upload_file(
    project_id: UUID = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = UploadService(db)
    return await service.upload_geojson(project_id, file, current_user)
