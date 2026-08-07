from backend.app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from backend.app.models.user import User
from backend.app.repositories.auth import AuthRepository
from backend.app.schemas.auth import (
    Token,
    UserLogin,
    UserRegister,
    UserResponse,
)


class AuthService:

    def __init__(
        self,
        repository: AuthRepository,
    ):
        self.repository = repository

    async def register(
        self,
        data: UserRegister,
    ) -> UserResponse:

        existing_user = await self.repository.get_by_email(
            data.email
        )

        if existing_user:
            raise ValueError(
                "User with this email already exists."
            )

        user = User(
            email=data.email,
            password_hash=hash_password(data.password),
            role=data.role,
        )

        created_user = await self.repository.create(
            user
        )

        return UserResponse.model_validate(
            created_user
        )

    async def login(
            self,
            data: UserLogin,
    ) -> Token:

        user = await self.repository.get_by_email(
            data.email,
        )

        if user is None:
            raise ValueError(
                "Invalid email or password."
            )

        if not verify_password(
                data.password,
                user.password_hash,
        ):
            raise ValueError(
                "Invalid email or password."
            )

        if not user.is_active:
            raise ValueError(
                "User is inactive."
            )

        access_token = create_access_token(
            subject=user.id,
        )

        return Token(
            access_token=access_token,
            token_type="bearer",
        )