from fastapi import (
    APIRouter,
    Depends,
)
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.database import get_db
from backend.app.dependencies.current_user import get_current_user
from backend.app.models.user import User
from backend.app.repositories.profile import ProfileRepository
from backend.app.schemas.profile import (
    ProfileResponse,
    ProfileUpdate,
)
from backend.app.services.profile import ProfileService

router = APIRouter()


def get_profile_service(
    db: AsyncSession = Depends(get_db),
) -> ProfileService:
    repository = ProfileRepository(db)
    return ProfileService(repository)


@router.get(
    "/me",
    response_model=ProfileResponse,
)
async def get_my_profile(
    current_user: User = Depends(
        get_current_user,
    ),
    service: ProfileService = Depends(
        get_profile_service,
    ),
):
    return await service.get_me(
        current_user,
    )


@router.put(
    "/me",
    response_model=ProfileResponse,
)
async def update_my_profile(
    data: ProfileUpdate,
    current_user: User = Depends(
        get_current_user,
    ),
    service: ProfileService = Depends(
        get_profile_service,
    ),
):
    return await service.update_me(
        current_user,
        data,
    )