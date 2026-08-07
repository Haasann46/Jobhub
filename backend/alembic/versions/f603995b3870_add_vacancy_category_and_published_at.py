"""add vacancy category and published_at

Revision ID: f603995b3870
Revises: 5145d4c4a6b2
Create Date: 2026-08-06 15:04:43.300071
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f603995b3870"
down_revision: Union[str, None] = "5145d4c4a6b2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


vacancy_category = sa.Enum(
    "BACKEND",
    "FRONTEND",
    "DEVOPS",
    "MOBILE",
    "QA",
    "DESIGN",
    "AI",
    "DATA",
    name="vacancycategory",
)


def upgrade() -> None:
    """Применяет изменения к БД."""

    # Создаем PostgreSQL ENUM
    vacancy_category.create(op.get_bind(), checkfirst=True)

    # Добавляем category
    op.add_column(
        "vacancies",
        sa.Column(
            "category",
            vacancy_category,
            nullable=False,
            server_default="BACKEND",
        ),
    )

    # После заполнения существующих записей убираем default
    op.alter_column(
        "vacancies",
        "category",
        server_default=None,
    )

    # Добавляем published_at
    op.add_column(
        "vacancies",
        sa.Column(
            "published_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )


def downgrade() -> None:
    """Откатывает изменения."""

    op.drop_column("vacancies", "published_at")
    op.drop_column("vacancies", "category")

    vacancy_category.drop(op.get_bind(), checkfirst=True)