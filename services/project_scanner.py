"""Scan uploaded project files for syntax and geospatial issues."""
import ast
import json
import logging
from dataclasses import dataclass
from pathlib import Path

from services.project_service import project_directory

logger = logging.getLogger(__name__)

SKIP_DIRS = {
    ".git",
    "__pycache__",
    "node_modules",
    "venv",
    ".venv",
    "dist",
    "build",
    ".idea",
    ".vscode",
}

SCAN_EXTENSIONS = {
    ".py": "python",
    ".js": "javascript",
    ".jsx": "javascript",
    ".json": "json",
    ".geojson": "geojson",
}


@dataclass
class ScanIssue:
    file_path: str
    message: str
    severity: str = "error"
    line: int | None = None
    column: int | None = None
    rule_id: str | None = None

    def to_dict(self):
        return {
            "file_path": self.file_path,
            "line": self.line,
            "column": self.column,
            "severity": self.severity,
            "rule_id": self.rule_id,
            "message": self.message,
        }


def _rel_path(root: Path, file_path: Path) -> str:
    try:
        return str(file_path.relative_to(root)).replace("\\", "/")
    except ValueError:
        return str(file_path)


def _iter_project_files(root: Path):
    for path in root.rglob("*"):
        if not path.is_file():
            continue
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        kind = SCAN_EXTENSIONS.get(path.suffix.lower())
        if kind:
            yield path, kind


def _scan_python(path: Path, rel: str) -> list[ScanIssue]:
    issues = []
    try:
        source = path.read_text(encoding="utf-8", errors="replace")
    except OSError as exc:
        return [
            ScanIssue(rel, f"Cannot read file: {exc}", "error", rule_id="IO001")
        ]

    try:
        ast.parse(source, filename=rel)
    except SyntaxError as exc:
        issues.append(
            ScanIssue(
                rel,
                f"Syntax error: {exc.msg}",
                "error",
                line=exc.lineno,
                column=exc.offset,
                rule_id="PY001",
            )
        )

    try:
        compile(source, rel, "exec")
    except SyntaxError as exc:
        if not any(i.rule_id == "PY001" for i in issues):
            issues.append(
                ScanIssue(
                    rel,
                    f"Compile error: {exc.msg}",
                    "error",
                    line=exc.lineno,
                    column=exc.offset,
                    rule_id="PY002",
                )
            )
    return issues


def _scan_json_or_geojson(
    path: Path, rel: str, is_geojson: bool, check_geo_content: bool = False
) -> list[ScanIssue]:
    issues = []
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
        data = json.loads(text)
    except json.JSONDecodeError as exc:
        return [
            ScanIssue(
                rel,
                f"Invalid JSON: {exc.msg}",
                "error",
                line=exc.lineno,
                column=exc.colno,
                rule_id="JSON001",
            )
        ]
    except OSError as exc:
        return [ScanIssue(rel, f"Cannot read file: {exc}", "error", rule_id="IO001")]

    geo_types = {
        "Feature",
        "FeatureCollection",
        "GeometryCollection",
        "Point",
        "MultiPoint",
        "LineString",
        "MultiLineString",
        "Polygon",
        "MultiPolygon",
    }
    looks_like_geo = isinstance(data, dict) and data.get("type") in geo_types
    if is_geojson or (check_geo_content and looks_like_geo):
        if not isinstance(data, dict):
            issues.append(
                ScanIssue(
                    rel,
                    "GeoJSON root must be a JSON object",
                    "error",
                    rule_id="GEO001",
                )
            )
        else:
            gtype = data.get("type")
            if gtype not in geo_types:
                issues.append(
                    ScanIssue(
                        rel,
                        f"Invalid or missing GeoJSON type: {gtype!r}",
                        "error",
                        rule_id="GEO002",
                    )
                )
            if gtype == "FeatureCollection":
                features = data.get("features")
                if features is None:
                    issues.append(
                        ScanIssue(
                            rel,
                            "FeatureCollection missing 'features' array",
                            "warning",
                            rule_id="GEO003",
                        )
                    )
                elif not isinstance(features, list):
                    issues.append(
                        ScanIssue(
                            rel,
                            "'features' must be an array",
                            "error",
                            rule_id="GEO004",
                        )
                    )
                elif len(features) == 0:
                    issues.append(
                        ScanIssue(
                            rel,
                            "FeatureCollection has no features",
                            "warning",
                            rule_id="GEO005",
                        )
                    )
    return issues


def _scan_javascript(path: Path, rel: str) -> list[ScanIssue]:
    """Basic JS checks without Node (brace balance + obvious issues)."""
    issues = []
    try:
        source = path.read_text(encoding="utf-8", errors="replace")
    except OSError as exc:
        return [ScanIssue(rel, f"Cannot read file: {exc}", "error", rule_id="IO001")]

    if source.count("{") != source.count("}"):
        issues.append(
            ScanIssue(
                rel,
                "Mismatched curly braces { }",
                "warning",
                rule_id="JS001",
            )
        )
    if source.count("(") != source.count(")"):
        issues.append(
            ScanIssue(
                rel,
                "Mismatched parentheses ( )",
                "warning",
                rule_id="JS002",
            )
        )
    return issues


def _scan_structure(root: Path) -> list[ScanIssue]:
    """Project-level checks after file scan."""
    issues = []
    rel_files = [
        p
        for p in root.rglob("*")
        if p.is_file() and ".git" not in p.parts and "__pycache__" not in p.parts
    ]
    if not rel_files:
        issues.append(
            ScanIssue(
                ".",
                "Project folder is empty (no files to analyze)",
                "error",
                rule_id="STRUCT001",
            )
        )
        return issues

    code_ext = {".py", ".js", ".jsx", ".html", ".ts", ".tsx"}
    geo_ext = {".geojson", ".json", ".shp", ".gpkg", ".kml"}
    has_code = any(p.suffix.lower() in code_ext for p in rel_files)
    has_geo = any(
        p.suffix.lower() in geo_ext or "geojson" in p.name.lower() for p in rel_files
    )

    if has_code and not has_geo:
        issues.append(
            ScanIssue(
                ".",
                "No GeoJSON or geospatial data files found (expected for geo test projects)",
                "warning",
                rule_id="STRUCT002",
            )
        )
    return issues


def scan_project(project_id: int) -> list[ScanIssue]:
    """Run all scanners on a project directory. Returns list of issues."""
    root = project_directory(project_id)
    if not root.exists():
        return [
            ScanIssue(
                ".",
                "Project storage directory not found",
                "error",
                rule_id="STRUCT000",
            )
        ]

    all_issues: list[ScanIssue] = []

    for file_path, kind in _iter_project_files(root):
        rel = _rel_path(root, file_path)
        try:
            if kind == "python":
                all_issues.extend(_scan_python(file_path, rel))
            elif kind in ("json", "geojson"):
                treat_as_geo = kind == "geojson" or "geo" in rel.lower()
                all_issues.extend(
                    _scan_json_or_geojson(
                        file_path, rel, is_geojson=treat_as_geo, check_geo_content=True
                    )
                )
            elif kind == "javascript":
                all_issues.extend(_scan_javascript(file_path, rel))
        except Exception as exc:
            logger.exception("Scan failed for %s", rel)
            all_issues.append(
                ScanIssue(
                    rel,
                    f"Scanner failed: {exc}",
                    "error",
                    rule_id="SCAN000",
                )
            )

    all_issues.extend(_scan_structure(root))
    return all_issues


def summarize_scan(issues: list[ScanIssue]) -> dict:
    errors = [i for i in issues if i.severity == "error"]
    warnings = [i for i in issues if i.severity == "warning"]
    return {
        "error_count": len(errors),
        "warning_count": len(warnings),
        "total_count": len(issues),
        "passed": len(errors) == 0,
    }
