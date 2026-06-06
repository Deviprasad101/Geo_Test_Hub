import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import UUIDPrimaryKeyMixin


class ValidationResult(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "validation_results"

    job_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("validation_jobs.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    report_json: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    total_issues: Mapped[int] = mapped_column(default=0, nullable=False)
    critical_count: Mapped[int] = mapped_column(default=0, nullable=False)
    high_count: Mapped[int] = mapped_column(default=0, nullable=False)
    medium_count: Mapped[int] = mapped_column(default=0, nullable=False)
    low_count: Mapped[int] = mapped_column(default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    job = relationship("ValidationJob", back_populates="result")
