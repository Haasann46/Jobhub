from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.repositories.resume import ResumeRepository
from app.services.resume import ResumeService


def get_resume_service(
    db: AsyncSession = Depends(get_db),
) -> ResumeService:
    repository = ResumeRepository(db)
    return ResumeService(repository)