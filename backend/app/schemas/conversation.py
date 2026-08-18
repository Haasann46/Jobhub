from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ConversationCreate(BaseModel):
    application_id: int


class ConversationResponse(BaseModel):
    id: int

    application_id: int

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


class ConversationListItem(BaseModel):
    id: int

    application_id: int

    other_user_id: int
    other_user_email: str

    vacancy_id: int
    vacancy_title: str

    unread_count: int

    last_message: str | None
    last_message_at: datetime | None

    created_at: datetime
    updated_at: datetime