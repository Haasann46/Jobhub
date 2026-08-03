from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.repositories.vacancy import VacancyRepository
from app.services.vacancy import VacancyService


def get_vacancy_service(
    db: AsyncSession = Depends(get_db),
) -> VacancyService:
    repository = VacancyRepository(db)
    return VacancyService(repository)