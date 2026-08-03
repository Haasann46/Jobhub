from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.enums import UserRole


# ==========================================================
# Регистрация
# ==========================================================

class UserRegister(BaseModel):
    email: EmailStr

    password: str = Field(
        min_length=8,
        max_length=100,
    )

    role: UserRole = UserRole.CANDIDATE


# ==========================================================
# Вход
# ==========================================================

class UserLogin(BaseModel):
    email: EmailStr

    password: str


# ==========================================================
# Ответ после регистрации
# ==========================================================

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int

    email: EmailStr

    role: UserRole

    is_active: bool

    is_verified: bool


# ==========================================================
# JWT Token
# ==========================================================

class Token(BaseModel):
    access_token: str

    token_type: str = "bearer"


# ==========================================================
# JWT Payload
# ==========================================================

class TokenPayload(BaseModel):
    sub: str | None = None