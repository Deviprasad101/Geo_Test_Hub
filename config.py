"""Application configuration."""
import os
from pathlib import Path
from urllib.parse import quote_plus

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env", override=True)

# Upload storage
UPLOAD_ROOT = BASE_DIR / "uploads" / "projects"
MAX_ZIP_SIZE_BYTES = 200 * 1024 * 1024  # 200 MB
ALLOWED_ZIP_EXTENSIONS = {".zip"}

# GitHub URL validation pattern (https://github.com/owner/repo)
GITHUB_URL_PATTERN = (
    r"^https://github\.com/[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}"
    r"/[a-zA-Z0-9_.-]+/?(?:\.git)?$"
)

# Database — set DATABASE_URL or DB_* ; USE_SQLITE=1 for local dev without Postgres
def build_database_uri() -> str:
    if os.getenv("USE_SQLITE", "").lower() in ("1", "true", "yes"):
        db_path = BASE_DIR / "geo_test_hub.db"
        return f"sqlite:///{db_path.as_posix()}"

    explicit = os.getenv("DATABASE_URL")
    if explicit:
        return explicit

    user = os.getenv("DB_USER", "postgres")
    password = os.getenv("DB_PASSWORD", "")
    host = os.getenv("DB_HOST", "127.0.0.1")
    port = os.getenv("DB_PORT", "5432")
    name = os.getenv("DB_NAME", "geo_test_hub")
    if password:
        return (
            f"postgresql://{quote_plus(user)}:{quote_plus(password)}"
            f"@{host}:{port}/{name}"
        )
    return f"postgresql://{quote_plus(user)}@{host}:{port}/{name}"


def get_database_uri() -> str:
    """Build URI after .env is loaded (call from create_app)."""
    return build_database_uri()


SQLALCHEMY_DATABASE_URI = get_database_uri()
SQLALCHEMY_TRACK_MODIFICATIONS = False

# Flask
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-in-production")
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"

# Logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# React dev server (comma-separated for multiple origins)
CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
)
