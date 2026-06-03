"""Default system user for projects FK (no login / OTP / email verification)."""
from extensions import db
from models.user import User

DEFAULT_USER_EMAIL = "system@geo-test-hub.local"


def ensure_default_user() -> int:
    """Create or return the default system user id."""
    user = User.query.filter_by(email=DEFAULT_USER_EMAIL).first()
    if user is None:
        user = User(email=DEFAULT_USER_EMAIL)
        db.session.add(user)
        db.session.commit()
    return user.id


def get_default_user_id() -> int:
    """Return default user id, creating the user if needed."""
    return ensure_default_user()
