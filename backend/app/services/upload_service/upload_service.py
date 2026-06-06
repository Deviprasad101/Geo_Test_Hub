import json
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.models.user import User
from app.repositories.upload_repository import UploadRepository
from app.schemas.upload import UploadResponse

settings = get_settings()
ALLOWED_EXTENSIONS = {".geojson", ".json"}
ALLOWED_CONTENT_TYPES = {
    "application/geo+json",
    "application/json",
    "text/plain",
}


class UploadService:
    def __init__(self, db: AsyncSession):
        self.repo = UploadRepository(db)

    async def upload_geojson(
        self, project_id: uuid.UUID, file: UploadFile, user: User
    ) -> UploadResponse:
        project = await self.repo.get_project_for_owner(project_id, user.id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

        if not file.filename:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Filename required")

        ext = Path(file.filename).suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only GeoJSON files (.geojson, .json) are allowed",
            )

        content = await file.read()
        max_size = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        if len(content) > max_size:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File exceeds maximum size of {settings.MAX_UPLOAD_SIZE_MB}MB",
            )

        try:
            geojson_data = json.loads(content)
        except json.JSONDecodeError as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid JSON structure",
            ) from exc

        feature_count = self._count_features(geojson_data)

        storage_dir = Path(settings.STORAGE_PATH) / str(project_id)
        storage_dir.mkdir(parents=True, exist_ok=True)

        stored_filename = f"{uuid.uuid4()}{ext}"
        file_path = storage_dir / stored_filename
        file_path.write_bytes(content)

        project_file = await self.repo.create_file(
            project_id=project_id,
            filename=stored_filename,
            original_filename=file.filename,
            file_path=str(file_path),
            file_type="geojson",
            file_size=len(content),
            feature_count=feature_count,
        )

        return UploadResponse.model_validate(project_file)

    def _count_features(self, data: dict) -> int | None:
        if data.get("type") == "FeatureCollection":
            return len(data.get("features", []))
        if data.get("type") == "Feature":
            return 1
        return None
