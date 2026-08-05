from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ResumeCreate(BaseModel):
    title: str
    desired_position: str
    about: str | None = None
    city: str | None = None
    salary_expectation: int | None = None


class ResumeUpdate(BaseModel):
    title: str | None = None
    desired_position: str | None = None
    about: str | None = None
    city: str | None = None
    salary_expectation: int | None = None
    is_active: bool | None = None


class ResumeResponse(BaseModel):
    id: int

    user_id: int

    title: str
    desired_position: str

    about: str | None
    city: str | None

    salary_expectation: int | None

    is_active: bool

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )