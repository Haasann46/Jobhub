"""expand candidate profile

Revision ID: 001b6c648e97
Revises: d9a0d0b595ec
Create Date: 2026-08-23 20:46:44.181939
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "001b6c648e97"
down_revision: Union[str, None] = "d9a0d0b595ec"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Применяет изменения к БД."""

    op.add_column(
        "profiles",
        sa.Column(
            "city",
            sa.String(length=255),
            nullable=True,
        ),
    )

    op.add_column(
        "profiles",
        sa.Column(
            "github_url",
            sa.String(length=500),
            nullable=True,
        ),
    )

    op.add_column(
        "profiles",
        sa.Column(
            "linkedin_url",
            sa.String(length=500),
            nullable=True,
        ),
    )

    op.add_column(
        "profiles",
        sa.Column(
            "skills",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'[]'::jsonb"),
        ),
    )

    op.add_column(
        "profiles",
        sa.Column(
            "experience",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'[]'::jsonb"),
        ),
    )

    op.add_column(
        "profiles",
        sa.Column(
            "education",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'[]'::jsonb"),
        ),
    )

    op.add_column(
        "profiles",
        sa.Column(
            "languages",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'[]'::jsonb"),
        ),
    )

    op.add_column(
        "profiles",
        sa.Column(
            "projects",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'[]'::jsonb"),
        ),
    )

    op.alter_column(
        "profiles",
        "skills",
        server_default=None,
    )

    op.alter_column(
        "profiles",
        "experience",
        server_default=None,
    )

    op.alter_column(
        "profiles",
        "education",
        server_default=None,
    )

    op.alter_column(
        "profiles",
        "languages",
        server_default=None,
    )

    op.alter_column(
        "profiles",
        "projects",
        server_default=None,
    )


def downgrade() -> None:
    """Откатывает изменения."""

    op.drop_column(
        "profiles",
        "projects",
    )

    op.drop_column(
        "profiles",
        "languages",
    )

    op.drop_column(
        "profiles",
        "education",
    )

    op.drop_column(
        "profiles",
        "experience",
    )

    op.drop_column(
        "profiles",
        "skills",
    )

    op.drop_column(
        "profiles",
        "linkedin_url",
    )

    op.drop_column(
        "profiles",
        "github_url",
    )

    op.drop_column(
        "profiles",
        "city",
    )