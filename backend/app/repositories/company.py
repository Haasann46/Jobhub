from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.models.company import Company


class CompanyRepository:

    def __init__(
        self,
        db: AsyncSession,
    ):
        self.db = db

    async def get_by_owner_id(
        self,
        owner_id: int,
    ) -> Company | None:

        result = await self.db.execute(
            select(Company).where(
                Company.owner_id == owner_id
            )
        )

        return result.scalar_one_or_none()

    async def create(
        self,
        company: Company,
    ) -> Company:

        self.db.add(company)

        await self.db.commit()

        await self.db.refresh(company)

        return company

    async def update(
        self,
        company: Company,
    ) -> Company:

        await self.db.commit()

        await self.db.refresh(company)

        return company