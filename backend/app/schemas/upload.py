from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class UploadResponse(BaseModel):
    id: UUID
    project_id: UUID
    filename: str
    original_filename: str
    file_type: str
    file_size: int
    feature_count: int | None
    created_at: datetime

    model_config = {"from_attributes": True}
