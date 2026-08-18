from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.models.conversation import Conversation
from backend.app.models.message import Message


class MessageRepository:

    def __init__(
        self,
        db: AsyncSession,
    ):
        self.db = db


    async def create(
        self,
        message: Message,
    ) -> Message:

        self.db.add(message)

        await self.db.commit()

        await self.db.refresh(
            message,
        )

        return message


    async def get_by_conversation_id(
        self,
        conversation_id: int,
    ) -> list[Message]:

        result = await self.db.execute(
            select(Message)
            .where(
                Message.conversation_id
                == conversation_id,
            )
            .order_by(
                Message.created_at.asc(),
            )
        )


        return list(
            result.scalars().all()
        )


    async def mark_as_read(
        self,
        message: Message,
    ) -> Message:

        message.is_read = True

        await self.db.commit()

        await self.db.refresh(
            message,
        )

        return message


    async def mark_conversation_as_read(
        self,
        conversation_id: int,
        user_id: int,
    ) -> None:

        result = await self.db.execute(
            select(Message)
            .where(
                Message.conversation_id
                == conversation_id,

                Message.sender_id
                != user_id,

                Message.is_read.is_(False),
            )
        )


        messages = list(
            result.scalars().all()
        )


        for message in messages:

            message.is_read = True


        await self.db.commit()


    async def touch_conversation(
        self,
        conversation_id: int,
    ) -> None:

        conversation = await self.db.get(
            Conversation,
            conversation_id,
        )


        if conversation is None:
            return


        conversation.updated_at = (
            datetime.now(timezone.utc)
        )


        await self.db.commit()