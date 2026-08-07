from fastapi import (
    APIRouter,
    Depends,
)

from backend.app.dependencies.current_user import get_current_user
from backend.app.models.user import User
from backend.app.schemas.auth import UserResponse

router = APIRouter()


@router.get(
    "/me",
    response_model=UserResponse,
)
async def get_me(
    current_user: User = Depends(
        get_current_user,
    ),
):
    return UserResponse.model_validate(
        current_user,
    )