"""add resume to applications

Revision ID: 09f696ece78b
Revises: cdd19f1ce52e
Create Date: 2026-08-08 13:36:16.333287
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "09f696ece78b"

down_revision: Union[str, None] = "cdd19f1ce52e"

branch_labels: Union[str, Sequence[str], None] = None

depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    op.add_column(
        "applications",
        sa.Column(
            "resume_id",
            sa.Integer(),
            nullable=True,
        ),
    )

    op.create_foreign_key(
        "fk_applications_resume_id_resumes",
        "applications",
        "resumes",
        ["resume_id"],
        ["id"],
        ondelete="RESTRICT",
    )


def downgrade() -> None:

    op.drop_constraint(
        "fk_applications_resume_id_resumes",
        "applications",
        type_="foreignkey",
    )

    op.drop_column(
        "applications",
        "resume_id",
    )