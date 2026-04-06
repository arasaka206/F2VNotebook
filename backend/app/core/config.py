from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "Farm2Vets API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True

    # CORS – space-separated list of allowed origins
    CORS_ORIGINS: str = "http://localhost:5173 http://localhost:5174 http://localhost:5175 http://localhost:5176 http://localhost:3000"

    # JWT / Auth (stub values – replace in production)
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    GEMINI_API_KEY: str | None = None

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split()]


settings = Settings()
