from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.database import get_db
from backend.app.repositories.notification import (
    NotificationRepository,
)
from backend.app.services.notification import (
    NotificationService,
)


def get_notification_service(
    db: AsyncSession = Depends(get_db),
) -> NotificationService:

    repository = NotificationRepository(
        db,
    )

    return NotificationService(
        repository,
    )