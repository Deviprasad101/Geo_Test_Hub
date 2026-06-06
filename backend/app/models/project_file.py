import uuid

from sqlalchemy import BigInteger, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin


class ProjectFile(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "project_files"

    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    filename: Mapped[str] = mapped_column(String(512), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(512), nullable=False)
    file_path: Mapped[str] = mapped_column(String(1024), nullable=False)
    file_type: Mapped[str] = mapped_column(String(50), nullable=False, default="geojson")
    file_size: Mapped[int] = mapped_column(BigInteger, nullable=False)
    feature_count: Mapped[int | None] = mapped_column(nullable=True)

    project = relationship("Project", back_populates="files")
    validation_jobs = relationship("ValidationJob", back_populates="project_file")
