from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.models.technology import Technology


class TechnologyRepository:
    def __init__(
        self,
        db: AsyncSession,
    ):
        self.db = db

    async def get_all(
        self,
    ) -> list[Technology]:

        result = await self.db.execute(
            select(Technology).order_by(
                Technology.name
            )
        )

        return list(
            result.scalars().all()
        )

    async def get_by_id(
        self,
        technology_id: int,
    ) -> Technology | None:

        result = await self.db.execute(
            select(Technology).where(
                Technology.id == technology_id
            )
        )

        return result.scalar_one_or_none()

    async def get_by_ids(
        self,
        ids: list[int],
    ) -> list[Technology]:

        if not ids:
            return []

        result = await self.db.execute(
            select(Technology).where(
                Technology.id.in_(ids)
            )
        )

        return list(
            result.scalars().all()
        )

    async def get_by_slug(
        self,
        slug: str,
    ) -> Technology | None:

        result = await self.db.execute(
            select(Technology).where(
                Technology.slug == slug
            )
        )

        return result.scalar_one_or_none()

    async def create(
        self,
        technology: Technology,
    ) -> Technology:

        self.db.add(
            technology,
        )

        await self.db.commit()

        await self.db.refresh(
            technology,
        )

        return technology