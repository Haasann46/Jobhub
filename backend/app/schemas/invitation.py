from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
)

from backend.app.models.enums import InvitationStatus


class InvitationCreate(BaseModel):

    candidate_email: EmailStr

    vacancy_id: int

    message: str | None = Field(
        default=None,
        max_length=2000,
    )


class InvitationResponse(BaseModel):

    id: int

    employer_id: int

    candidate_id: int

    vacancy_id: int

    message: str | None

    status: InvitationStatus

    candidate_email: str

    candidate_name: str | None

    employer_email: str

    vacancy_title: str

    company_name: str

    created_at: datetime

    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )