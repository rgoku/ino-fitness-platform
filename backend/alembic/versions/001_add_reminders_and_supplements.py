"""Initial migration: add reminders table and supplement_recommendations column.

Revision ID: 001_add_reminders_and_supplements
Revises: 
Create Date: 2025-11-22 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001_add_reminders_and_supplements'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create reminders table
    op.create_table(
        'reminders',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('remind_at', sa.DateTime(), nullable=False),
        sa.Column('repeat', sa.String(), nullable=True),
        sa.Column('channel', sa.String(), nullable=True, server_default='in-app'),
        sa.Column('sent', sa.Boolean(), nullable=True, server_default='0'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.Index('ix_reminders_user_id', 'user_id')
    )
    
    # Add supplement_recommendations column to diet_plans
    op.add_column('diet_plans', sa.Column('supplement_recommendations', sa.JSON(), nullable=True))


def downgrade() -> None:
    # Remove supplement_recommendations column from diet_plans
    op.drop_column('diet_plans', 'supplement_recommendations')
    
    # Drop reminders table
    op.drop_table('reminders')
