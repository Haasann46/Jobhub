from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.favorite import Favorite


class FavoriteRepository:
    def __init__(
        self,
        db: AsyncSession,
    ):
        self.db = db

    async def create(
        self,
        favorite: Favorite,
    ) -> Favorite:
        self.db.add(favorite)
        await self.db.commit()
        await self.db.refresh(favorite)
        return favorite

    async def get_by_user_id(
        self,
        user_id: int,
    ) -> list[Favorite]:
        result = await self.db.execute(
            select(Favorite).where(
                Favorite.user_id == user_id,
            )
        )

        return list(result.scalars().all())

    async def get_by_user_and_vacancy(
        self,
        user_id: int,
        vacancy_id: int,
    ) -> Favorite | None:
        result = await self.db.execute(
            select(Favorite).where(
                Favorite.user_id == user_id,
                Favorite.vacancy_id == vacancy_id,
            )
        )

        return result.scalar_one_or_none()

    async def delete(
        self,
        favorite: Favorite,
    ) -> None:
        await self.db.delete(favorite)
        await self.db.commit()