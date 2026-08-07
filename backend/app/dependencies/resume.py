from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.database import get_db
from backend.app.repositories.resume import ResumeRepository
from backend.app.services.resume import ResumeService


def get_resume_service(
    db: AsyncSession = Depends(get_db),
) -> ResumeService:
    repository = ResumeRepository(db)
    return ResumeService(repository)