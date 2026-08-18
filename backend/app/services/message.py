from fastapi import HTTPException, status
from sqlalchemy import select

from backend.app.models.application import Application
from backend.app.models.company import Company
from backend.app.models.enums import (
    NotificationType,
    UserRole,
)
from backend.app.models.message import Message
from backend.app.models.user import User
from backend.app.models.vacancy import Vacancy
from backend.app.repositories.conversation import (
    ConversationRepository,
)
from backend.app.repositories.message import (
    MessageRepository,
)
from backend.app.repositories.notification import (
    NotificationRepository,
)
from backend.app.schemas.message import (
    MessageCreate,
    MessageResponse,
)
from backend.app.services.conversation import (
    ConversationService,
)
from backend.app.services.notification import (
    NotificationService,
)


class MessageService:

    def __init__(
        self,
        repository: MessageRepository,
    ):
        self.repository = repository


    def _get_conversation_service(
        self,
    ) -> ConversationService:

        conversation_repository = (
            ConversationRepository(
                self.repository.db,
            )
        )

        return ConversationService(
            conversation_repository,
        )


    def _get_notification_service(
        self,
    ) -> NotificationService:

        notification_repository = (
            NotificationRepository(
                self.repository.db,
            )
        )

        return NotificationService(
            notification_repository,
        )


    async def get_by_conversation(
        self,
        conversation_id: int,
        current_user: User,
    ) -> list[MessageResponse]:

        conversation_service = (
            self._get_conversation_service()
        )


        await conversation_service.get(
            conversation_id,
            current_user,
        )


        messages = (
            await self.repository
            .get_by_conversation_id(
                conversation_id,
            )
        )


        return [
            MessageResponse.model_validate(
                message,
            )
            for message in messages
        ]


    async def create(
        self,
        conversation_id: int,
        current_user: User,
        data: MessageCreate,
    ) -> MessageResponse:

        # ========================================================
        # ACCESS CHECK
        # ========================================================

        conversation_service = (
            self._get_conversation_service()
        )


        conversation = (
            await conversation_service.get(
                conversation_id,
                current_user,
            )
        )


        # ========================================================
        # VALIDATE CONTENT
        # ========================================================

        content = data.content.strip()


        if not content:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Message cannot be empty.",
            )


        # ========================================================
        # CREATE MESSAGE
        # ========================================================

        message = Message(
            conversation_id=conversation_id,
            sender_id=current_user.id,
            content=content,
            is_read=False,
        )


        message = await self.repository.create(
            message,
        )


        # ========================================================
        # UPDATE CONVERSATION
        # ========================================================

        await self.repository.touch_conversation(
            conversation_id,
        )


        # ========================================================
        # GET APPLICATION
        # ========================================================

        conversation_repository = (
            ConversationRepository(
                self.repository.db,
            )
        )


        conversation_model = (
            await conversation_repository.get_by_id(
                conversation_id,
            )
        )


        if conversation_model is None:

            return MessageResponse.model_validate(
                message,
            )


        application_result = (
            await self.repository.db.execute(
                select(Application)
                .where(
                    Application.id
                    == conversation_model.application_id,
                )
            )
        )


        application = (
            application_result
            .scalar_one_or_none()
        )


        if application is None:

            return MessageResponse.model_validate(
                message,
            )


        # ========================================================
        # DETERMINE RECIPIENT
        # ========================================================

        recipient_id: int | None = None


        # --------------------------------------------------------
        # CANDIDATE → EMPLOYER
        # --------------------------------------------------------

        if current_user.role == UserRole.CANDIDATE:

            vacancy_result = (
                await self.repository.db.execute(
                    select(Vacancy)
                    .where(
                        Vacancy.id
                        == application.vacancy_id,
                    )
                )
            )


            vacancy = (
                vacancy_result
                .scalar_one_or_none()
            )


            if vacancy is not None:

                company_result = (
                    await self.repository.db.execute(
                        select(Company.owner_id)
                        .where(
                            Company.id
                            == vacancy.company_id,
                        )
                    )
                )


                recipient_id = (
                    company_result
                    .scalar_one_or_none()
                )


        # --------------------------------------------------------
        # EMPLOYER → CANDIDATE
        # --------------------------------------------------------

        elif current_user.role == UserRole.EMPLOYER:

            recipient_id = (
                application.candidate_id
            )


        # ========================================================
        # NOTIFICATION
        # ========================================================

        if (
            recipient_id is not None
            and recipient_id != current_user.id
        ):

            notification_service = (
                self._get_notification_service()
            )


            await notification_service.create(
                recipient_id=recipient_id,

                sender_id=current_user.id,

                sender_name=current_user.email,

                notification_type=(
                    NotificationType.NEW_MESSAGE
                ),

                title=(
                    f"Новое сообщение от "
                    f"{current_user.email}"
                ),

                message=(
                    "Вам отправили новое "
                    "сообщение в чате."
                ),

                application_id=application.id,

                conversation_id=conversation_id,

                vacancy_id=application.vacancy_id,
            )


        return MessageResponse.model_validate(
            message,
        )


    async def mark_as_read(
        self,
        conversation_id: int,
        current_user: User,
    ) -> None:

        conversation_service = (
            self._get_conversation_service()
        )


        await conversation_service.get(
            conversation_id,
            current_user,
        )


        await self.repository.mark_conversation_as_read(
            conversation_id,
            current_user.id,
        )