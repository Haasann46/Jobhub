from sqlalchemy import Select
from sqlalchemy import or_

from app.models.enums import (
    EmploymentType,
    ExperienceLevel,
)
from app.models.vacancy import Vacancy
from app.schemas.vacancy import VacancySort


def apply_search(
    query: Select,
    search: str | None,
) -> Select:

    if search:
        query = query.where(
            or_(
                Vacancy.title.ilike(f"%{search}%"),
                Vacancy.description.ilike(f"%{search}%"),
            )
        )

    return query


def apply_location(
    query: Select,
    location: str | None,
) -> Select:

    if location:
        query = query.where(
            Vacancy.location.ilike(
                f"%{location}%"
            )
        )

    return query


def apply_employment_type(
    query: Select,
    employment_type: EmploymentType | None,
) -> Select:

    if employment_type:
        query = query.where(
            Vacancy.employment_type == employment_type
        )

    return query


def apply_experience(
    query: Select,
    experience_level: ExperienceLevel | None,
) -> Select:

    if experience_level:
        query = query.where(
            Vacancy.experience_level == experience_level
        )

    return query


def apply_remote(
    query: Select,
    is_remote: bool | None,
) -> Select:

    if is_remote is not None:
        query = query.where(
            Vacancy.is_remote == is_remote
        )

    return query


def apply_salary(
    query: Select,
    salary_from: int | None,
    salary_to: int | None,
) -> Select:

    if salary_from is not None:
        query = query.where(
            Vacancy.salary_to >= salary_from
        )

    if salary_to is not None:
        query = query.where(
            Vacancy.salary_from <= salary_to
        )

    return query


def apply_sort(
    query: Select,
    sort: VacancySort,
) -> Select:

    if sort == VacancySort.OLDEST:
        return query.order_by(
            Vacancy.created_at.asc()
        )

    if sort == VacancySort.SALARY_ASC:
        return query.order_by(
            Vacancy.salary_from.asc()
        )

    if sort == VacancySort.SALARY_DESC:
        return query.order_by(
            Vacancy.salary_to.desc()
        )

    return query.order_by(
        Vacancy.created_at.desc()
    )