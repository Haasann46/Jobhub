from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models.enums import EmploymentType, ExperienceLevel


class VacancyBase(BaseModel):
    title: str
    description: str
    location: str

    employment_type: EmploymentType
    experience_level: ExperienceLevel

    salary_from: Optional[int] = None
    salary_to: Optional[int] = None

    is_remote: bool = False


class VacancyCreate(VacancyBase):
    pass


class VacancyUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None

    employment_type: Optional[EmploymentType] = None
    experience_level: Optional[ExperienceLevel] = None

    salary_from: Optional[int] = None
    salary_to: Optional[int] = None

    is_remote: Optional[bool] = None
    is_active: Optional[bool] = None


class VacancyResponse(VacancyBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int