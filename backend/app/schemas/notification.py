from datetime import datetime

from pydantic import BaseModel, ConfigDict

from backend.app.models.enums import NotificationType


class NotificationResponse(BaseModel):
    id: int

    recipient_id: int

    sender_id: int | None
    sender_name: str | None

    type: NotificationType

    title: str

    message: str

    is_read: bool

    application_id: int | None

    conversation_id: int | None

    vacancy_id: int | None

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


class NotificationReadResponse(BaseModel):
    success: bool