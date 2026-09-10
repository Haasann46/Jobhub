"""add invitations

Revision ID: 92cbaed75a12
Revises: 688cb2ce1cd0
Create Date: 2026-09-10 11:35:59.382799
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "92cbaed75a12"

down_revision: Union[str, None] = "688cb2ce1cd0"

branch_labels: Union[str, Sequence[str], None] = None

depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Применяет изменения к БД."""

    op.create_table(
        "invitations",

        sa.Column(
            "employer_id",
            sa.Integer(),
            nullable=False,
        ),

        sa.Column(
            "candidate_id",
            sa.Integer(),
            nullable=False,
        ),

        sa.Column(
            "vacancy_id",
            sa.Integer(),
            nullable=False,
        ),

        sa.Column(
            "message",
            sa.Text(),
            nullable=True,
        ),

        sa.Column(
            "status",
            sa.Enum(
                "PENDING",
                "ACCEPTED",
                "DECLINED",
                name="invitationstatus",
            ),
            nullable=False,
        ),

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

        sa.ForeignKeyConstraint(
            ["candidate_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),

        sa.ForeignKeyConstraint(
            ["employer_id"],
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
        op.f("ix_invitations_candidate_id"),
        "invitations",
        ["candidate_id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_invitations_employer_id"),
        "invitations",
        ["employer_id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_invitations_id"),
        "invitations",
        ["id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_invitations_status"),
        "invitations",
        ["status"],
        unique=False,
    )

    op.create_index(
        op.f("ix_invitations_vacancy_id"),
        "invitations",
        ["vacancy_id"],
        unique=False,
    )


def downgrade() -> None:
    """Откатывает изменения."""

    op.drop_index(
        op.f("ix_invitations_vacancy_id"),
        table_name="invitations",
    )

    op.drop_index(
        op.f("ix_invitations_status"),
        table_name="invitations",
    )

    op.drop_index(
        op.f("ix_invitations_id"),
        table_name="invitations",
    )

    op.drop_index(
        op.f("ix_invitations_employer_id"),
        table_name="invitations",
    )

    op.drop_index(
        op.f("ix_invitations_candidate_id"),
        table_name="invitations",
    )

    op.drop_table(
        "invitations",
    )