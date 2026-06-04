"""Build structure, code, and dataset summaries from an uploaded project."""
from collections import Counter
from pathlib import Path

from services.project_scanner import ScanIssue, _rel_path
from services.project_service import project_directory

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

EXT_LABELS = {
    ".py": "Python",
    ".js": "JavaScript",
    ".jsx": "JavaScript",
    ".ts": "TypeScript",
    ".tsx": "TypeScript",
    ".json": "JSON",
    ".geojson": "GeoJSON",
    ".yaml": "YAML",
    ".yml": "YAML",
    ".md": "Markdown",
    ".html": "HTML",
    ".css": "CSS",
    ".csv": "CSV",
    ".shp": "Shapefile",
    ".gpkg": "GeoPackage",
    ".kml": "KML",
    ".xml": "XML",
    ".txt": "Text",
    ".zip": "ZIP",
}

DATASET_EXTENSIONS = {".geojson", ".json", ".csv", ".shp", ".gpkg", ".kml"}
CODE_EXTENSIONS = {".py", ".js", ".jsx", ".ts", ".tsx", ".html"}
GEO_RULE_PREFIX = "GEO"


def _should_skip(path: Path) -> bool:
    return any(part in SKIP_DIRS for part in path.parts)


def analyze_project_structure(project_id: int) -> dict:
    root = project_directory(project_id)
    if not root.exists():
        return {
            "total_files": 0,
            "total_folders": 0,
            "file_type_count": 0,
            "file_types": [],
            "files": [],
        }

    files: list[str] = []
    folder_paths: set[str] = set()
    type_counter: Counter[str] = Counter()

    for path in root.rglob("*"):
        if _should_skip(path):
            continue
        rel = _rel_path(root, path)
        if path.is_dir():
            folder_paths.add(rel)
            continue
        if not path.is_file():
            continue
        files.append(rel)
        ext = path.suffix.lower()
        label = EXT_LABELS.get(ext, ext[1:].upper() if ext else "Other")
        type_counter[label] += 1

    file_types = [
        {"type": label, "count": count}
        for label, count in type_counter.most_common()
    ]

    return {
        "total_files": len(files),
        "total_folders": len(folder_paths),
        "file_type_count": len(type_counter),
        "file_types": file_types,
        "files": sorted(files),
    }


def analyze_code_from_issues(issues: list[ScanIssue], structure: dict) -> dict:
    code_issues = [
        i
        for i in issues
        if i.file_path != "."
        and not (i.rule_id or "").startswith(GEO_RULE_PREFIX)
        and i.rule_id not in ("STRUCT001", "STRUCT002")
    ]
    errors = [i for i in code_issues if i.severity == "error"]
    warnings = [i for i in code_issues if i.severity == "warning"]

    code_files = sum(
        1
        for f in structure.get("files", [])
        if Path(f).suffix.lower() in CODE_EXTENSIONS
    )

    return {
        "files_analyzed": code_files,
        "syntax_errors": len(errors),
        "warnings": len(warnings),
        "issues_by_file": _group_issues_by_file(code_issues),
        "status": "complete" if code_files or not structure.get("files") else "complete",
    }


def analyze_datasets(project_id: int, issues: list[ScanIssue], structure: dict) -> dict:
    root = project_directory(project_id)
    dataset_files = []
    for rel in structure.get("files", []):
        ext = Path(rel).suffix.lower()
        name_lower = rel.lower()
        if ext in DATASET_EXTENSIONS:
            dataset_files.append(rel)
        elif ext == ".json" and ("geo" in name_lower or "geojson" in name_lower):
            dataset_files.append(rel)

    geo_issues = [i for i in issues if (i.rule_id or "").startswith(GEO_RULE_PREFIX)]
    json_issues = [i for i in issues if i.rule_id == "JSON001"]
    dataset_errors = geo_issues + json_issues

    invalid_records = sum(1 for i in dataset_errors if i.severity == "error")
    missing_values = sum(1 for i in dataset_errors if i.severity == "warning")

    files_with_errors = {i.file_path for i in dataset_errors if i.severity == "error"}
    files_with_warnings = {i.file_path for i in dataset_errors if i.severity == "warning"}

    file_details = []
    for rel in dataset_files:
        full_path = root / Path(rel)
        try:
            size_bytes = full_path.stat().st_size if full_path.is_file() else 0
        except OSError:
            size_bytes = 0
        if rel in files_with_errors:
            file_status = "invalid"
        elif rel in files_with_warnings:
            file_status = "warning"
        else:
            file_status = "valid"
        file_details.append(
            {
                "path": rel,
                "name": Path(rel).name,
                "size_bytes": size_bytes,
                "status": file_status,
            }
        )

    if not dataset_files:
        status = "none"
        schema_check = "n/a"
    elif invalid_records > 0:
        status = "failed"
        schema_check = "invalid"
    elif missing_values > 0:
        status = "warning"
        schema_check = "valid"
    else:
        status = "passed"
        schema_check = "valid"

    return {
        "dataset_files": dataset_files,
        "file_details": file_details,
        "dataset_file_count": len(dataset_files),
        "validation_status": status,
        "missing_values": missing_values,
        "invalid_records": invalid_records,
        "schema_check": schema_check,
        "issues": [i.to_dict() for i in dataset_errors],
    }


def _group_issues_by_file(issues: list[ScanIssue], limit: int = 8) -> list[dict]:
    by_file: dict[str, list[dict]] = {}
    for issue in issues:
        if issue.file_path == ".":
            continue
        by_file.setdefault(issue.file_path, []).append(issue.to_dict())
    return [
        {"file": path, "issues": items[:3]}
        for path, items in sorted(by_file.items())[:limit]
    ]


def build_audit_analysis(project_id: int, issues: list[ScanIssue]) -> dict:
    structure = analyze_project_structure(project_id)
    code = analyze_code_from_issues(issues, structure)
    datasets = analyze_datasets(project_id, issues, structure)
    return {
        "structure": structure,
        "code": code,
        "datasets": datasets,
    }
