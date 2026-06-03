"""Flask application factory and entry point."""
import logging
import os
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask

load_dotenv(override=True)

from flask_cors import CORS

from config import CORS_ORIGINS, LOG_LEVEL, UPLOAD_ROOT, get_database_uri
from extensions import db


def create_app(config_object=None):
    """Create and configure the Flask application."""
    app = Flask(__name__)

    if config_object:
        app.config.from_object(config_object)
    else:
        app.config.from_mapping(
            SECRET_KEY=os.getenv("SECRET_KEY", "dev-secret-change-in-production"),
            SQLALCHEMY_DATABASE_URI=get_database_uri(),
            SQLALCHEMY_TRACK_MODIFICATIONS=False,
            SESSION_COOKIE_HTTPONLY=True,
            SESSION_COOKIE_SAMESITE="Lax",
            MAX_CONTENT_LENGTH=210 * 1024 * 1024,  # Slightly above 200MB ZIP limit
        )

    _configure_logging(app)
    db.init_app(app)

    origins = [o.strip() for o in CORS_ORIGINS.split(",") if o.strip()]
    CORS(app, origins=origins, supports_credentials=True)

    # Ensure upload directory exists
    Path(UPLOAD_ROOT).mkdir(parents=True, exist_ok=True)

    with app.app_context():
        _register_blueprints(app)
        _register_cli(app)

    return app


def _configure_logging(app):
    """Configure application-wide logging."""
    log_level = getattr(logging, LOG_LEVEL.upper(), logging.INFO)
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )
    app.logger.setLevel(log_level)


def _register_blueprints(app):
    """Register all route blueprints."""
    from routes.api_routes import api_bp
    from routes.main_routes import main_bp
    from routes.project_routes import project_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(api_bp)
    app.register_blueprint(project_bp)

    @app.before_request
    def _ensure_default_user():
        from utils.auth import ensure_default_user
        ensure_default_user()


def _register_cli(app):
    """Register Flask CLI commands."""

    @app.cli.command("init-db")
    def init_db():
        """Create database tables."""
        from models import Project, ProjectError, User  # noqa: F401 — register models

        db.create_all()
        print("Database tables created.")

    @app.cli.command("seed-user")
    def seed_user():
        """Create the default system user."""
        from utils.auth import ensure_default_user

        user_id = ensure_default_user()
        print(f"Default user ready (id={user_id})")


app = create_app()


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
