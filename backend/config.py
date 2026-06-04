import logging
import os
from dataclasses import dataclass
from functools import lru_cache

from dotenv import load_dotenv

load_dotenv()


def _read_str(name: str, default: str) -> str:
    value = os.getenv(name)
    if value is None:
        return default

    stripped = value.strip()
    return stripped if stripped else default


def _read_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default

    normalized = value.strip().lower()
    if normalized in {"1", "true", "yes", "on"}:
        return True
    if normalized in {"0", "false", "no", "off"}:
        return False
    return default


def _read_int(name: str, default: int) -> int:
    value = os.getenv(name)
    if value is None:
        return default

    try:
        return int(value.strip())
    except (TypeError, ValueError):
        return default


def _parse_csv(value: str) -> tuple[str, ...]:
    return tuple(item.strip() for item in value.split(",") if item.strip())


@dataclass(frozen=True)
class Settings:
    environment: str
    debug: bool
    log_level: str
    cors_origins: tuple[str, ...]
    database_url: str
    secret_key: str
    algorithm: str
    access_token_expire_minutes: int

    @property
    def is_production(self) -> bool:
        return self.environment in {"prod", "production"}


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    environment = _read_str("APP_ENV", _read_str("ENVIRONMENT", "development")).lower()
    debug = _read_bool("DEBUG", environment not in {"prod", "production"})
    log_level = _read_str("LOG_LEVEL", "WARNING" if environment in {"prod", "production"} else "INFO").upper()

    cors_raw = os.getenv("CORS_ORIGINS") or os.getenv("ALLOWED_ORIGINS")
    if cors_raw and cors_raw.strip():
        cors_origins = _parse_csv(cors_raw)
    elif environment in {"prod", "production"}:
        cors_origins = tuple()
    else:
        cors_origins = ("http://localhost:5173",)

    return Settings(
        environment=environment,
        debug=debug,
        log_level=log_level,
        cors_origins=cors_origins,
        database_url=_read_str("DATABASE_URL", "sqlite:///./fallback.db"),
        secret_key=_read_str("SECRET_KEY", "fallback-secret-key-for-development"),
        algorithm=_read_str("ALGORITHM", "HS256"),
        access_token_expire_minutes=_read_int("ACCESS_TOKEN_EXPIRE_MINUTES", 60),
    )


settings = get_settings()


def configure_logging() -> None:
    log_level = getattr(logging, settings.log_level, logging.INFO)
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    if not root_logger.handlers:
        logging.basicConfig(
            level=log_level,
            format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        )