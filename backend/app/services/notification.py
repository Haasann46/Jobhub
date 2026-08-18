from fastapi import HTTPException, status

from backend.app.models.enums import NotificationType
from backend.app.models.notification import Notification
from backend.app.models.user import User
from backend.app.repositories.notification import (
    NotificationRepository,
)
from backend.app.schemas.notification import (
    NotificationResponse,
)


class NotificationService:

    def __init__(
        self,
        repository: NotificationRepository,
    ):
        self.repository = repository

    async def create(
        self,
        recipient_id: int,
        notification_type: NotificationType,
        title: str,
        message: str,
        application_id: int | None = None,
        conversation_id: int | None = None,
        vacancy_id: int | None = None,
        sender_id: int | None = None,
        sender_name: str | None = None,
    ) -> NotificationResponse:

        notification = Notification(
            recipient_id=recipient_id,
            sender_id=sender_id,
            sender_name=sender_name,
            type=notification_type,
            title=title,
            message=message,
            is_read=False,
            application_id=application_id,
            conversation_id=conversation_id,
            vacancy_id=vacancy_id,
        )

        notification = (
            await self.repository.create(
                notification,
            )
        )

        return NotificationResponse.model_validate(
            notification,
        )

    async def get_my(
        self,
        current_user: User,
    ) -> list[NotificationResponse]:

        notifications = (
            await self.repository
            .get_by_recipient_id(
                current_user.id,
            )
        )

        return [
            NotificationResponse.model_validate(
                notification,
            )
            for notification in notifications
        ]

    async def get_unread_count(
        self,
        current_user: User,
    ) -> int:

        return await self.repository.get_unread_count(
            current_user.id,
        )

    async def mark_as_read(
        self,
        notification_id: int,
        current_user: User,
    ) -> NotificationResponse:

        notification = (
            await self.repository.get_by_id(
                notification_id,
                current_user.id,
            )
        )

        if notification is None:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found.",
            )

        notification = (
            await self.repository.mark_as_read(
                notification,
            )
        )

        return NotificationResponse.model_validate(
            notification,
        )

    async def mark_all_as_read(
        self,
        current_user: User,
    ) -> None:

        await self.repository.mark_all_as_read(
            current_user.id,
        )