from functools import lru_cache
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "TrilhaFácil API"
    environment: str = Field(default="development")
    log_level: str = Field(default="INFO")

    database_url: str = Field(default="")
    admin_token: str = Field(default="")

    cors_origins: str = Field(default="http://localhost:3000")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @field_validator("environment")
    @classmethod
    def validate_environment(cls, value: str) -> str:
        allowed = {"development", "staging", "production", "test"}
        if value not in allowed:
            raise ValueError(
                f"ENVIRONMENT inválido: {value}. Use um de {sorted(allowed)}"
            )
        return value

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    def validate_required(self) -> None:
        missing = []

        if not self.database_url:
            missing.append("DATABASE_URL")

        if not self.admin_token:
            missing.append("ADMIN_TOKEN")

        if self.is_production and not self.cors_origins_list:
            missing.append("CORS_ORIGINS")

        if missing:
            raise ValueError(
                f"Variáveis obrigatórias ausentes: {', '.join(missing)}"
            )


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    settings.validate_required()
    return settings


settings = get_settings()