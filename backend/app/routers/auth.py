from fastapi import APIRouter, Depends, HTTPException, status
import traceback
from app.dependencies.auth import get_auth_service
from app.schemas.auth import (
    Token,
    UserLogin,
    UserRegister,
    UserResponse,
)
from app.services.auth import AuthService
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register(
    data: UserRegister,
    service: AuthService = Depends(
        get_auth_service
    ),
):
    try:
        return await service.register(data)


    except ValueError as e:
        traceback.print_exc()
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


    except Exception as e:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=str(e),

        )


@router.post(
    "/login",
    response_model=Token,
)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    service: AuthService = Depends(
        get_auth_service,
    ),
):
    try:
        return await service.login(
            UserLogin(
                email=form_data.username,
                password=form_data.password,
            )
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )