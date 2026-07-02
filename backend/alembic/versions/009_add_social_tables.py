"""No-op placeholder (schema comes from the consolidated baseline + startup create_all).

The bookings / challenges / challenge_participants tables are part of the models,
so the consolidated baseline (000_initial_schema, which runs create_all) builds
them on a fresh database, and the app's startup create_all safety net adds them
to any already-running database. A real create_table here would conflict with the
baseline, so this revision is intentionally a no-op — matching 007/008.

Revision ID: 009_add_social_tables
Revises: 008_add_refresh_tokens
"""

revision = "009_add_social_tables"
down_revision = "008_add_refresh_tokens"
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
