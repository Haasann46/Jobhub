from typing import TYPE_CHECKING

from sqlalchemy import (
    Enum as SqlEnum,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from backend.app.models.base import BaseModel
from backend.app.models.enums import InvitationStatus


if TYPE_CHECKING:
    from backend.app.models.user import User
    from backend.app.models.vacancy import Vacancy


class Invitation(BaseModel):
    __tablename__ = "invitations"

    employer_id: Mapped[int] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    candidate_id: Mapped[int] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    vacancy_id: Mapped[int] = mapped_column(
        ForeignKey(
            "vacancies.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    message: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    status: Mapped[InvitationStatus] = mapped_column(
        SqlEnum(InvitationStatus),
        default=InvitationStatus.PENDING,
        nullable=False,
        index=True,
    )

    employer: Mapped["User"] = relationship(
        "User",
        foreign_keys=[employer_id],
        lazy="joined",
    )

    candidate: Mapped["User"] = relationship(
        "User",
        foreign_keys=[candidate_id],
        lazy="joined",
    )

    vacancy: Mapped["Vacancy"] = relationship(
        "Vacancy",
        lazy="joined",
    )