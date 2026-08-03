from app.models.vacancy import Vacancy
from app.repositories.vacancy import VacancyRepository
from app.schemas.vacancy import (
    VacancyCreate,
    VacancyUpdate,
    VacancyResponse,
)
from fastapi import HTTPException, status

from app.models.enums import UserRole
from app.repositories.company import CompanyRepository
from app.models.user import User


class VacancyService:
    def __init__(self, repository: VacancyRepository):
        self.repository = repository

    async def get_all(self) -> list[VacancyResponse]:
        vacancies = await self.repository.get_active()

        return [
            VacancyResponse.model_validate(vacancy)
            for vacancy in vacancies
        ]

    async def get_by_id(
        self,
        vacancy_id: int,
    ) -> VacancyResponse | None:

        vacancy = await self.repository.get_by_id(vacancy_id)

        if vacancy is None:
            return None

        return VacancyResponse.model_validate(vacancy)

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