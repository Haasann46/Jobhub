from typing import TYPE_CHECKING

from sqlalchemy import (
    Enum,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from backend.app.models.base import BaseModel
from backend.app.models.enums import (
    ComplaintReason,
    ComplaintStatus,
)

if TYPE_CHECKING:

    from backend.app.models.user import User
    from backend.app.models.vacancy import Vacancy


class Complaint(BaseModel):

    __tablename__ = "complaints"


    reporter_id: Mapped[int] = mapped_column(
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


    reason: Mapped[ComplaintReason] = mapped_column(
        Enum(
            ComplaintReason,
        ),
        nullable=False,
    )


    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )


    status: Mapped[ComplaintStatus] = mapped_column(
        Enum(
            ComplaintStatus,
        ),
        nullable=False,
        default=ComplaintStatus.PENDING,
    )


    admin_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )


    admin_comment: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )


    reporter: Mapped["User"] = relationship(
        "User",
        foreign_keys=[reporter_id],
    )


    vacancy: Mapped["Vacancy"] = relationship(
        "Vacancy",
    )


    admin: Mapped["User | None"] = relationship(
        "User",
        foreign_keys=[admin_id],
    )