from fastapi import HTTPException, status

from backend.app.models.enums import UserRole
from backend.app.models.favorite import Favorite
from backend.app.models.user import User
from backend.app.repositories.favorite import FavoriteRepository
from backend.app.repositories.vacancy import VacancyRepository
from backend.app.schemas.favorite import FavoriteResponse


class FavoriteService:
    def __init__(
        self,
        repository: FavoriteRepository,
    ):
        self.repository = repository

    async def create(
        self,
        vacancy_id: int,
        current_user: User,
    ) -> FavoriteResponse:

        if current_user.role != UserRole.CANDIDATE:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only candidates can add favorites.",
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

        existing = await self.repository.get_by_user_and_vacancy(
            current_user.id,
            vacancy_id,
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
    ) -> list[FavoriteResponse]:

        if current_user.role != UserRole.CANDIDATE:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only candidates can view favorites.",
            )

        favorites = await self.repository.get_by_user_id(
            current_user.id,
        )

        return [
            FavoriteResponse.model_validate(
                favorite,
            )
            for favorite in favorites
        ]

    async def delete(
        self,
        vacancy_id: int,
        current_user: User,
    ) -> None:

        if current_user.role != UserRole.CANDIDATE:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only candidates can delete favorites.",
            )

        favorite = await self.repository.get_by_user_and_vacancy(
            current_user.id,
            vacancy_id,
        )

        if favorite is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Favorite not found.",
            )

        await self.repository.delete(
            favorite,
        )