"""Application configuration from environment variables."""
import logging
import sys

from pydantic_settings import BaseSettings

_INSECURE_DEFAULTS = {"CHANGE-ME-IN-PRODUCTION", "changeme", "secret", ""}


class Settings(BaseSettings):
    # App
    DEBUG: bool = False
    ENVIRONMENT: str = "development"
    SECRET_KEY: str = "CHANGE-ME-IN-PRODUCTION"
    API_VERSION: str = "v1"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://ino:ino@localhost:5432/ino"
    DATABASE_POOL_SIZE: int = 50
    DATABASE_MAX_OVERFLOW: int = 25
    REDIS_URL: str = "redis://localhost:6379/0"

    # Auth
    JWT_SECRET: str = "CHANGE-ME-IN-PRODUCTION"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # Storage
    S3_BUCKET: str = "ino-media"
    S3_REGION: str = "us-east-1"
    S3_ENDPOINT: str | None = None          # for local MinIO
    VIDEO_RETENTION_DAYS: int = 90

    # Stripe
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PRICE_STARTER_MONTHLY: str = ""
    STRIPE_PRICE_PRO_MONTHLY: str = ""
    STRIPE_PRICE_SCALE_MONTHLY: str = ""

    # AI
    ANTHROPIC_API_KEY: str = ""

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",             # coach-web
        "http://localhost:3001",             # landing
        "http://localhost:8081",             # fit-mobile (Expo)
    ]

    # Limits
    MAX_CLIENTS_STARTER: int = 20
    MAX_CLIENTS_PRO: int = 50
    MAX_CLIENTS_SCALE: int = 999

    # Sentry
    SENTRY_DSN: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


    def validate_production_secrets(self) -> None:
        """Abort startup if secrets are still set to insecure defaults in production."""
        if self.ENVIRONMENT in ("development", "test"):
            return

        errors: list[str] = []
        if self.SECRET_KEY in _INSECURE_DEFAULTS:
            errors.append("SECRET_KEY is set to an insecure default")
        if self.JWT_SECRET in _INSECURE_DEFAULTS:
            errors.append("JWT_SECRET is set to an insecure default")
        if len(self.JWT_SECRET) < 32:
            errors.append("JWT_SECRET must be at least 32 characters")
        if not self.STRIPE_WEBHOOK_SECRET:
            errors.append("STRIPE_WEBHOOK_SECRET is not configured")

        if errors:
            _logger = logging.getLogger(__name__)
            for e in errors:
                _logger.critical("STARTUP BLOCKED: %s", e)
            sys.exit(1)


settings = Settings()
settings.validate_production_secrets()
