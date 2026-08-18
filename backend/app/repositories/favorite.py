from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from backend.app.models.company import Company
from backend.app.models.favorite import Favorite
from backend.app.models.vacancy import Vacancy


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

    async def get_favorite_vacancies(
        self,
        user_id: int,
    ) -> list[Vacancy]:
        result = await self.db.execute(
            select(Vacancy)
            .join(
                Favorite,
                Favorite.vacancy_id == Vacancy.id,
            )
            .options(
                selectinload(
                    Vacancy.company,
                ),
                selectinload(
                    Vacancy.technologies,
                ),
            )
            .where(
                Favorite.user_id == user_id,
                Vacancy.is_active.is_(True),
            )
            .order_by(
                Favorite.created_at.desc(),
            )
        )

        return list(
            result.scalars().all()
        )

    async def delete(
        self,
        favorite: Favorite,
    ) -> None:
        await self.db.delete(favorite)

        await self.db.commit()