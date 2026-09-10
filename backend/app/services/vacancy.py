from datetime import (
    datetime,
    timezone,
)
import math

from fastapi import (
    HTTPException,
    status,
)

from backend.app.models.enums import (
    EmploymentType,
    ExperienceLevel,
    UserRole,
    VacancyCategory,
)
from backend.app.models.user import User
from backend.app.models.vacancy import Vacancy
from backend.app.repositories.company import CompanyRepository
from backend.app.repositories.vacancy import VacancyRepository
from backend.app.schemas.vacancy import (
    TechnologyResponse,
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


    def _to_response(
        self,
        vacancy: Vacancy,
    ) -> VacancyResponse:

        return VacancyResponse(
            id=vacancy.id,

            title=vacancy.title,

            description=vacancy.description,

            requirements=vacancy.requirements,

            responsibilities=vacancy.responsibilities,

            category=vacancy.category,

            location=vacancy.location,

            employment_type=vacancy.employment_type,

            experience_level=vacancy.experience_level,

            salary_from=vacancy.salary_from,

            salary_to=vacancy.salary_to,

            currency=vacancy.currency,

            is_remote=vacancy.is_remote,

            is_active=vacancy.is_active,

            company_id=vacancy.company_id,

            company_name=vacancy.company.name,

            company_logo=vacancy.company.logo_url,

            published_at=vacancy.published_at,

            technologies=[
                TechnologyResponse.model_validate(
                    technology,
                )
                for technology in vacancy.technologies
            ],
        )


    async def search(
        self,
        search: str | None,
        location: str | None,
        category: VacancyCategory | None,
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
            category=category,
            employment_type=employment_type,
            experience_level=experience_level,
            salary_from=salary_from,
            salary_to=salary_to,
            is_remote=is_remote,
            page=page,
            size=size,
            sort=sort,
        )

        pages = (
            math.ceil(total / size)
            if total
            else 0
        )

        return VacancyListResponse(
            items=[
                self._to_response(
                    vacancy,
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

        return self._to_response(
            vacancy,
        )


    async def get_technologies(
        self,
    ) -> list[TechnologyResponse]:

        technologies = (
            await self.repository
            .get_all_technologies()
        )

        return [
            TechnologyResponse.model_validate(
                technology,
            )
            for technology in technologies
        ]


    async def create(
        self,
        current_user: User,
        data: VacancyCreate,
    ) -> VacancyResponse:

        if current_user.role != UserRole.EMPLOYER:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "Only employers can "
                    "create vacancies."
                ),
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

        technology_ids = list(
            dict.fromkeys(
                data.technology_ids,
            )
        )

        technologies = (
            await self.repository
            .get_technologies_by_ids(
                technology_ids,
            )
        )

        if len(technologies) != len(
            technology_ids
        ):

            found_ids = {
                technology.id
                for technology in technologies
            }

            invalid_ids = [
                technology_id
                for technology_id in technology_ids
                if technology_id not in found_ids
            ]

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Unknown technology IDs: "
                    f"{invalid_ids}"
                ),
            )

        payload = data.model_dump(
            exclude={
                "technology_ids",
            },
        )

        vacancy = Vacancy(
            company_id=company.id,
            published_at=datetime.now(
                timezone.utc,
            ),
            **payload,
        )

        vacancy.technologies = technologies

        created = await self.repository.create(
            vacancy,
        )

        created = await self.repository.get_by_id(
            created.id,
        )

        return self._to_response(
            created,
        )


    async def get_my(
        self,
        current_user: User,
    ) -> list[VacancyResponse]:

        if current_user.role != UserRole.EMPLOYER:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "Only employers can "
                    "view their vacancies."
                ),
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

        vacancies = (
            await self.repository
            .get_by_company_id(
                company.id,
            )
        )

        return [
            self._to_response(
                vacancy,
            )
            for vacancy in vacancies
        ]


    async def get_active_by_company_id(
        self,
        company_id: int,
    ) -> list[VacancyResponse]:

        vacancies = (
            await self.repository
            .get_active_by_company_id(
                company_id,
            )
        )

        return [
            self._to_response(
                vacancy,
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
                detail=(
                    "Only employers can "
                    "update vacancies."
                ),
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
                detail=(
                    "You cannot edit "
                    "this vacancy."
                ),
            )

        update_data = data.model_dump(
            exclude_unset=True,
        )

        technology_ids = update_data.pop(
            "technology_ids",
            None,
        )

        for field, value in update_data.items():

            setattr(
                vacancy,
                field,
                value,
            )

        if technology_ids is not None:

            unique_ids = list(
                dict.fromkeys(
                    technology_ids,
                )
            )

            technologies = (
                await self.repository
                .get_technologies_by_ids(
                    unique_ids,
                )
            )

            if len(technologies) != len(
                unique_ids
            ):

                found_ids = {
                    technology.id
                    for technology in technologies
                }

                invalid_ids = [
                    technology_id
                    for technology_id in unique_ids
                    if technology_id not in found_ids
                ]

                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "Unknown technology IDs: "
                        f"{invalid_ids}"
                    ),
                )

            vacancy.technologies = technologies

        vacancy = await self.repository.update(
            vacancy,
        )

        vacancy = await self.repository.get_by_id(
            vacancy.id,
        )

        return self._to_response(
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
                detail=(
                    "Only employers can "
                    "delete vacancies."
                ),
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
                detail=(
                    "You cannot delete "
                    "this vacancy."
                ),
            )

        await self.repository.delete(
            vacancy,
        )