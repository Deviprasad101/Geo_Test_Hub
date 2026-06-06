from fastapi import APIRouter

from app.api.auth.routes import router as auth_router
from app.api.jobs.routes import router as jobs_router
from app.api.projects.routes import router as projects_router
from app.api.reports.routes import router as reports_router
from app.api.uploads.routes import router as uploads_router
from app.api.validators.routes import router as validators_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(projects_router, prefix="/projects", tags=["Projects"])
api_router.include_router(uploads_router, prefix="/upload", tags=["Uploads"])
api_router.include_router(jobs_router, prefix="/jobs", tags=["Validation Jobs"])
api_router.include_router(reports_router, prefix="/reports", tags=["Reports"])
api_router.include_router(validators_router, prefix="/validators", tags=["Validators"])
