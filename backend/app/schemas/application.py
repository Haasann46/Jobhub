from datetime import datetime

from pydantic import BaseModel, ConfigDict

from backend.app.models.enums import ApplicationStatus


class ApplicationCreate(BaseModel):
    resume_id: int
    cover_letter: str | None = None


class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus


class ApplicationResponse(BaseModel):
    id: int

    candidate_id: int
    vacancy_id: int
    resume_id: int

    cover_letter: str | None

    status: ApplicationStatus

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


class ApplicationResumeResponse(BaseModel):
    id: int

    title: str
    desired_position: str

    about: str | None
    city: str | None

    salary_expectation: int | None

    is_active: bool

    model_config = ConfigDict(
        from_attributes=True,
    )


class EmployerApplicationResponse(BaseModel):
    id: int

    candidate_id: int
    candidate_email: str

    vacancy_id: int

    resume: ApplicationResumeResponse

    cover_letter: str | None

    status: ApplicationStatus

    created_at: datetime
    updated_at: datetime

class EmployerApplicationCountResponse(BaseModel):
    total: int