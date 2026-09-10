from pydantic_settings import (
    BaseSettings,
    SettingsConfigDict,
)


class Settings(BaseSettings):

    # ==========================================================================
    # Application
    # ==========================================================================

    APP_NAME: str = "JobHub"

    APP_VERSION: str = "1.0.0"


    # ==========================================================================
    # Database
    # ==========================================================================

    DATABASE_URL: str = (
        "postgresql+asyncpg://"
        "neondb_owner:npg_Y1VRKHWEL3Dw"
        "@ep-blue-truth-ayw711fd.c-5.us-east-2.aws.neon.tech/"
        "neondb"
        "?ssl=require"
    )


    # ==========================================================================
    # JWT
    # ==========================================================================

    SECRET_KEY: str = (
        "f3d6d1a2e8b94f7c9ab5e31f6c4d8a9f1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6"
    )

    ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440


    # ==========================================================================
    # CORS
    # ==========================================================================

    ALLOWED_ORIGINS: str = (
        "http://localhost:3000"
    )


    # ==========================================================================
    # Pydantic Settings
    # ==========================================================================

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


    # ==========================================================================
    # Database URL
    # ==========================================================================

    @property
    def database_url(self) -> str:

        return self.DATABASE_URL


    # ==========================================================================
    # CORS
    # ==========================================================================

    @property
    def allowed_origins_list(self) -> list[str]:

        return [
            origin.strip()
            for origin in self.ALLOWED_ORIGINS.split(",")
            if origin.strip()
        ]


settings = Settings()