from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.database import get_db
from backend.app.repositories.technology import TechnologyRepository
from backend.app.services.technology import TechnologyService


def get_technology_service(
    db: AsyncSession = Depends(get_db),
) -> TechnologyService:

    repository = TechnologyRepository(
        db,
    )

    return TechnologyService(
        repository,
    )