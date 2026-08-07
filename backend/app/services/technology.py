from fastapi import HTTPException, status

from backend.app.models.technology import Technology
from backend.app.repositories.technology import TechnologyRepository


class TechnologyService:
    def __init__(
        self,
        repository: TechnologyRepository,
    ):
        self.repository = repository

    async def get_all(
        self,
    ) -> list[Technology]:

        return await self.repository.get_all()

    async def get_by_id(
        self,
        technology_id: int,
    ) -> Technology:

        technology = await self.repository.get_by_id(
            technology_id,
        )

        if technology is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Technology not found.",
            )

        return technology

    async def create(
        self,
        name: str,
        slug: str,
    ) -> Technology:

        existing = await self.repository.get_by_slug(
            slug,
        )

        if existing is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Technology already exists.",
            )

        technology = Technology(
            name=name,
            slug=slug,
        )

        return await self.repository.create(
            technology,
        )