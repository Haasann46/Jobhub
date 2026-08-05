"""add resumes table

Revision ID: 85d6262213f2
Revises: 5ad35647d672
Create Date: 2026-08-05 11:55:11.588112
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = '85d6262213f2'
down_revision: Union[str, None] = '5ad35647d672'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('resumes',
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('title', sa.String(length=255), nullable=False),
    sa.Column('desired_position', sa.String(length=255), nullable=False),
    sa.Column('about', sa.Text(), nullable=True),
    sa.Column('city', sa.String(length=255), nullable=True),
    sa.Column('salary_expectation', sa.Integer(), nullable=True),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_resumes_id'), 'resumes', ['id'], unique=False)



def downgrade() -> None:
    """Откатывает изменения."""
    op.drop_index(op.f('ix_resumes_id'), table_name='resumes')
    op.drop_table('resumes')

