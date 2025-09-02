from pydantic_settings import BaseSettings, SettingsConfigDict
import os
import logging
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

class Settings(BaseSettings):
    # —— AWS / S3 ——
    AWS_REGION: str = 'us-east-2'
    AWS_S3_BUCKET: str = 'misc-webapp'
    AWS_FILE_PREFIX: str = 'virtual-consultant-two-dev'

    AWS_ACCESS_KEY_ID: str = ''
    AWS_SECRET_ACCESS_KEY: str = ''

    # -- Reporting --
    REPORTING_URL: str = 'https://reporting.victorymodeling.com/api/'
    REPORTING_USERNAME: str = ''
    REPORTING_PASSWORD: str = ''

    model_config = SettingsConfigDict(
        env_file=(
            BASE_DIR / ".env",
            BASE_DIR / ".env.dev"
        )
    )

settings = Settings()