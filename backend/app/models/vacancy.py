from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.models.base import BaseModel
from backend.app.models.enums import (
    EmploymentType,
    ExperienceLevel,
    VacancyCategory,
)


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

    category: Mapped[VacancyCategory] = mapped_column(
        Enum(VacancyCategory),
        nullable=False,
        default=VacancyCategory.BACKEND,
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

    published_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    company_id: Mapped[int] = mapped_column(
        ForeignKey(
            "companies.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    company: Mapped["Company"] = relationship(
        back_populates="vacancies",
    )

    technologies: Mapped[list["Technology"]] = relationship(
        secondary="vacancy_technologies",
        back_populates="vacancies",
    )