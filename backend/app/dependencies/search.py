from fastapi import Query

from app.models.enums import (
    EmploymentType,
    ExperienceLevel,
)
from app.schemas.vacancy import (
    VacancySearchParams,
    VacancySort,
)


def get_search_params(
    search: str | None = Query(
        default=None,
        description="Search by title or description.",
    ),
    location: str | None = Query(
        default=None,
        description="Vacancy location.",
    ),
    employment_type: EmploymentType | None = Query(
        default=None,
    ),
    experience_level: ExperienceLevel | None = Query(
        default=None,
    ),
    salary_from: int | None = Query(
        default=None,
        ge=0,
    ),
    salary_to: int | None = Query(
        default=None,
        ge=0,
    ),
    is_remote: bool | None = Query(
        default=None,
    ),
    page: int = Query(
        default=1,
        ge=1,
    ),
    size: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
    sort: VacancySort = Query(
        default=VacancySort.NEWEST,
    ),
) -> VacancySearchParams:

    return VacancySearchParams(
        search=search,
        location=location,
        employment_type=employment_type,
        experience_level=experience_level,
        salary_from=salary_from,
        salary_to=salary_to,
        is_remote=is_remote,
        page=page,
        size=size,
        sort=sort,
    )