from functools import lru_cache

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    openai_api_key: SecretStr
    openai_model: str = Field(min_length=1)
    openai_timeout_seconds: float = Field(default=30.0, gt=0)
    openai_max_retries: int = Field(default=2, ge=0, le=5)
    speech_timeout_seconds: float = Field(default=10.0, gt=0)
    speech_cache_max_entries: int = Field(default=128, ge=0)
    speech_rate_limit_requests: int = Field(default=20, ge=1)
    speech_rate_limit_window_seconds: float = Field(default=60.0, gt=0)
    database_url: str = Field(min_length=1)
    embedding_model: str = Field(min_length=1)

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()

def get_settings_for_testing() -> Settings:
    return Settings(
        openai_api_key="test-key",
        openai_model="test-model",
        database_url="postgresql+asyncpg://test:test@localhost/test",
        embedding_model="test-embedding-model",
        openai_timeout_seconds=30.0,
        openai_max_retries=2,
        speech_timeout_seconds=10.0,
        speech_cache_max_entries=128,
        speech_rate_limit_requests=20,
        speech_rate_limit_window_seconds=60.0,
    )
