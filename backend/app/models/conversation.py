from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.models.base import BaseModel


if TYPE_CHECKING:
    from backend.app.models.application import Application
    from backend.app.models.message import Message


class Conversation(BaseModel):
    __tablename__ = "conversations"

    application_id: Mapped[int] = mapped_column(
        ForeignKey(
            "applications.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        unique=True,
    )

    application: Mapped["Application"] = relationship(
        "Application",
        lazy="joined",
    )

    messages: Mapped[list["Message"]] = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="Message.created_at",
    )