from sqlalchemy import (
    select,
)

from sqlalchemy.ext.asyncio import (
    AsyncSession,
)

from backend.app.models.complaint import (
    Complaint,
)

from backend.app.models.enums import (
    ComplaintStatus,
)


class ComplaintRepository:

    def __init__(
        self,
        db: AsyncSession,
    ):
        self.db = db


    async def create(
        self,
        complaint: Complaint,
    ) -> Complaint:

        self.db.add(
            complaint,
        )

        await self.db.commit()

        await self.db.refresh(
            complaint,
        )

        return complaint


    async def get_by_id(
        self,
        complaint_id: int,
    ) -> Complaint | None:

        result = await self.db.execute(
            select(
                Complaint,
            )
            .where(
                Complaint.id ==
                complaint_id,
            )
        )

        return result.scalar_one_or_none()


    async def get_by_reporter_and_vacancy(
        self,
        reporter_id: int,
        vacancy_id: int,
    ) -> Complaint | None:

        result = await self.db.execute(
            select(
                Complaint,
            )
            .where(
                Complaint.reporter_id ==
                reporter_id,
                Complaint.vacancy_id ==
                vacancy_id,
                Complaint.status.in_(
                    [
                        ComplaintStatus.PENDING,
                        ComplaintStatus.REVIEWING,
                    ],
                ),
            )
        )

        return result.scalar_one_or_none()


    async def get_by_reporter_id(
        self,
        reporter_id: int,
    ) -> list[Complaint]:

        result = await self.db.execute(
            select(
                Complaint,
            )
            .where(
                Complaint.reporter_id ==
                reporter_id,
            )
            .order_by(
                Complaint.created_at.desc(),
            )
        )

        return list(
            result.scalars().all(),
        )


    async def get_all(
        self,
    ) -> list[Complaint]:

        result = await self.db.execute(
            select(
                Complaint,
            )
            .order_by(
                Complaint.created_at.desc(),
            )
        )

        return list(
            result.scalars().all(),
        )


    async def update(
        self,
        complaint: Complaint,
    ) -> Complaint:

        await self.db.commit()

        await self.db.refresh(
            complaint,
        )

        return complaint