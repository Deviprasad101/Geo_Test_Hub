from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class JobCreate(BaseModel):
    project_id: UUID
    project_file_id: UUID


class JobResponse(BaseModel):
    id: UUID
    project_id: UUID
    project_file_id: UUID
    status: str
    celery_task_id: str | None
    error_message: str | None
    started_at: datetime | None
    completed_at: datetime | None
    created_at: datetime
    updated_at: datetime
    result_id: UUID | None = None
    total_issues: int | None = None
    passed: bool | None = None

    model_config = {"from_attributes": True}
