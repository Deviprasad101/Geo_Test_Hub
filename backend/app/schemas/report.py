from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, Field


class SeverityLevel(str, Enum):
    CRITICAL = "Critical"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


class ValidationIssue(BaseModel):
    id: str
    severity: SeverityLevel
    title: str
    description: str
    geometry_reference: str | None = None
    detected_at: datetime


class ReportSummary(BaseModel):
    job_id: UUID
    project_id: UUID
    project_file_id: UUID
    status: str
    total_issues: int
    passed: bool
    original_filename: str | None = None


class ReportStatistics(BaseModel):
    critical: int = 0
    high: int = 0
    medium: int = 0
    low: int = 0
    feature_count: int | None = None
    validation_duration_ms: int | None = None


class ReportJSON(BaseModel):
    summary: ReportSummary
    statistics: ReportStatistics
    errors: list[ValidationIssue] = Field(default_factory=list)
    rules_checked: list[str] = Field(default_factory=list)


class ReportResponse(BaseModel):
    id: UUID
    job_id: UUID
    report: ReportJSON
    total_issues: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    created_at: datetime

    model_config = {"from_attributes": True}


class DashboardStats(BaseModel):
    total_projects: int
    total_jobs: int
    pending_jobs: int
    running_jobs: int
    completed_jobs: int
    failed_jobs: int
    recent_reports: list[ReportResponse]
