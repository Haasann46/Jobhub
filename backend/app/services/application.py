from fastapi import HTTPException, status

from app.models.application import Application
from app.models.enums import ApplicationStatus, UserRole
from app.models.user import User
from app.repositories.application import ApplicationRepository
from app.repositories.company import CompanyRepository
from app.repositories.vacancy import VacancyRepository
from app.schemas.application import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationStatusUpdate,
)


class ApplicationService:
    def __init__(
        self,
        repository: ApplicationRepository,
    ):
        self.repository = repository

    async def create(
        self,
        vacancy_id: int,
        current_user: User,
        data: ApplicationCreate,
    ) -> ApplicationResponse:

        if current_user.role != UserRole.CANDIDATE:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only candidates can apply for vacancies.",
            )

        vacancy_repository = VacancyRepository(
            self.repository.db,
        )

        vacancy = await vacancy_repository.get_by_id(
            vacancy_id,
        )

        if vacancy is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vacancy not found.",
            )

        existing = await self.repository.get_by_candidate_and_vacancy(
            current_user.id,
            vacancy_id,
        )

        if existing is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already applied for this vacancy.",
            )

        application = Application(
            candidate_id=current_user.id,
            vacancy_id=vacancy_id,
            cover_letter=data.cover_letter,
            status=ApplicationStatus.NEW,
        )

        application = await self.repository.create(
            application,
        )

        return ApplicationResponse.model_validate(
            application,
        )

    async def get_my(
        self,
        current_user: User,
    ) -> list[ApplicationResponse]:

        if current_user.role != UserRole.CANDIDATE:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only candidates can view their applications.",
            )

        applications = await self.repository.get_by_candidate_id(
            current_user.id,
        )

        return [
            ApplicationResponse.model_validate(
                application,
            )
            for application in applications
        ]

    async def get_by_vacancy(
        self,
        vacancy_id: int,
        current_user: User,
    ) -> list[ApplicationResponse]:

        if current_user.role != UserRole.EMPLOYER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only employers can view applications.",
            )

        vacancy_repository = VacancyRepository(
            self.repository.db,
        )

        vacancy = await vacancy_repository.get_by_id(
            vacancy_id,
        )

        if vacancy is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vacancy not found.",
            )

        company_repository = CompanyRepository(
            self.repository.db,
        )

        company = await company_repository.get_by_owner_id(
            current_user.id,
        )

        if company is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company not found.",
            )

        if vacancy.company_id != company.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot view applications for this vacancy.",
            )

        applications = await self.repository.get_by_vacancy_id(
            vacancy_id,
        )

        return [
            ApplicationResponse.model_validate(
                application,
            )
            for application in applications
        ]

    async def update_status(
        self,
        application_id: int,
        current_user: User,
        data: ApplicationStatusUpdate,
    ) -> ApplicationResponse:

        if current_user.role != UserRole.EMPLOYER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only employers can update application status.",
            )

        application = await self.repository.get_by_id(
            application_id,
        )

        if application is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found.",
            )

        vacancy_repository = VacancyRepository(
            self.repository.db,
        )

        vacancy = await vacancy_repository.get_by_id(
            application.vacancy_id,
        )

        if vacancy is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vacancy not found.",
            )

        company_repository = CompanyRepository(
            self.repository.db,
        )

        company = await company_repository.get_by_owner_id(
            current_user.id,
        )

        if company is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company not found.",
            )

        if vacancy.company_id != company.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot update this application.",
            )

        application.status = data.status

        application = await self.repository.update(
            application,
        )

        return ApplicationResponse.model_validate(
            application,
        )