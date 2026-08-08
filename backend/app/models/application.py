from sqlalchemy import (
    Enum as SqlEnum,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column

from backend.app.models.base import BaseModel
from backend.app.models.enums import ApplicationStatus


class Application(BaseModel):
    __tablename__ = "applications"

    candidate_id: Mapped[int] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    vacancy_id: Mapped[int] = mapped_column(
        ForeignKey(
            "vacancies.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    resume_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "resumes.id",
            ondelete="RESTRICT",
        ),
        nullable=True,
    )

    cover_letter: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    status: Mapped[ApplicationStatus] = mapped_column(
        SqlEnum(ApplicationStatus),
        default=ApplicationStatus.NEW,
        nullable=False,
    )