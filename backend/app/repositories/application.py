from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.application import Application


class ApplicationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(
        self,
        application: Application,
    ) -> Application:
        self.db.add(application)
        await self.db.commit()
        await self.db.refresh(application)
        return application

    async def get_by_id(
        self,
        application_id: int,
    ) -> Application | None:
        result = await self.db.execute(
            select(Application).where(
                Application.id == application_id
            )
        )
        return result.scalar_one_or_none()

    async def get_by_candidate_id(
        self,
        candidate_id: int,
    ) -> list[Application]:
        result = await self.db.execute(
            select(Application).where(
                Application.candidate_id == candidate_id
            )
        )
        return list(result.scalars().all())

    async def get_by_vacancy_id(
        self,
        vacancy_id: int,
    ) -> list[Application]:
        result = await self.db.execute(
            select(Application).where(
                Application.vacancy_id == vacancy_id
            )
        )
        return list(result.scalars().all())

    async def get_by_candidate_and_vacancy(
        self,
        candidate_id: int,
        vacancy_id: int,
    ) -> Application | None:
        result = await self.db.execute(
            select(Application).where(
                Application.candidate_id == candidate_id,
                Application.vacancy_id == vacancy_id,
            )
        )
        return result.scalar_one_or_none()

    async def update(
        self,
        application: Application,
    ) -> Application:
        await self.db.commit()
        await self.db.refresh(application)
        return application