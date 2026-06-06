from uuid import UUID

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.report import DashboardStats, ReportResponse
from app.services.report_service import ReportService

router = APIRouter()


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ReportService(db)
    return await service.get_dashboard_stats(current_user)


@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(
    report_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ReportService(db)
    return await service.get_report(report_id, current_user)


@router.get("/job/{job_id}", response_model=ReportResponse)
async def get_report_by_job(
    job_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ReportService(db)
    return await service.get_report_by_job(job_id, current_user)


@router.get("/{report_id}/export")
async def export_report_json(
    report_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ReportService(db)
    report = await service.get_report(report_id, current_user)
    return JSONResponse(
        content=report.report.model_dump(mode="json"),
        headers={"Content-Disposition": f'attachment; filename="report-{report_id}.json"'},
    )
