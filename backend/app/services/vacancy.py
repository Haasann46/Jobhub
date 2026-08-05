import math

from fastapi import HTTPException, status

from app.models.enums import (
    EmploymentType,
    UserRole,
    ExperienceLevel,
)
from app.models.user import User
from app.models.vacancy import Vacancy
from app.repositories.company import CompanyRepository
from app.repositories.vacancy import VacancyRepository
from app.schemas.vacancy import (
    VacancyCreate,
    VacancyListResponse,
    VacancyResponse,
    VacancySort,
    VacancyUpdate,
)


class VacancyService:
    def __init__(
        self,
        repository: VacancyRepository,
    ):
        self.repository = repository

    async def search(
        self,
        search: str | None,
        location: str | None,
        employment_type: EmploymentType | None,
        experience_level: ExperienceLevel | None,
        salary_from: int | None,
        salary_to: int | None,
        is_remote: bool | None,
        page: int,
        size: int,
        sort: VacancySort,
    ) -> VacancyListResponse:

        vacancies, total = await self.repository.search(
            search=search,
            location=location,
            employment_type=employment_type,
            experience_level=experience_level,
            salary_from=salary_from,
            salary_to=salary_to,
            is_remote=is_remote,
            page=page,
            size=size,
            sort=sort,
        )

        pages = math.ceil(total / size) if total else 0

        return VacancyListResponse(
            items=[
                VacancyResponse.model_validate(
                    vacancy
                )
                for vacancy in vacancies
            ],
            total=total,
            page=page,
            size=size,
            pages=pages,
            has_next=page < pages,
            has_previous=page > 1,
        )

    async def get_by_id(
        self,
        vacancy_id: int,
    ) -> VacancyResponse | None:

        vacancy = await self.repository.get_by_id(
            vacancy_id,
        )

        if vacancy is None:
            return None

        return VacancyResponse.model_validate(
            vacancy
        )

    async def create(
        self,
        current_user: User,
        data: VacancyCreate,
    ) -> VacancyResponse:

        if current_user.role != UserRole.EMPLOYER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only employers can create vacancies.",
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

        vacancy = Vacancy(
            company_id=company.id,
            **data.model_dump(),
        )

        created = await self.repository.create(
            vacancy,
        )

        return VacancyResponse.model_validate(
            created,
        )

    async def get_my(
        self,
        current_user: User,
    ) -> list[VacancyResponse]:

        if current_user.role != UserRole.EMPLOYER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only employers can view their vacancies.",
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

        vacancies = await self.repository.get_by_company_id(
            company.id,
        )

        return [
            VacancyResponse.model_validate(
                vacancy
            )
            for vacancy in vacancies
        ]

    async def update(
        self,
        vacancy_id: int,
        current_user: User,
        data: VacancyUpdate,
    ) -> VacancyResponse:

        if current_user.role != UserRole.EMPLOYER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only employers can update vacancies.",
            )

        vacancy = await self.repository.get_by_id(
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
                detail="You cannot edit this vacancy.",
            )

        for field, value in data.model_dump(
            exclude_unset=True,
        ).items():
            setattr(
                vacancy,
                field,
                value,
            )

        vacancy = await self.repository.update(
            vacancy,
        )

        return VacancyResponse.model_validate(
            vacancy,
        )

    async def delete(
        self,
        vacancy_id: int,
        current_user: User,
    ) -> None:

        if current_user.role != UserRole.EMPLOYER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only employers can delete vacancies.",
            )

        vacancy = await self.repository.get_by_id(
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
                detail="You cannot delete this vacancy.",
            )

        await self.repository.delete(
            vacancy,
        )