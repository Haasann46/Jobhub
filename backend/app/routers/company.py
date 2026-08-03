from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.current_user import get_current_user
from app.models.user import User
from app.repositories.company import CompanyRepository
from app.schemas.company import (
    CompanyCreate,
    CompanyResponse,
    CompanyUpdate,
)
from app.services.company import CompanyService

router = APIRouter()


def get_company_service(
    db: AsyncSession = Depends(get_db),
) -> CompanyService:
    repository = CompanyRepository(db)
    return CompanyService(repository)


@router.post(
    "",
    response_model=CompanyResponse,
    status_code=201,
)
async def create_company(
    data: CompanyCreate,
    current_user: User = Depends(get_current_user),
    service: CompanyService = Depends(get_company_service),
):
    return await service.create(
        current_user,
        data,
    )


@router.get(
    "/me",
    response_model=CompanyResponse,
)
async def get_my_company(
    current_user: User = Depends(get_current_user),
    service: CompanyService = Depends(get_company_service),
):
    return await service.get_me(
        current_user,
    )


@router.put(
    "/me",
    response_model=CompanyResponse,
)
async def update_my_company(
    data: CompanyUpdate,
    current_user: User = Depends(get_current_user),
    service: CompanyService = Depends(get_company_service),
):
    return await service.update(
        current_user,
        data,
    )