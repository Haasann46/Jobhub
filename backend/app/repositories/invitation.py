from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from backend.app.models.invitation import Invitation
from backend.app.models.user import User
from backend.app.models.vacancy import Vacancy


class InvitationRepository:

    def __init__(
        self,
        db: AsyncSession,
    ):
        self.db = db


    async def create(
        self,
        invitation: Invitation,
    ) -> Invitation:

        self.db.add(
            invitation,
        )

        await self.db.commit()

        await self.db.refresh(
            invitation,
        )

        return invitation


    async def get_by_id(
        self,
        invitation_id: int,
    ) -> Invitation | None:

        result = await self.db.execute(
            select(Invitation)
            .options(
                selectinload(
                    Invitation.candidate,
                ).selectinload(
                    User.profile,
                ),
                selectinload(
                    Invitation.employer,
                ),
                selectinload(
                    Invitation.vacancy,
                ).selectinload(
                    Vacancy.company,
                ),
            )
            .where(
                Invitation.id == invitation_id,
            )
        )

        return result.scalar_one_or_none()


    async def get_by_candidate_id(
        self,
        candidate_id: int,
    ) -> list[Invitation]:

        result = await self.db.execute(
            select(Invitation)
            .options(
                selectinload(
                    Invitation.candidate,
                ).selectinload(
                    User.profile,
                ),
                selectinload(
                    Invitation.employer,
                ),
                selectinload(
                    Invitation.vacancy,
                ).selectinload(
                    Vacancy.company,
                ),
            )
            .where(
                Invitation.candidate_id == candidate_id,
            )
            .order_by(
                Invitation.created_at.desc(),
            )
        )

        return list(
            result.scalars().all()
        )


    async def get_by_employer_id(
        self,
        employer_id: int,
    ) -> list[Invitation]:

        result = await self.db.execute(
            select(Invitation)
            .options(
                selectinload(
                    Invitation.candidate,
                ).selectinload(
                    User.profile,
                ),
                selectinload(
                    Invitation.employer,
                ),
                selectinload(
                    Invitation.vacancy,
                ).selectinload(
                    Vacancy.company,
                ),
            )
            .where(
                Invitation.employer_id == employer_id,
            )
            .order_by(
                Invitation.created_at.desc(),
            )
        )

        return list(
            result.scalars().all()
        )


    async def get_pending(
        self,
        employer_id: int,
        candidate_id: int,
        vacancy_id: int,
    ) -> Invitation | None:

        result = await self.db.execute(
            select(Invitation)
            .where(
                Invitation.employer_id == employer_id,
                Invitation.candidate_id == candidate_id,
                Invitation.vacancy_id == vacancy_id,
                Invitation.status == "PENDING",
            )
            .order_by(
                Invitation.created_at.desc(),
            )
        )

        return result.scalars().first()


    async def update(
        self,
        invitation: Invitation,
    ) -> Invitation:

        await self.db.commit()

        await self.db.refresh(
            invitation,
        )

        return invitation