from fastapi import (
    APIRouter,
    Depends,
    status,
)
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.database import get_db
from backend.app.dependencies.current_user import get_current_user
from backend.app.models.user import User
from backend.app.repositories.company import CompanyRepository
from backend.app.schemas.company import (
    CompanyCreate,
    CompanyResponse,
    CompanyUpdate,
)
from backend.app.services.company import CompanyService

router = APIRouter()


def get_company_service(
    db: AsyncSession = Depends(get_db),
) -> CompanyService:
    repository = CompanyRepository(db)
    return CompanyService(repository)


@router.post(
    "",
    response_model=CompanyResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_company(
    data: CompanyCreate,
    current_user: User = Depends(
        get_current_user,
    ),
    service: CompanyService = Depends(
        get_company_service,
    ),
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
    current_user: User = Depends(
        get_current_user,
    ),
    service: CompanyService = Depends(
        get_company_service,
    ),
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
    current_user: User = Depends(
        get_current_user,
    ),
    service: CompanyService = Depends(
        get_company_service,
    ),
):
    return await service.update(
        current_user,
        data,
    )