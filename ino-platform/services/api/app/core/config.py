"""Application configuration from environment variables."""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    DEBUG: bool = False
    SECRET_KEY: str = "CHANGE-ME-IN-PRODUCTION"
    API_VERSION: str = "v1"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://ino:ino@localhost:5432/ino"
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

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
