from fastapi import HTTPException, status

from backend.app.models.conversation import Conversation
from backend.app.models.enums import UserRole
from backend.app.models.user import User
from backend.app.repositories.application import ApplicationRepository
from backend.app.repositories.company import CompanyRepository
from backend.app.repositories.conversation import ConversationRepository
from backend.app.repositories.message import MessageRepository
from backend.app.repositories.vacancy import VacancyRepository
from backend.app.schemas.conversation import (
    ConversationListItem,
    ConversationResponse,
)


class ConversationService:

    def __init__(
        self,
        repository: ConversationRepository,
    ):
        self.repository = repository


    async def _get_application(
        self,
        application_id: int,
    ):

        application_repository = ApplicationRepository(
            self.repository.db,
        )

        application = (
            await application_repository.get_by_id(
                application_id,
            )
        )

        if application is None:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found.",
            )

        return application


    async def _check_access(
        self,
        application,
        current_user: User,
    ) -> None:

        # ========================================================
        # CANDIDATE
        # ========================================================

        if current_user.role == UserRole.CANDIDATE:

            if (
                application.candidate_id
                != current_user.id
            ):

                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=(
                        "You cannot access "
                        "this conversation."
                    ),
                )

            return


        # ========================================================
        # EMPLOYER
        # ========================================================

        if current_user.role == UserRole.EMPLOYER:

            vacancy_repository = VacancyRepository(
                self.repository.db,
            )

            vacancy = (
                await vacancy_repository.get_by_id(
                    application.vacancy_id,
                )
            )

            if vacancy is None:

                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Vacancy not found.",
                )


            company_repository = CompanyRepository(
                self.repository.db,
            )

            company = (
                await company_repository.get_by_owner_id(
                    current_user.id,
                )
            )

            if company is None:

                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Company not found.",
                )


            if vacancy.company_id != company.id:

                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=(
                        "You cannot access "
                        "this conversation."
                    ),
                )

            return


        # ========================================================
        # OTHER ROLES
        # ========================================================

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot access conversations.",
        )


    async def _check_candidate_visibility(
        self,
        conversation: Conversation,
        current_user: User,
    ) -> None:

        if current_user.role != UserRole.CANDIDATE:
            return


        has_employer_message = (
            await self.repository
            .has_message_from_other_user(
                conversation.id,
                current_user.id,
            )
        )


        if not has_employer_message:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found.",
            )


    async def get_or_create(
        self,
        application_id: int,
        current_user: User,
    ) -> ConversationResponse:

        application = await self._get_application(
            application_id,
        )


        await self._check_access(
            application,
            current_user,
        )


        # Только работодатель может
        # инициировать conversation.

        if current_user.role != UserRole.EMPLOYER:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "Only employers can "
                    "start conversations."
                ),
            )


        conversation = (
            await self.repository
            .get_by_application_id(
                application_id,
            )
        )


        if conversation is None:

            conversation = Conversation(
                application_id=application_id,
            )

            conversation = (
                await self.repository.create(
                    conversation,
                )
            )


        return ConversationResponse.model_validate(
            conversation,
        )


    async def get_by_application(
        self,
        application_id: int,
        current_user: User,
    ) -> ConversationResponse:

        application = await self._get_application(
            application_id,
        )


        await self._check_access(
            application,
            current_user,
        )


        conversation = (
            await self.repository
            .get_by_application_id(
                application_id,
            )
        )


        if conversation is None:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found.",
            )


        await self._check_candidate_visibility(
            conversation,
            current_user,
        )


        return ConversationResponse.model_validate(
            conversation,
        )


    async def get(
        self,
        conversation_id: int,
        current_user: User,
    ) -> ConversationResponse:

        conversation = (
            await self.repository.get_by_id(
                conversation_id,
            )
        )


        if conversation is None:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found.",
            )


        application = await self._get_application(
            conversation.application_id,
        )


        await self._check_access(
            application,
            current_user,
        )


        await self._check_candidate_visibility(
            conversation,
            current_user,
        )


        return ConversationResponse.model_validate(
            conversation,
        )


    async def get_my(
        self,
        current_user: User,
    ) -> list[ConversationListItem]:

        # ========================================================
        # GET CONVERSATIONS
        # ========================================================

        if current_user.role == UserRole.CANDIDATE:

            conversations = (
                await self.repository
                .get_by_candidate_id(
                    current_user.id,
                )
            )

        elif current_user.role == UserRole.EMPLOYER:

            company_repository = CompanyRepository(
                self.repository.db,
            )

            company = (
                await company_repository.get_by_owner_id(
                    current_user.id,
                )
            )

            if company is None:

                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Company not found.",
                )


            conversations = (
                await self.repository
                .get_by_company_id(
                    company.id,
                )
            )

        else:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "You cannot access "
                    "conversations."
                ),
            )


        # ========================================================
        # BUILD RESPONSE
        # ========================================================

        message_repository = MessageRepository(
            self.repository.db,
        )

        vacancy_repository = VacancyRepository(
            self.repository.db,
        )


        result: list[
            ConversationListItem
        ] = []


        for conversation in conversations:

            application = conversation.application


            vacancy = (
                await vacancy_repository.get_by_id(
                    application.vacancy_id,
                )
            )


            if vacancy is None:
                continue


            # ----------------------------------------------------
            # Определяем второго пользователя
            # ----------------------------------------------------

            if current_user.role == UserRole.CANDIDATE:

                other_user = (
                    vacancy.company.owner
                )

            else:

                other_user = (
                    application.candidate
                )


            # ----------------------------------------------------
            # Сообщения
            # ----------------------------------------------------

            messages = (
                await message_repository
                .get_by_conversation_id(
                    conversation.id,
                )
            )


            unread_count = sum(
                1
                for message in messages
                if (
                    message.sender_id
                    != current_user.id
                    and not message.is_read
                )
            )


            last_message = (
                messages[-1]
                if messages
                else None
            )


            # ----------------------------------------------------
            # Response
            # ----------------------------------------------------

            result.append(
                ConversationListItem(
                    id=conversation.id,

                    application_id=application.id,

                    other_user_id=other_user.id,

                    other_user_email=other_user.email,

                    vacancy_id=vacancy.id,

                    vacancy_title=vacancy.title,

                    unread_count=unread_count,

                    last_message=(
                        last_message.content
                        if last_message
                        else None
                    ),

                    last_message_at=(
                        last_message.created_at
                        if last_message
                        else None
                    ),

                    created_at=conversation.created_at,

                    updated_at=conversation.updated_at,
                )
            )


        return result