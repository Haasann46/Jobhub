from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.database import get_db
from backend.app.repositories.auth import AuthRepository
from backend.app.services.auth import AuthService


def get_auth_service(
    db: AsyncSession = Depends(get_db),
) -> AuthService:

    repository = AuthRepository(db)

    return AuthService(repository)