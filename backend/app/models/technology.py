from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.models.base import BaseModel


class Technology(BaseModel):
    __tablename__ = "technologies"

    name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=False,
    )

    slug: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=False,
    )

    vacancies: Mapped[list["Vacancy"]] = relationship(
        secondary="vacancy_technologies",
        back_populates="technologies",
    )