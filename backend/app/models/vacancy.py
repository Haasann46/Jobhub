from typing import Optional

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel
from app.models.enums import EmploymentType, ExperienceLevel
from sqlalchemy import Enum

class Vacancy(BaseModel):
    __tablename__ = "vacancies"

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    location: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    employment_type: Mapped[EmploymentType] = mapped_column(
        Enum(EmploymentType),
        nullable=False,
    )

    experience_level: Mapped[ExperienceLevel] = mapped_column(
        Enum(ExperienceLevel),
        nullable=False,
    )

    salary_from: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )

    salary_to: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )

    is_remote: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id", ondelete="CASCADE"),
        nullable=False,
    )

    company: Mapped["Company"] = relationship(
        back_populates="vacancies",
    )