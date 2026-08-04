from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.vacancy import Vacancy


class VacancyRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self) -> list[Vacancy]:
        result = await self.db.execute(
            select(Vacancy)
        )

        return list(result.scalars().all())

    async def get_active(self) -> list[Vacancy]:
        result = await self.db.execute(
            select(Vacancy).where(
                Vacancy.is_active.is_(True)
            )
        )

        return list(result.scalars().all())

    async def get_by_id(
        self,
        vacancy_id: int,
    ) -> Vacancy | None:

        result = await self.db.execute(
            select(Vacancy).where(
                Vacancy.id == vacancy_id
            )
        )

        return result.scalar_one_or_none()

    async def create(
        self,
        vacancy: Vacancy,
    ) -> Vacancy:
        self.db.add(vacancy)
        await self.db.commit()
        await self.db.refresh(vacancy)
        return vacancy

    async def update(
        self,
        vacancy: Vacancy,
    ) -> Vacancy:
        await self.db.commit()
        await self.db.refresh(vacancy)
        return vacancy

    async def delete(
            self,
            vacancy: Vacancy,
    ) -> None:
        await self.db.delete(vacancy)
        await self.db.commit()

    async def get_by_company_id(
            self,
            company_id: int,
    ) -> list[Vacancy]:
        result = await self.db.execute(
            select(Vacancy).where(
                Vacancy.company_id == company_id
            )
        )

        return list(result.scalars().all())
