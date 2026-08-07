from fastapi import HTTPException, status

from backend.app.models.company import Company
from backend.app.models.enums import UserRole
from backend.app.models.user import User
from backend.app.repositories.company import CompanyRepository
from backend.app.schemas.company import (
    CompanyCreate,
    CompanyResponse,
    CompanyUpdate,
)


class CompanyService:

    def __init__(
        self,
        repository: CompanyRepository,
    ):
        self.repository = repository

    async def create(
        self,
        current_user: User,
        data: CompanyCreate,
    ) -> CompanyResponse:

        if current_user.role != UserRole.EMPLOYER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only employers can create companies.",
            )

        existing = await self.repository.get_by_owner_id(
            current_user.id,
        )

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Company already exists.",
            )

        company_data = data.model_dump(mode="json")

        company = Company(
            owner_id=current_user.id,
            **company_data,
        )

        company = await self.repository.create(
            company,
        )

        return CompanyResponse.model_validate(
            company,
        )

    async def get_me(
        self,
        current_user: User,
    ) -> CompanyResponse:

        company = await self.repository.get_by_owner_id(
            current_user.id,
        )

        if company is None:
            raise HTTPException(
                status_code=404,
                detail="Company not found.",
            )

        return CompanyResponse.model_validate(
            company,
        )

    async def update(
        self,
        current_user: User,
        data: CompanyUpdate,
    ) -> CompanyResponse:

        company = await self.repository.get_by_owner_id(
            current_user.id,
        )

        if company is None:
            raise HTTPException(
                status_code=404,
                detail="Company not found.",
            )

        for field, value in data.model_dump(
            exclude_unset=True,
        ).items():
            setattr(
                company,
                field,
                value,
            )

        company = await self.repository.update(
            company,
        )

        return CompanyResponse.model_validate(
            company,
        )