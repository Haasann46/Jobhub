"""expand company fields

Revision ID: 430fd5d6de1f
Revises: 001b6c648e97
Create Date: 2026-08-25 17:15:42.411465
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "430fd5d6de1f"

down_revision: Union[str, None] = "001b6c648e97"

branch_labels: Union[str, Sequence[str], None] = None

depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Добавляет дополнительные поля компании."""

    op.add_column(
        "companies",
        sa.Column(
            "size",
            sa.String(length=100),
            nullable=True,
        ),
    )

    op.add_column(
        "companies",
        sa.Column(
            "address",
            sa.String(length=500),
            nullable=True,
        ),
    )

    op.add_column(
        "companies",
        sa.Column(
            "industry",
            sa.String(length=255),
            nullable=True,
        ),
    )


def downgrade() -> None:
    """Удаляет дополнительные поля компании."""

    op.drop_column(
        "companies",
        "industry",
    )

    op.drop_column(
        "companies",
        "address",
    )

    op.drop_column(
        "companies",
        "size",
    )