from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
)

from backend.app.models.enums import (
    ComplaintReason,
    ComplaintStatus,
)


class ComplaintCreate(BaseModel):

    vacancy_id: int

    reason: ComplaintReason

    description: str | None = Field(
        default=None,
        max_length=2000,
    )


class ComplaintResponse(BaseModel):

    id: int

    reporter_id: int

    vacancy_id: int

    reason: ComplaintReason

    description: str | None

    status: ComplaintStatus

    admin_id: int | None

    admin_comment: str | None

    created_at: datetime

    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


class ComplaintAdminUpdate(BaseModel):

    status: ComplaintStatus

    admin_comment: str | None = Field(
        default=None,
        max_length=2000,
    )