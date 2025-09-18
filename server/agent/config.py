from pydantic import Field
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

    # —— RabbitMQ (match ASP.NET env names exactly) ——
    RABBIT_HOST: str = Field(default='localhost', validation_alias='RabbitMq__HostName')
    RABBIT_PORT: int = Field(default=5672, validation_alias='RabbitMq__Port')
    RABBIT_VHOST: str = Field(default='/', validation_alias='RabbitMq__VirtualHost')
    RABBIT_USER: str = Field(default='consultant', validation_alias='RabbitMq__UserName')
    RABBIT_PASS: str = Field(default='consultant_pass', validation_alias='RabbitMq__Password')

    RABBIT_EXCHANGE: str = Field(default='app.tasks', validation_alias='RabbitMq__Exchange')
    RABBIT_ROUTING_KEY_TASK_CREATED: str = Field(default='task.created',
                                                 validation_alias='RabbitMq__RoutingKeyTaskCreated')

    # -- Conultant API --
    CONSULTANT_URL: str = 'http://localhost:8080/api'
    CONSULTANT_USERNAME: str = ''
    CONSULTANT_PASSWORD: str = ''

    model_config = SettingsConfigDict(
        env_file=(
            BASE_DIR / ".env",
            BASE_DIR / ".env.dev"
        )
    )

settings = Settings()

_DEFAULT_FMT = (
    "%(asctime)s %(levelname)s "
    "[%(name)s] %(message)s"
)  # ISO-like time makes Loki queries easier

def setup_logging(
    level: str | None = None,
    fmt: str = _DEFAULT_FMT,
    *,
    force: bool = True,
) -> None:
    level = (level or os.getenv("LOG_LEVEL", "INFO")).upper()
    logging.basicConfig(
        level=level,
        format=fmt,
        datefmt="%Y-%m-%dT%H:%M:%S%z",
        force=force,  # py≥3.8 – guarantees idempotent setup
    )

    # Optional: quiet noisy third-party libs at INFO while we’re at it
    for noisy in ("botocore", "urllib3", "paramiko.transport", "pandas"):
        logging.getLogger(noisy).setLevel(logging.ERROR)