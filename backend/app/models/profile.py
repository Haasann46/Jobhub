from typing import TYPE_CHECKING, Optional

from sqlalchemy import JSON, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.models.base import BaseModel


if TYPE_CHECKING:
    from backend.app.models.user import User


class Profile(BaseModel):
    __tablename__ = "profiles"

    user_id: Mapped[int] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
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

    city: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )

    github_url: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
    )

    linkedin_url: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
    )

    skills: Mapped[list] = mapped_column(
        JSON,
        nullable=False,
        default=list,
    )

    experience: Mapped[list] = mapped_column(
        JSON,
        nullable=False,
        default=list,
    )

    education: Mapped[list] = mapped_column(
        JSON,
        nullable=False,
        default=list,
    )

    languages: Mapped[list] = mapped_column(
        JSON,
        nullable=False,
        default=list,
    )

    projects: Mapped[list] = mapped_column(
        JSON,
        nullable=False,
        default=list,
    )

    user: Mapped["User"] = relationship(
        back_populates="profile",
    )