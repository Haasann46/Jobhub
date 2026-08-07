from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.database import get_db
from backend.app.repositories.favorite import FavoriteRepository
from backend.app.services.favorite import FavoriteService


def get_favorite_service(
    db: AsyncSession = Depends(get_db),
) -> FavoriteService:
    repository = FavoriteRepository(db)
    return FavoriteService(repository)