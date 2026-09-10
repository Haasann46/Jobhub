from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.database import get_db
from backend.app.repositories.invitation import (
    InvitationRepository,
)
from backend.app.services.invitation import (
    InvitationService,
)


def get_invitation_service(
    db: AsyncSession = Depends(get_db),
) -> InvitationService:

    repository = InvitationRepository(
        db,
    )

    return InvitationService(
        repository,
    )