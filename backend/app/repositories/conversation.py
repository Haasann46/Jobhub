from sqlalchemy import exists, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.models.application import Application
from backend.app.models.conversation import Conversation
from backend.app.models.message import Message
from backend.app.models.vacancy import Vacancy


class ConversationRepository:

    def __init__(
        self,
        db: AsyncSession,
    ):
        self.db = db


    async def create(
        self,
        conversation: Conversation,
    ) -> Conversation:

        self.db.add(conversation)

        await self.db.commit()

        await self.db.refresh(
            conversation,
        )

        return conversation


    async def get_by_id(
        self,
        conversation_id: int,
    ) -> Conversation | None:

        result = await self.db.execute(
            select(Conversation).where(
                Conversation.id == conversation_id,
            )
        )

        return result.scalar_one_or_none()


    async def get_by_application_id(
        self,
        application_id: int,
    ) -> Conversation | None:

        result = await self.db.execute(
            select(Conversation).where(
                Conversation.application_id
                == application_id,
            )
        )

        return result.scalar_one_or_none()


    async def get_by_candidate_id(
        self,
        candidate_id: int,
    ) -> list[Conversation]:

        employer_message_exists = exists(
            select(Message.id)
            .where(
                Message.conversation_id
                == Conversation.id,

                Message.sender_id
                != candidate_id,
            )
        )


        result = await self.db.execute(
            select(Conversation)
            .join(
                Application,
                Conversation.application_id
                == Application.id,
            )
            .where(
                Application.candidate_id
                == candidate_id,

                employer_message_exists,
            )
            .order_by(
                Conversation.updated_at.desc(),
            )
        )


        return list(
            result.scalars().unique().all()
        )


    async def get_by_company_id(
        self,
        company_id: int,
    ) -> list[Conversation]:

        result = await self.db.execute(
            select(Conversation)
            .join(
                Application,
                Conversation.application_id
                == Application.id,
            )
            .join(
                Vacancy,
                Application.vacancy_id
                == Vacancy.id,
            )
            .where(
                Vacancy.company_id
                == company_id,
            )
            .order_by(
                Conversation.updated_at.desc(),
            )
        )


        return list(
            result.scalars().unique().all()
        )


    async def has_message_from_other_user(
        self,
        conversation_id: int,
        user_id: int,
    ) -> bool:

        result = await self.db.execute(
            select(
                exists(
                    select(Message.id)
                    .where(
                        Message.conversation_id
                        == conversation_id,

                        Message.sender_id
                        != user_id,
                    )
                )
            )
        )


        return bool(
            result.scalar()
        )