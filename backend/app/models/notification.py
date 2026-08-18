from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    Enum as SqlEnum,
    ForeignKey,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.models.base import BaseModel
from backend.app.models.enums import NotificationType


if TYPE_CHECKING:
    from backend.app.models.application import Application
    from backend.app.models.conversation import Conversation
    from backend.app.models.user import User
    from backend.app.models.vacancy import Vacancy


class Notification(BaseModel):
    __tablename__ = "notifications"

    recipient_id: Mapped[int] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    sender_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )

    sender_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    type: Mapped[NotificationType] = mapped_column(
        SqlEnum(NotificationType),
        nullable=False,
        index=True,
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    message: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    is_read: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        index=True,
    )

    application_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "applications.id",
            ondelete="CASCADE",
        ),
        nullable=True,
        index=True,
    )

    conversation_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "conversations.id",
            ondelete="CASCADE",
        ),
        nullable=True,
        index=True,
    )

    vacancy_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "vacancies.id",
            ondelete="CASCADE",
        ),
        nullable=True,
        index=True,
    )

    recipient: Mapped["User"] = relationship(
        "User",
        foreign_keys=[recipient_id],
        lazy="joined",
    )

    sender: Mapped["User | None"] = relationship(
        "User",
        foreign_keys=[sender_id],
        lazy="joined",
    )

    application: Mapped["Application | None"] = relationship(
        "Application",
        lazy="joined",
    )

    conversation: Mapped["Conversation | None"] = relationship(
        "Conversation",
        lazy="joined",
    )

    vacancy: Mapped["Vacancy | None"] = relationship(
        "Vacancy",
        lazy="joined",
    )