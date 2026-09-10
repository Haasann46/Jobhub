from fastapi import (
    HTTPException,
    status,
)

from backend.app.models.enums import (
    InvitationStatus,
    NotificationType,
    UserRole,
)
from backend.app.models.invitation import Invitation
from backend.app.models.user import User
from backend.app.repositories.auth import AuthRepository
from backend.app.repositories.company import CompanyRepository
from backend.app.repositories.invitation import (
    InvitationRepository,
)
from backend.app.repositories.notification import (
    NotificationRepository,
)
from backend.app.repositories.vacancy import (
    VacancyRepository,
)
from backend.app.schemas.invitation import (
    InvitationCreate,
    InvitationResponse,
)
from backend.app.services.notification import (
    NotificationService,
)


class InvitationService:

    def __init__(
        self,
        repository: InvitationRepository,
    ):
        self.repository = repository

    async def _get_notification_service(
        self,
    ) -> NotificationService:

        repository = NotificationRepository(
            self.repository.db,
        )

        return NotificationService(
            repository,
        )

    @staticmethod
    def _to_response(
        invitation: Invitation,
    ) -> InvitationResponse:

        candidate_name = None

        if invitation.candidate.profile:

            profile = invitation.candidate.profile

            candidate_name = " ".join(
                part
                for part in (
                    profile.first_name,
                    profile.last_name,
                )
                if part
            ).strip()

            if not candidate_name:
                candidate_name = None

        return InvitationResponse(
            id=invitation.id,
            employer_id=invitation.employer_id,
            candidate_id=invitation.candidate_id,
            vacancy_id=invitation.vacancy_id,
            message=invitation.message,
            status=invitation.status,
            candidate_email=invitation.candidate.email,
            candidate_name=candidate_name,
            employer_email=invitation.employer.email,
            vacancy_title=invitation.vacancy.title,
            company_name=invitation.vacancy.company.name,
            created_at=invitation.created_at,
            updated_at=invitation.updated_at,
        )

    async def create(
        self,
        current_user: User,
        data: InvitationCreate,
    ) -> InvitationResponse:

        if current_user.role != UserRole.EMPLOYER:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "Only employers can "
                    "send invitations."
                ),
            )

        vacancy_repository = VacancyRepository(
            self.repository.db,
        )

        vacancy = await vacancy_repository.get_by_id(
            data.vacancy_id,
        )

        if vacancy is None:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vacancy not found.",
            )

        if not vacancy.is_active:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This vacancy is inactive.",
            )

        company_repository = CompanyRepository(
            self.repository.db,
        )

        company = await company_repository.get_by_id(
            vacancy.company_id,
        )

        if company is None:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company not found.",
            )

        if company.owner_id != current_user.id:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "You cannot send invitations "
                    "for this vacancy."
                ),
            )

        user_repository = AuthRepository(
            self.repository.db,
        )

        candidate_email = (
            str(data.candidate_email)
            .strip()
            .lower()
        )

        candidate = await user_repository.get_by_email(
            candidate_email,
        )

        if candidate is None:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    "Кандидат с таким email "
                    "не найден."
                ),
            )

        if candidate.role != UserRole.CANDIDATE:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Invitations can only "
                    "be sent to candidates."
                ),
            )

        if candidate.id == current_user.id:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot invite yourself.",
            )

        existing = await self.repository.get_pending(
            employer_id=current_user.id,
            candidate_id=candidate.id,
            vacancy_id=vacancy.id,
        )

        if existing is not None:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "A pending invitation "
                    "already exists."
                ),
            )

        message = (
            data.message.strip()
            if data.message
            else None
        )

        invitation = Invitation(
            employer_id=current_user.id,
            candidate_id=candidate.id,
            vacancy_id=vacancy.id,
            message=message,
            status=InvitationStatus.PENDING,
        )

        invitation = await self.repository.create(
            invitation,
        )

        notification_service = (
            await self._get_notification_service()
        )

        await notification_service.create(
            recipient_id=candidate.id,
            sender_id=current_user.id,
            sender_name=current_user.email,
            notification_type=NotificationType.INVITATION,
            title="Новое приглашение",
            message=(
                f'Вас приглашают на вакансию '
                f'"{vacancy.title}".'
            ),
            vacancy_id=vacancy.id,
        )

        invitation = await self.repository.get_by_id(
            invitation.id,
        )

        return self._to_response(
            invitation,
        )

    async def get_my(
        self,
        current_user: User,
    ) -> list[InvitationResponse]:

        if current_user.role == UserRole.CANDIDATE:

            invitations = (
                await self.repository
                .get_by_candidate_id(
                    current_user.id,
                )
            )

        elif current_user.role == UserRole.EMPLOYER:

            invitations = (
                await self.repository
                .get_by_employer_id(
                    current_user.id,
                )
            )

        else:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This action is not available.",
            )

        return [
            self._to_response(
                invitation,
            )
            for invitation in invitations
        ]

    async def get_by_id(
        self,
        invitation_id: int,
        current_user: User,
    ) -> InvitationResponse:

        invitation = await self.repository.get_by_id(
            invitation_id,
        )

        if invitation is None:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invitation not found.",
            )

        if (
            current_user.id != invitation.candidate_id
            and current_user.id != invitation.employer_id
        ):

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "You cannot view this invitation."
                ),
            )

        return self._to_response(
            invitation,
        )

    async def accept(
        self,
        invitation_id: int,
        current_user: User,
    ) -> InvitationResponse:

        if current_user.role != UserRole.CANDIDATE:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "Only candidates can "
                    "accept invitations."
                ),
            )

        invitation = await self.repository.get_by_id(
            invitation_id,
        )

        if invitation is None:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invitation not found.",
            )

        if invitation.candidate_id != current_user.id:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "You cannot accept "
                    "this invitation."
                ),
            )

        if invitation.status != InvitationStatus.PENDING:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "This invitation "
                    "has already been processed."
                ),
            )

        invitation.status = (
            InvitationStatus.ACCEPTED
        )

        invitation = await self.repository.update(
            invitation,
        )

        notification_service = (
            await self._get_notification_service()
        )

        await notification_service.create(
            recipient_id=invitation.employer_id,
            sender_id=current_user.id,
            sender_name=current_user.email,
            notification_type=NotificationType.INVITATION,
            title="Приглашение принято",
            message=(
                f'{current_user.email} '
                f'принял(а) приглашение '
                f'на вакансию '
                f'"{invitation.vacancy.title}".'
            ),
            vacancy_id=invitation.vacancy_id,
        )

        return self._to_response(
            invitation,
        )

    async def decline(
        self,
        invitation_id: int,
        current_user: User,
    ) -> InvitationResponse:

        if current_user.role != UserRole.CANDIDATE:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "Only candidates can "
                    "decline invitations."
                ),
            )

        invitation = await self.repository.get_by_id(
            invitation_id,
        )

        if invitation is None:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invitation not found.",
            )

        if invitation.candidate_id != current_user.id:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "You cannot decline "
                    "this invitation."
                ),
            )

        if invitation.status != InvitationStatus.PENDING:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "This invitation "
                    "has already been processed."
                ),
            )

        invitation.status = (
            InvitationStatus.DECLINED
        )

        invitation = await self.repository.update(
            invitation,
        )

        notification_service = (
            await self._get_notification_service()
        )

        await notification_service.create(
            recipient_id=invitation.employer_id,
            sender_id=current_user.id,
            sender_name=current_user.email,
            notification_type=NotificationType.INVITATION,
            title="Приглашение отклонено",
            message=(
                f'{current_user.email} '
                f'отклонил(а) приглашение '
                f'на вакансию '
                f'"{invitation.vacancy.title}".'
            ),
            vacancy_id=invitation.vacancy_id,
        )

        return self._to_response(
            invitation,
        )