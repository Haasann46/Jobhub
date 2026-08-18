from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.database import get_db
from backend.app.repositories.conversation import (
    ConversationRepository,
)
from backend.app.services.conversation import (
    ConversationService,
)


def get_conversation_service(
    db: AsyncSession = Depends(get_db),
) -> ConversationService:

    repository = ConversationRepository(
        db,
    )

    return ConversationService(
        repository,
    )