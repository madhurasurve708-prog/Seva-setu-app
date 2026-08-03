from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str

    DATABASE_URL: str

    JWT_SECRET: str = Field(min_length=32)
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    BAD_WORDS: str = ""

    # Password distributed by the municipality. It must be supplied by the
    # deployment environment, never by a source-controlled fallback.
    DEPT_TEMP_PASSWORD: str = ""
    # Comma-separated browser origins. Native applications do not use CORS.
    CORS_ORIGINS: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
    )


settings = Settings()
