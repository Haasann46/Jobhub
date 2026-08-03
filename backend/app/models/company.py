from typing import Optional

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class Company(BaseModel):
    __tablename__ = "companies"

    name: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )

    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    website: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )

    logo_url: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
    )

    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    owner: Mapped["User"] = relationship(
        back_populates="companies",
    )

    vacancies: Mapped[list["Vacancy"]] = relationship(
        back_populates="company",
        cascade="all, delete-orphan",
    )