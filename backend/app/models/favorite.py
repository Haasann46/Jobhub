from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from backend.app.models.base import BaseModel


class Favorite(BaseModel):
    __tablename__ = "favorites"

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "vacancy_id",
            name="uq_user_favorite_vacancy",
        ),
    )

    user_id: Mapped[int] = mapped_column(
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