from fastapi import HTTPException, status

from backend.app.models.application import Application
from backend.app.models.enums import (
    ApplicationStatus,
    UserRole,
)
from backend.app.models.user import User
from backend.app.repositories.application import ApplicationRepository
from backend.app.repositories.company import CompanyRepository
from backend.app.repositories.resume import ResumeRepository
from backend.app.repositories.vacancy import VacancyRepository
from backend.app.schemas.application import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationStatusUpdate,
    EmployerApplicationResponse,
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


        existing = (
            await self.repository
            .get_by_candidate_and_vacancy(
                current_user.id,
                vacancy_id,
            )
        )

        if existing is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already applied for this vacancy.",
            )


        resume_repository = ResumeRepository(
            self.repository.db,
        )

        resume = await resume_repository.get_by_id(
            data.resume_id,
        )

        if resume is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume not found.",
            )


        if resume.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot use this resume.",
            )


        if not resume.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This resume is inactive.",
            )


        application = Application(
            candidate_id=current_user.id,
            vacancy_id=vacancy_id,
            resume_id=data.resume_id,
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

        applications = (
            await self.repository
            .get_by_candidate_id(
                current_user.id,
            )
        )

        return [
            ApplicationResponse.model_validate(
                application,
            )
            for application in applications
        ]

    async def get_my_count(
            self,
            current_user: User,
    ) -> int:

        if current_user.role != UserRole.EMPLOYER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only employers can view application count.",
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

        return await self.repository.count_by_company_id(
            company.id,
        )

    async def get_by_vacancy(
        self,
        vacancy_id: int,
        current_user: User,
    ) -> list[EmployerApplicationResponse]:

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


        applications = (
            await self.repository
            .get_by_vacancy_id(
                vacancy_id,
            )
        )

        return [
            EmployerApplicationResponse(
                id=application.id,
                candidate_id=application.candidate_id,
                candidate_email=application.candidate.email,
                vacancy_id=application.vacancy_id,
                resume=application.resume,
                cover_letter=application.cover_letter,
                status=application.status,
                created_at=application.created_at,
                updated_at=application.updated_at,
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