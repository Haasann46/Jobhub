"""add full vacancy fields

Revision ID: 204b68983c37
Revises: 430fd5d6de1f
Create Date: 2026-08-26
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "204b68983c37"

down_revision: Union[str, None] = "430fd5d6de1f"

branch_labels: Union[str, Sequence[str], None] = None

depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ==========================================================================
    # Add new columns temporarily as nullable
    # ==========================================================================

    op.add_column(
        "vacancies",
        sa.Column(
            "requirements",
            sa.Text(),
            nullable=True,
        ),
    )

    op.add_column(
        "vacancies",
        sa.Column(
            "responsibilities",
            sa.Text(),
            nullable=True,
        ),
    )

    op.add_column(
        "vacancies",
        sa.Column(
            "currency",
            sa.String(length=10),
            nullable=True,
        ),
    )

    # ==========================================================================
    # Fill existing vacancies
    # ==========================================================================

    op.execute(
        """
        UPDATE vacancies
        SET
            requirements = description,
            responsibilities = description,
            currency = 'USD'
        WHERE
            requirements IS NULL
            OR responsibilities IS NULL
            OR currency IS NULL
        """
    )

    # ==========================================================================
    # Make fields required
    # ==========================================================================

    op.alter_column(
        "vacancies",
        "requirements",
        existing_type=sa.Text(),
        nullable=False,
    )

    op.alter_column(
        "vacancies",
        "responsibilities",
        existing_type=sa.Text(),
        nullable=False,
    )

    op.alter_column(
        "vacancies",
        "currency",
        existing_type=sa.String(length=10),
        nullable=False,
    )


def downgrade() -> None:
    op.drop_column(
        "vacancies",
        "currency",
    )

    op.drop_column(
        "vacancies",
        "responsibilities",
    )

    op.drop_column(
        "vacancies",
        "requirements",
    )