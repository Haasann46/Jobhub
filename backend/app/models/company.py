from typing import TYPE_CHECKING, Optional

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.models.base import BaseModel


if TYPE_CHECKING:
    from backend.app.models.user import User
    from backend.app.models.vacancy import Vacancy


class Company(BaseModel):
    __tablename__ = "companies"

    name: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    website: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )

    logo_url: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
    )

    size: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
    )

    address: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
    )

    industry: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )

    owner_id: Mapped[int] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    owner: Mapped["User"] = relationship(
        back_populates="companies",
    )

    vacancies: Mapped[list["Vacancy"]] = relationship(
        back_populates="company",
        cascade="all, delete-orphan",
    )