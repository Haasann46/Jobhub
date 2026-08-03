from typing import Optional

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class Profile(BaseModel):
    __tablename__ = "profiles"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )

    first_name: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
    )

    last_name: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
    )

    phone: Mapped[Optional[str]] = mapped_column(
        String(20),
        unique=True,
        nullable=True,
    )

    avatar_url: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
    )

    bio: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    user: Mapped["User"] = relationship(
        back_populates="profile",
    )