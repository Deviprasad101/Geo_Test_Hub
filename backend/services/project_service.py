"""Project storage: safe ZIP extraction and GitHub clone."""
import logging
import os
import re
import shutil
import stat
import tempfile
import time
import zipfile
from pathlib import Path

from git import Repo
from git.exc import GitCommandError
from werkzeug.utils import secure_filename

from config import (
    ALLOWED_ZIP_EXTENSIONS,
    GITHUB_URL_PATTERN,
    MAX_ZIP_SIZE_BYTES,
    UPLOAD_ROOT,
)

logger = logging.getLogger(__name__)


class ProjectServiceError(Exception):
    """Raised when project file operations fail."""

    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def project_directory(project_id: int) -> Path:
    """Return (and ensure) the on-disk directory for a project."""
    path = UPLOAD_ROOT / str(project_id)
    path.mkdir(parents=True, exist_ok=True)
    return path


def validate_project_name(name: str) -> str:
    name = (name or "").strip()
    if not name:
        raise ProjectServiceError("Project name is required.")
    if len(name) > 255:
        raise ProjectServiceError("Project name must be 255 characters or fewer.")
    return name


def validate_github_url(url: str) -> str:
    url = (url or "").strip().rstrip("/")
    if not url:
        raise ProjectServiceError("GitHub URL is required.")
    if not re.match(GITHUB_URL_PATTERN, url):
        raise ProjectServiceError(
            "Invalid GitHub URL. Use https://github.com/owner/repo"
        )
    return url


def normalize_github_url(url: str) -> str:
    """Canonical form for duplicate detection."""
    url = (url or "").strip().lower()
    url = re.sub(r"^https?://", "", url)
    url = re.sub(r"^www\.", "", url)
    url = url.rstrip("/")
    if url.endswith(".git"):
        url = url[:-4]
    return url


def github_repo_slug(url: str) -> str | None:
    """Return owner/repo from a GitHub URL, or None."""
    normalized = normalize_github_url(url)
    match = re.search(r"github\.com/([^/]+/[^/?#]+)", normalized)
    return match.group(1).lower() if match else None


def get_project_source_key(project) -> str:
    """Stable key for one audit per repository or ZIP upload."""
    if project.github_url:
        slug = github_repo_slug(project.github_url)
        if slug:
            return f"github:{slug}"
        return f"github:{normalize_github_url(project.github_url)}"
    return f"zip:{(project.name or '').strip().lower()}"


def find_existing_audit_project(user_id: int, *, name: str | None = None, github_url: str | None = None):
    """Return the newest existing project for the same GitHub repo or ZIP name."""
    from models.project import Project

    if github_url:
        try:
            canonical = normalize_github_url(validate_github_url(github_url))
        except ProjectServiceError:
            canonical = normalize_github_url(github_url)
        slug = github_repo_slug(canonical)

        candidates = (
            Project.query.filter_by(user_id=user_id)
            .filter(Project.github_url.isnot(None))
            .order_by(Project.created_at.desc())
            .all()
        )
        for project in candidates:
            stored = normalize_github_url(project.github_url)
            if stored == canonical:
                return project
            if slug and github_repo_slug(project.github_url) == slug:
                return project

        if name:
            by_name = (
                Project.query.filter_by(user_id=user_id, name=name)
                .filter(Project.github_url.isnot(None))
                .order_by(Project.created_at.desc())
                .first()
            )
            if by_name:
                return by_name
        return None

    if name:
        zip_match = (
            Project.query.filter_by(user_id=user_id, name=name)
            .filter(Project.github_url.is_(None))
            .order_by(Project.created_at.desc())
            .first()
        )
        if zip_match:
            return zip_match
    return None


def _remove_project_directory(path: Path) -> None:
    if not path.exists():
        return
    try:
        shutil.rmtree(path, onexc=_on_rmtree_error)
    except OSError:
        logger.warning("Could not remove project directory %s", path)


def delete_project_storage(project_id: int) -> None:
    """Remove on-disk files for a project."""
    _remove_project_directory(UPLOAD_ROOT / str(project_id))


def cleanup_duplicate_audit_projects(user_id: int) -> int:
    """Keep the newest audit per repo/ZIP; delete older duplicates."""
    from extensions import db
    from models.project import Project

    projects = (
        Project.query.filter_by(user_id=user_id)
        .order_by(Project.created_at.desc())
        .all()
    )
    seen: dict[str, object] = {}
    duplicates = []

    for project in projects:
        key = get_project_source_key(project)
        if key in seen:
            duplicates.append(project)
        else:
            seen[key] = project

    for project in duplicates:
        delete_project_storage(project.id)
        db.session.delete(project)

    if duplicates:
        db.session.commit()
        logger.info(
            "Removed %s duplicate audit project(s) for user %s",
            len(duplicates),
            user_id,
        )

    return len(duplicates)


def _safe_extract_zip(archive_path: Path, dest_dir: Path) -> None:
    """Extract ZIP with path-traversal protection."""
    dest_resolved = dest_dir.resolve()
    with zipfile.ZipFile(archive_path, "r") as zf:
        for member in zf.infolist():
            member_path = dest_resolved / member.filename
            if not str(member_path.resolve()).startswith(str(dest_resolved)):
                raise ProjectServiceError("ZIP contains unsafe paths.")
        zf.extractall(dest_resolved)


def save_zip_upload(project_id: int, file_storage) -> None:
    """Validate and extract an uploaded ZIP into the project directory."""
    if not file_storage or not file_storage.filename:
        raise ProjectServiceError("ZIP file is required.")

    filename = secure_filename(file_storage.filename)
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_ZIP_EXTENSIONS:
        raise ProjectServiceError("Only .zip files are allowed.")

    dest_dir = project_directory(project_id)
    archive_path = dest_dir / filename

    file_storage.save(archive_path)
    size = archive_path.stat().st_size
    if size > MAX_ZIP_SIZE_BYTES:
        archive_path.unlink(missing_ok=True)
        raise ProjectServiceError("ZIP file exceeds 200 MB limit.")

    try:
        if not zipfile.is_zipfile(archive_path):
            raise ProjectServiceError("File is not a valid ZIP archive.")
        _safe_extract_zip(archive_path, dest_dir)
    except zipfile.BadZipFile as exc:
        raise ProjectServiceError("Corrupt or invalid ZIP file.") from exc
    except ProjectServiceError:
        raise
    except OSError as exc:
        logger.exception("ZIP extraction failed for project %s", project_id)
        raise ProjectServiceError("Failed to extract ZIP file.") from exc
    finally:
        archive_path.unlink(missing_ok=True)


def _on_rmtree_error(func, path, exc):
    """Clear read-only files (common for .git on Windows) then retry."""
    if not isinstance(exc, PermissionError):
        raise exc
    try:
        os.chmod(path, stat.S_IWRITE)
        func(path)
    except OSError as retry_exc:
        raise retry_exc from exc


def _clear_directory(path: Path, retries: int = 3) -> None:
    """Remove directory contents; Windows-safe for locked .git pack files."""
    if not path.exists():
        path.mkdir(parents=True, exist_ok=True)
        return

    last_error = None
    for attempt in range(retries):
        try:
            shutil.rmtree(path, onexc=_on_rmtree_error)
            path.mkdir(parents=True, exist_ok=True)
            return
        except OSError as exc:
            last_error = exc
            logger.warning(
                "Retry %s clearing %s: %s", attempt + 1, path, exc
            )
            time.sleep(0.5 * (attempt + 1))

    raise ProjectServiceError(
        "Could not clear project folder. Close programs using the files, "
        "then try again."
    ) from last_error


def clone_github_repo(project_id: int, github_url: str) -> None:
    """Clone a public GitHub repository into the project directory."""
    dest_dir = project_directory(project_id)
    parent = dest_dir.parent

    if any(dest_dir.iterdir()) if dest_dir.exists() else False:
        _clear_directory(dest_dir)
    else:
        dest_dir.mkdir(parents=True, exist_ok=True)

    # Clone into a temp folder first (avoids partial state if clone fails)
    tmp_dir = Path(tempfile.mkdtemp(prefix="clone_", dir=parent))
    try:
        Repo.clone_from(github_url, tmp_dir, depth=1)
        if any(dest_dir.iterdir()):
            _clear_directory(dest_dir)
        for item in tmp_dir.iterdir():
            shutil.move(str(item), str(dest_dir / item.name))
    except GitCommandError as exc:
        logger.warning("Git clone failed for %s: %s", github_url, exc)
        raise ProjectServiceError(
            "Could not clone repository. Check the URL and that the repo is public."
        ) from exc
    finally:
        if tmp_dir.exists():
            try:
                shutil.rmtree(tmp_dir, onexc=_on_rmtree_error)
            except OSError:
                logger.warning("Could not remove temp clone dir %s", tmp_dir)
