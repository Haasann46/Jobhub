from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import EmploymentType, ExperienceLevel
from app.models.vacancy import Vacancy
from app.query_builders.vacancy_search import (
    apply_employment_type,
    apply_experience,
    apply_location,
    apply_remote,
    apply_salary,
    apply_search,
    apply_sort,
)
from app.schemas.vacancy import VacancySort


class VacancyRepository:
    def __init__(
        self,
        db: AsyncSession,
    ):
        self.db = db

    async def get_all(
        self,
    ) -> list[Vacancy]:
        result = await self.db.execute(
            select(Vacancy)
        )

        return list(result.scalars().all())

    async def get_active(
        self,
    ) -> list[Vacancy]:
        result = await self.db.execute(
            select(Vacancy).where(
                Vacancy.is_active.is_(True)
            )
        )

        return list(result.scalars().all())

    async def search(
        self,
        search: str | None,
        location: str | None,
        employment_type: EmploymentType | None,
        experience_level: ExperienceLevel | None,
        salary_from: int | None,
        salary_to: int | None,
        is_remote: bool | None,
        page: int,
        size: int,
        sort: VacancySort,
    ) -> tuple[list[Vacancy], int]:

        query = select(Vacancy).where(
            Vacancy.is_active.is_(True)
        )

        query = apply_search(
            query,
            search,
        )

        query = apply_location(
            query,
            location,
        )

        query = apply_employment_type(
            query,
            employment_type,
        )

        query = apply_experience(
            query,
            experience_level,
        )

        query = apply_salary(
            query,
            salary_from,
            salary_to,
        )

        query = apply_remote(
            query,
            is_remote,
        )

        count_query = select(
            func.count()
        ).select_from(
            query.subquery()
        )

        total = await self.db.scalar(
            count_query
        )

        query = apply_sort(
            query,
            sort,
        )

        query = query.offset(
            (page - 1) * size
        ).limit(
            size
        )

        result = await self.db.execute(
            query
        )

        vacancies = list(
            result.scalars().all()
        )

        return vacancies, total or 0

        total = await self.db.scalar(
            count_query
        )

        query = query.offset(
            (page - 1) * size
        ).limit(
            size
        )

        result = await self.db.execute(
            query
        )

        vacancies = list(
            result.scalars().all()
        )

        return vacancies, total or 0

    async def get_by_id(
        self,
        vacancy_id: int,
    ) -> Vacancy | None:

        result = await self.db.execute(
            select(Vacancy).where(
                Vacancy.id == vacancy_id
            )
        )

        return result.scalar_one_or_none()

    async def create(
        self,
        vacancy: Vacancy,
    ) -> Vacancy:

        self.db.add(vacancy)

        await self.db.commit()

        await self.db.refresh(vacancy)

        return vacancy

    async def update(
        self,
        vacancy: Vacancy,
    ) -> Vacancy:

        await self.db.commit()

        await self.db.refresh(vacancy)

        return vacancy

    async def delete(
        self,
        vacancy: Vacancy,
    ) -> None:

        await self.db.delete(vacancy)

        await self.db.commit()

    async def get_by_company_id(
        self,
        company_id: int,
    ) -> list[Vacancy]:

        result = await self.db.execute(
            select(Vacancy).where(
                Vacancy.company_id == company_id
            )
        )

        return list(
            result.scalars().all()
        )