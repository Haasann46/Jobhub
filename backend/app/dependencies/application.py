from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.repositories.application import ApplicationRepository
from app.services.application import ApplicationService


def get_application_service(
    db: AsyncSession = Depends(get_db),
) -> ApplicationService:
    repository = ApplicationRepository(db)
    return ApplicationService(repository)