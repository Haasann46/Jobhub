from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict

from backend.app.models.enums import (
    EmploymentType,
    ExperienceLevel,
    VacancyCategory,
)
from backend.app.schemas.technology import (
    TechnologyResponse,
)


class VacancySort(str, Enum):
    NEWEST = "newest"
    OLDEST = "oldest"
    SALARY_ASC = "salary_asc"
    SALARY_DESC = "salary_desc"


class VacancySearchParams(BaseModel):
    search: str | None = None

    location: str | None = None

    category: VacancyCategory | None = None

    employment_type: EmploymentType | None = None

    experience_level: ExperienceLevel | None = None

    salary_from: int | None = None

    salary_to: int | None = None

    is_remote: bool | None = None

    page: int = 1

    size: int = 20

    sort: VacancySort = VacancySort.NEWEST


class VacancyBase(BaseModel):
    title: str

    description: str

    category: VacancyCategory

    location: str

    employment_type: EmploymentType

    experience_level: ExperienceLevel

    salary_from: Optional[int] = None

    salary_to: Optional[int] = None

    is_remote: bool = False


class VacancyCreate(VacancyBase):
    technology_ids: list[int] = []


class VacancyUpdate(BaseModel):
    title: Optional[str] = None

    description: Optional[str] = None

    category: Optional[VacancyCategory] = None

    location: Optional[str] = None

    employment_type: Optional[EmploymentType] = None

    experience_level: Optional[ExperienceLevel] = None

    salary_from: Optional[int] = None

    salary_to: Optional[int] = None

    is_remote: Optional[bool] = None

    is_active: Optional[bool] = None

    technology_ids: Optional[list[int]] = None


class TechnologyResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int
    name: str
    slug: str


class VacancyResponse(VacancyBase):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int

    company_id: int

    company_name: str

    company_logo: str | None = None

    published_at: datetime

    technologies: list[TechnologyResponse] = []

class VacancyListResponse(BaseModel):
    items: list[VacancyResponse]

    total: int

    page: int

    size: int

    pages: int

    has_next: bool

    has_previous: bool