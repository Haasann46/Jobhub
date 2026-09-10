"""add complaints

Revision ID: dff975246894
Revises: 92cbaed75a12
Create Date: 2026-09-10 18:50:04.410664
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "dff975246894"
down_revision: Union[str, None] = "92cbaed75a12"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Применяет изменения к БД."""

    op.create_table(
        "complaints",

        sa.Column(
            "id",
            sa.Integer(),
            nullable=False,
        ),

        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),

        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),

        sa.Column(
            "reporter_id",
            sa.Integer(),
            nullable=False,
        ),

        sa.Column(
            "vacancy_id",
            sa.Integer(),
            nullable=False,
        ),

        sa.Column(
            "reason",
            sa.Enum(
                "SPAM",
                "SCAM",
                "FALSE_INFORMATION",
                "INAPPROPRIATE_CONTENT",
                "OTHER",
                name="complaintreason",
            ),
            nullable=False,
        ),

        sa.Column(
            "description",
            sa.Text(),
            nullable=True,
        ),

        sa.Column(
            "status",
            sa.Enum(
                "PENDING",
                "REVIEWING",
                "RESOLVED",
                "REJECTED",
                name="complaintstatus",
            ),
            nullable=False,
        ),

        sa.Column(
            "admin_id",
            sa.Integer(),
            nullable=True,
        ),

        sa.Column(
            "admin_comment",
            sa.Text(),
            nullable=True,
        ),

        sa.ForeignKeyConstraint(
            ["admin_id"],
            ["users.id"],
            ondelete="SET NULL",
        ),

        sa.ForeignKeyConstraint(
            ["reporter_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),

        sa.ForeignKeyConstraint(
            ["vacancy_id"],
            ["vacancies.id"],
            ondelete="CASCADE",
        ),

        sa.PrimaryKeyConstraint(
            "id",
        ),
    )

    op.create_index(
        op.f("ix_complaints_id"),
        "complaints",
        ["id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_complaints_reporter_id"),
        "complaints",
        ["reporter_id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_complaints_vacancy_id"),
        "complaints",
        ["vacancy_id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_complaints_admin_id"),
        "complaints",
        ["admin_id"],
        unique=False,
    )


def downgrade() -> None:
    """Откатывает изменения к БД."""

    op.drop_index(
        op.f("ix_complaints_admin_id"),
        table_name="complaints",
    )

    op.drop_index(
        op.f("ix_complaints_vacancy_id"),
        table_name="complaints",
    )

    op.drop_index(
        op.f("ix_complaints_reporter_id"),
        table_name="complaints",
    )

    op.drop_table(
        "complaints",
    )

    op.execute(
        "DROP TYPE IF EXISTS complaintstatus"
    )

    op.execute(
        "DROP TYPE IF EXISTS complaintreason"
    )