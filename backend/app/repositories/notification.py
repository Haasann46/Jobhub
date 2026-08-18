from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.models.notification import Notification


class NotificationRepository:

    def __init__(
        self,
        db: AsyncSession,
    ):
        self.db = db


    async def create(
        self,
        notification: Notification,
    ) -> Notification:

        self.db.add(notification)

        await self.db.commit()

        await self.db.refresh(
            notification,
        )

        return notification


    async def get_by_id(
        self,
        notification_id: int,
        recipient_id: int,
    ) -> Notification | None:

        result = await self.db.execute(
            select(Notification)
            .where(
                Notification.id == notification_id,
                Notification.recipient_id == recipient_id,
            )
        )

        return result.scalar_one_or_none()


    async def get_by_recipient_id(
        self,
        recipient_id: int,
        limit: int = 20,
    ) -> list[Notification]:

        result = await self.db.execute(
            select(Notification)
            .where(
                Notification.recipient_id == recipient_id,
            )
            .order_by(
                Notification.created_at.desc(),
            )
            .limit(limit)
        )

        return list(
            result.scalars().all()
        )


    async def get_unread_count(
        self,
        recipient_id: int,
    ) -> int:

        result = await self.db.execute(
            select(
                func.count(Notification.id),
            )
            .where(
                Notification.recipient_id == recipient_id,
                Notification.is_read.is_(False),
            )
        )

        return result.scalar_one()


    async def mark_as_read(
        self,
        notification: Notification,
    ) -> Notification:

        notification.is_read = True

        await self.db.commit()

        await self.db.refresh(
            notification,
        )

        return notification


    async def mark_all_as_read(
        self,
        recipient_id: int,
    ) -> None:

        await self.db.execute(
            update(Notification)
            .where(
                Notification.recipient_id == recipient_id,
                Notification.is_read.is_(False),
            )
            .values(
                is_read=True,
            )
        )

        await self.db.commit()