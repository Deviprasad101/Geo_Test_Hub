"""Legacy root — API lives under /api; UI is the React app."""
from flask import Blueprint, jsonify

main_bp = Blueprint("main", __name__)


@main_bp.route("/")
def index():
    """Backend root; frontend runs separately."""
    return jsonify(
        {
            "message": "Geo Test Hub API",
            "frontend": "Run the React app (npm run dev in frontend/)",
            "docs": {
                "projects": "GET /api/projects",
                "create": "POST /project/create",
                "upload": "POST /project/upload",
                "github": "POST /project/github",
            },
        }
    )
