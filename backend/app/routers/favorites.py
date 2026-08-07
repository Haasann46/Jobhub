from fastapi import (
    APIRouter,
    Depends,
    status,
)

from backend.app.dependencies.current_user import get_current_user
from backend.app.dependencies.favorite import get_favorite_service
from backend.app.models.user import User
from backend.app.schemas.favorite import FavoriteResponse
from backend.app.services.favorite import FavoriteService

router = APIRouter(
    tags=["Favorites"],
)


@router.post(
    "/{vacancy_id}",
    response_model=FavoriteResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_favorite(
    vacancy_id: int,
    current_user: User = Depends(
        get_current_user,
    ),
    service: FavoriteService = Depends(
        get_favorite_service,
    ),
):
    return await service.create(
        vacancy_id,
        current_user,
    )


@router.get(
    "/my",
    response_model=list[FavoriteResponse],
)
async def get_my_favorites(
    current_user: User = Depends(
        get_current_user,
    ),
    service: FavoriteService = Depends(
        get_favorite_service,
    ),
):
    return await service.get_my(
        current_user,
    )


@router.delete(
    "/{vacancy_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_favorite(
    vacancy_id: int,
    current_user: User = Depends(
        get_current_user,
    ),
    service: FavoriteService = Depends(
        get_favorite_service,
    ),
):
    await service.delete(
        vacancy_id,
        current_user,
    )