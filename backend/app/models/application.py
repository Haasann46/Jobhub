from typing import TYPE_CHECKING

from sqlalchemy import (
    Enum as SqlEnum,
    ForeignKey,
    Text,
    UniqueConstraint,
)

from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.models.base import BaseModel
from backend.app.models.enums import ApplicationStatus


if TYPE_CHECKING:
    from backend.app.models.resume import Resume
    from backend.app.models.user import User


class Application(BaseModel):
    __tablename__ = "applications"

    __table_args__ = (
        UniqueConstraint(
            "candidate_id",
            "vacancy_id",
            name="uq_candidate_vacancy",
        ),
    )

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

    resume_id: Mapped[int] = mapped_column(
        ForeignKey(
            "resumes.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
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

    resume: Mapped["Resume"] = relationship(
        "Resume",
        lazy="joined",
    )

    candidate: Mapped["User"] = relationship(
        "User",
        lazy="joined",
    )