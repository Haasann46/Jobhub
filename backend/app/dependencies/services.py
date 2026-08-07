from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.database import get_db

from backend.app.repositories.auth import AuthRepository
from backend.app.repositories.profile import ProfileRepository
from backend.app.repositories.company import CompanyRepository

from backend.app.services.auth import AuthService
from backend.app.services.profile import ProfileService
from backend.app.services.company import CompanyService


def get_auth_service(
    db: AsyncSession = Depends(get_db),
) -> AuthService:

    return AuthService(
        AuthRepository(db),
    )


def get_profile_service(
    db: AsyncSession = Depends(get_db),
) -> ProfileService:

    return ProfileService(
        ProfileRepository(db),
    )


def get_company_service(
    db: AsyncSession = Depends(get_db),
) -> CompanyService:

    return CompanyService(
        CompanyRepository(db),
    )