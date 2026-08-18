from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.database import get_db
from backend.app.repositories.message import (
    MessageRepository,
)
from backend.app.services.message import (
    MessageService,
)


def get_message_service(
    db: AsyncSession = Depends(get_db),
) -> MessageService:

    repository = MessageRepository(
        db,
    )

    return MessageService(
        repository,
    )