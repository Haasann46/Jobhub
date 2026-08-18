from fastapi import HTTPException, status

from backend.app.models.enums import UserRole
from backend.app.models.favorite import Favorite
from backend.app.models.user import User
from backend.app.repositories.favorite import FavoriteRepository
from backend.app.repositories.vacancy import VacancyRepository
from backend.app.schemas.favorite import (
    FavoriteCheckResponse,
    FavoriteResponse,
)
from backend.app.schemas.vacancy import (
    TechnologyResponse,
    VacancyResponse,
)


class FavoriteService:

    def __init__(
        self,
        repository: FavoriteRepository,
    ):
        self.repository = repository


    @staticmethod
    def _ensure_candidate(
        current_user: User,
    ) -> None:

        if current_user.role != UserRole.CANDIDATE:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only candidates can use favorites.",
            )


    @staticmethod
    def _to_vacancy_response(
        vacancy,
    ) -> VacancyResponse:

        return VacancyResponse(
            id=vacancy.id,

            title=vacancy.title,

            description=vacancy.description,

            category=vacancy.category,

            location=vacancy.location,

            employment_type=vacancy.employment_type,

            experience_level=vacancy.experience_level,

            salary_from=vacancy.salary_from,

            salary_to=vacancy.salary_to,

            is_remote=vacancy.is_remote,

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


    async def create(
        self,
        vacancy_id: int,
        current_user: User,
    ) -> FavoriteResponse:

        self._ensure_candidate(
            current_user,
        )


        vacancy_repository = VacancyRepository(
            self.repository.db,
        )


        vacancy = await vacancy_repository.get_by_id(
            vacancy_id,
        )


        if (
            vacancy is None
            or not vacancy.is_active
        ):

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vacancy not found.",
            )


        existing = (
            await self.repository.get_by_user_and_vacancy(
                current_user.id,
                vacancy_id,
            )
        )


        if existing is not None:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Vacancy already added to favorites.",
            )


        favorite = Favorite(
            user_id=current_user.id,
            vacancy_id=vacancy_id,
        )


        favorite = await self.repository.create(
            favorite,
        )


        return FavoriteResponse.model_validate(
            favorite,
        )


    async def get_my(
        self,
        current_user: User,
    ) -> list[VacancyResponse]:

        self._ensure_candidate(
            current_user,
        )


        vacancies = (
            await self.repository.get_favorite_vacancies(
                current_user.id,
            )
        )


        return [
            self._to_vacancy_response(
                vacancy,
            )
            for vacancy in vacancies
        ]


    async def check(
        self,
        vacancy_id: int,
        current_user: User,
    ) -> FavoriteCheckResponse:

        self._ensure_candidate(
            current_user,
        )


        favorite = (
            await self.repository.get_by_user_and_vacancy(
                current_user.id,
                vacancy_id,
            )
        )


        return FavoriteCheckResponse(
            is_favorite=favorite is not None,
        )


    async def delete(
        self,
        vacancy_id: int,
        current_user: User,
    ) -> None:

        self._ensure_candidate(
            current_user,
        )


        favorite = (
            await self.repository.get_by_user_and_vacancy(
                current_user.id,
                vacancy_id,
            )
        )


        if favorite is None:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Favorite not found.",
            )


        await self.repository.delete(
            favorite,
        )