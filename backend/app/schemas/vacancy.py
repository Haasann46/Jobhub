from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
)

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

    requirements: str

    responsibilities: str

    category: VacancyCategory

    location: str

    employment_type: EmploymentType

    experience_level: ExperienceLevel

    salary_from: Optional[int] = None

    salary_to: Optional[int] = None

    currency: str = "USD"

    is_remote: bool = False

    @field_validator(
        "description",
        "requirements",
        "responsibilities",
    )
    @classmethod
    def validate_required_text(
        cls,
        value: str,
    ) -> str:

        value = value.strip()

        if not value:

            raise ValueError(
                "Поле обязательно для заполнения.",
            )

        return value


class VacancyCreate(VacancyBase):

    technology_ids: list[int] = Field(
        default_factory=list,
    )


class VacancyUpdate(BaseModel):

    title: Optional[str] = None

    description: Optional[str] = None

    requirements: Optional[str] = None

    responsibilities: Optional[str] = None

    category: Optional[VacancyCategory] = None

    location: Optional[str] = None

    employment_type: Optional[EmploymentType] = None

    experience_level: Optional[ExperienceLevel] = None

    salary_from: Optional[int] = None

    salary_to: Optional[int] = None

    currency: Optional[str] = None

    is_remote: Optional[bool] = None

    is_active: Optional[bool] = None

    technology_ids: Optional[list[int]] = None

    @field_validator(
        "description",
        "requirements",
        "responsibilities",
    )
    @classmethod
    def validate_required_text(
        cls,
        value: str | None,
    ) -> str | None:

        if value is None:

            return None

        value = value.strip()

        if not value:

            raise ValueError(
                "Поле обязательно для заполнения.",
            )

        return value


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

    is_active: bool

    technologies: list[TechnologyResponse] = Field(
        default_factory=list,
    )


class VacancyListResponse(BaseModel):

    items: list[VacancyResponse]

    total: int

    page: int

    size: int

    pages: int

    has_next: bool

    has_previous: bool