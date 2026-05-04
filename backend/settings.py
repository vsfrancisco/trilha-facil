from functools import lru_cache
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = Field(default="TrilhaFácil API", alias="APP_NAME")
    environment: Literal["development", "staging", "production", "test"] = Field(
        default="development",
        alias="ENVIRONMENT",
    )
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = Field(
        default="INFO",
        alias="LOG_LEVEL",
    )
    database_url: str = Field(alias="DATABASE_URL")
    secret_key: str = Field(alias="SECRET_KEY")
    admin_token: str = Field(alias="ADMIN_TOKEN")
    cors_origins: str = Field(
        default="http://localhost:3000,http://127.0.0.1:3000",
        alias="CORS_ORIGINS",
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
        populate_by_name=True,
    )

    @field_validator("database_url")
    @classmethod
    def validate_database_url(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("DATABASE_URL não pode estar vazia")
        return value

    @field_validator("secret_key")
    @classmethod
    def validate_secret_key(cls, value: str) -> str:
        if len(value.strip()) < 16:
            raise ValueError("SECRET_KEY deve ter pelo menos 16 caracteres")
        if value.strip().lower() in {"change-me", "changeme", "secret", "password"}:
            raise ValueError("SECRET_KEY muito fraca")
        return value

    @field_validator("admin_token")
    @classmethod
    def validate_admin_token(cls, value: str) -> str:
        if len(value.strip()) < 12:
            raise ValueError("ADMIN_TOKEN deve ter pelo menos 12 caracteres")
        return value

    @field_validator("cors_origins")
    @classmethod
    def validate_cors_origins(cls, value: str) -> str:
        origins = [origin.strip() for origin in value.split(",") if origin.strip()]
        if not origins:
            raise ValueError("CORS_ORIGINS deve conter ao menos uma origem")
        return ",".join(origins)

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()