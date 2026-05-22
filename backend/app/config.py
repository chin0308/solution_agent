"""Application settings with safe local defaults."""

from __future__ import annotations

import os


class Settings:
    def __init__(self) -> None:
        self.APP_NAME = os.getenv("APP_NAME", "ValueMomentum AI Architecture Agent")
        self.APP_VERSION = os.getenv("APP_VERSION", "0.1.0")
        self.ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
        self.GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
        self.DATABASE_URL_POSTGRES = os.getenv(
            "DATABASE_URL_POSTGRES",
            "sqlite:///./app.db",
        )


settings = Settings()