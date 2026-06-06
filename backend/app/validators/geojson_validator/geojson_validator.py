import hashlib
import json
import uuid
from dataclasses import dataclass, field
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import geopandas as gpd
from pyproj import CRS
from shapely import make_valid
from shapely.validation import explain_validity


@dataclass
class ValidationIssueResult:
    id: str
    severity: str
    title: str
    description: str
    geometry_reference: str | None = None
    detected_at: datetime = field(default_factory=lambda: datetime.now(UTC))

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "severity": self.severity,
            "title": self.title,
            "description": self.description,
            "geometry_reference": self.geometry_reference,
            "detected_at": self.detected_at.isoformat(),
        }


class GeoJSONValidator:
    SEVERITY_CRITICAL = "Critical"
    SEVERITY_HIGH = "High"
    SEVERITY_MEDIUM = "Medium"
    SEVERITY_LOW = "Low"

    def __init__(self, file_path: str):
        self.file_path = Path(file_path)
        self.issues: list[ValidationIssueResult] = []
        self._raw_data: dict | list | None = None
        self._gdf: gpd.GeoDataFrame | None = None
        self._feature_count = 0
        self._start_time = datetime.now(UTC)

    def validate(self) -> dict[str, Any]:
        self._validate_json_structure()
        if self._has_critical_blockers():
            return self._build_report()

        self._validate_feature_collection()
        self._validate_crs()
        self._load_geodataframe()

        if self._gdf is not None and not self._gdf.empty:
            self._validate_geometries()
            self._validate_missing_geometry()
            self._validate_invalid_coordinates()
            self._validate_empty_features()
            self._validate_duplicate_features()
            self._validate_self_intersecting_polygons()

        return self._build_report()

    def _add_issue(
        self,
        severity: str,
        title: str,
        description: str,
        geometry_reference: str | None = None,
    ) -> None:
        self.issues.append(
            ValidationIssueResult(
                id=str(uuid.uuid4()),
                severity=severity,
                title=title,
                description=description,
                geometry_reference=geometry_reference,
            )
        )

    def _has_critical_blockers(self) -> bool:
        return any(i.severity == self.SEVERITY_CRITICAL for i in self.issues)

    def _validate_json_structure(self) -> None:
        try:
            content = self.file_path.read_text(encoding="utf-8")
            self._raw_data = json.loads(content)
        except json.JSONDecodeError as exc:
            self._add_issue(
                self.SEVERITY_CRITICAL,
                "Invalid JSON Structure",
                f"File is not valid JSON: {exc}",
            )
        except OSError as exc:
            self._add_issue(
                self.SEVERITY_CRITICAL,
                "File Read Error",
                f"Unable to read file: {exc}",
            )

    def _validate_feature_collection(self) -> None:
        if self._raw_data is None:
            return

        geo_type = self._raw_data.get("type") if isinstance(self._raw_data, dict) else None

        if geo_type == "FeatureCollection":
            features = self._raw_data.get("features", [])
            if not isinstance(features, list):
                self._add_issue(
                    self.SEVERITY_CRITICAL,
                    "Invalid FeatureCollection",
                    "FeatureCollection 'features' must be an array",
                )
                return
            self._feature_count = len(features)
            if len(features) == 0:
                self._add_issue(
                    self.SEVERITY_HIGH,
                    "Empty FeatureCollection",
                    "FeatureCollection contains no features",
                )
        elif geo_type == "Feature":
            self._feature_count = 1
            self._raw_data = {"type": "FeatureCollection", "features": [self._raw_data]}
        elif geo_type in ("Point", "LineString", "Polygon", "MultiPoint", "MultiLineString", "MultiPolygon", "GeometryCollection"):
            self._feature_count = 1
            self._raw_data = {
                "type": "FeatureCollection",
                "features": [{"type": "Feature", "geometry": self._raw_data, "properties": {}}],
            }
        else:
            self._add_issue(
                self.SEVERITY_CRITICAL,
                "Missing FeatureCollection",
                f"Root type '{geo_type}' is not a valid GeoJSON FeatureCollection or Feature",
            )

    def _validate_crs(self) -> None:
        if not isinstance(self._raw_data, dict):
            return

        crs = self._raw_data.get("crs")
        if crs is None:
            self._add_issue(
                self.SEVERITY_LOW,
                "CRS Not Specified",
                "No CRS definition found; assuming WGS84 (EPSG:4326)",
            )
            return

        crs_name = None
        if isinstance(crs, dict):
            props = crs.get("properties", {})
            crs_name = props.get("name", str(crs))
        else:
            crs_name = str(crs)

        try:
            if "EPSG" in str(crs_name).upper():
                epsg_code = "".join(c for c in str(crs_name) if c.isdigit())
                if epsg_code:
                    CRS.from_epsg(int(epsg_code))
            elif "OGC" in str(crs_name).upper() and "CRS84" in str(crs_name).upper():
                pass
            else:
                self._add_issue(
                    self.SEVERITY_MEDIUM,
                    "Unrecognized CRS",
                    f"CRS '{crs_name}' could not be validated against known EPSG codes",
                )
        except Exception as exc:
            self._add_issue(
                self.SEVERITY_HIGH,
                "Invalid CRS",
                f"CRS validation failed: {exc}",
            )

    def _load_geodataframe(self) -> None:
        if self._has_critical_blockers():
            return
        try:
            self._gdf = gpd.read_file(self.file_path)
            if self._gdf.crs is None:
                self._gdf.set_crs(epsg=4326, inplace=True)
            self._feature_count = len(self._gdf)
        except Exception as exc:
            self._add_issue(
                self.SEVERITY_CRITICAL,
                "GeoDataFrame Load Failed",
                f"Unable to parse geometries: {exc}",
            )

    def _validate_geometries(self) -> None:
        if self._gdf is None:
            return

        for idx, geom in self._gdf.geometry.items():
            if geom is None:
                continue
            if not geom.is_valid:
                reason = explain_validity(geom)
                self._add_issue(
                    self.SEVERITY_HIGH,
                    "Invalid Geometry",
                    f"Feature at index {idx} has invalid geometry: {reason}",
                    geometry_reference=f"feature_index:{idx}",
                )

    def _validate_missing_geometry(self) -> None:
        if self._gdf is None:
            return

        for idx, geom in self._gdf.geometry.items():
            if geom is None or geom.is_empty:
                self._add_issue(
                    self.SEVERITY_CRITICAL,
                    "Missing Geometry",
                    f"Feature at index {idx} has null or empty geometry",
                    geometry_reference=f"feature_index:{idx}",
                )

    def _validate_invalid_coordinates(self) -> None:
        if self._gdf is None:
            return

        for idx, geom in self._gdf.geometry.items():
            if geom is None or geom.is_empty:
                continue
            try:
                bounds = geom.bounds
                minx, miny, maxx, maxy = bounds
                if any(
                    coord is None or (isinstance(coord, float) and (coord != coord))
                    for coord in (minx, miny, maxx, maxy)
                ):
                    raise ValueError("NaN coordinates detected")

                if self._gdf.crs and self._gdf.crs.to_epsg() == 4326:
                    if minx < -180 or maxx > 180 or miny < -90 or maxy > 90:
                        self._add_issue(
                            self.SEVERITY_HIGH,
                            "Invalid Coordinates",
                            f"Feature at index {idx} has coordinates outside WGS84 bounds "
                            f"(lon: {minx:.4f} to {maxx:.4f}, lat: {miny:.4f} to {maxy:.4f})",
                            geometry_reference=f"feature_index:{idx}",
                        )
            except Exception as exc:
                self._add_issue(
                    self.SEVERITY_HIGH,
                    "Invalid Coordinates",
                    f"Feature at index {idx}: {exc}",
                    geometry_reference=f"feature_index:{idx}",
                )

    def _validate_empty_features(self) -> None:
        if self._gdf is None:
            return

        for idx, row in self._gdf.iterrows():
            geom = row.geometry
            props = {k: v for k, v in row.items() if k != "geometry"}
            has_props = any(v is not None for v in props.values())
            if (geom is None or geom.is_empty) and not has_props:
                self._add_issue(
                    self.SEVERITY_MEDIUM,
                    "Empty Feature",
                    f"Feature at index {idx} has no geometry and no properties",
                    geometry_reference=f"feature_index:{idx}",
                )

    def _validate_duplicate_features(self) -> None:
        if self._gdf is None or self._gdf.empty:
            return

        seen: dict[str, list[int]] = {}
        for idx, row in self._gdf.iterrows():
            geom = row.geometry
            if geom is None or geom.is_empty:
                continue
            geom_wkt = geom.wkt
            props = {k: v for k, v in row.items() if k != "geometry"}
            fingerprint = hashlib.md5(
                f"{geom_wkt}:{json.dumps(props, sort_keys=True, default=str)}".encode()
            ).hexdigest()

            if fingerprint in seen:
                self._add_issue(
                    self.SEVERITY_MEDIUM,
                    "Duplicate Feature",
                    f"Feature at index {idx} duplicates feature at index {seen[fingerprint][0]}",
                    geometry_reference=f"feature_index:{idx}",
                )
            else:
                seen[fingerprint] = [idx]

    def _validate_self_intersecting_polygons(self) -> None:
        if self._gdf is None:
            return

        for idx, geom in self._gdf.geometry.items():
            if geom is None or geom.is_empty:
                continue
            if geom.geom_type not in ("Polygon", "MultiPolygon"):
                continue

            geoms = [geom] if geom.geom_type == "Polygon" else list(geom.geoms)
            for poly in geoms:
                if poly.geom_type != "Polygon":
                    continue
                if not poly.is_valid:
                    try:
                        exterior = poly.exterior
                        if exterior is not None and not exterior.is_simple:
                            self._add_issue(
                                self.SEVERITY_HIGH,
                                "Self-Intersecting Polygon",
                                f"Feature at index {idx} contains a self-intersecting polygon ring",
                                geometry_reference=f"feature_index:{idx}",
                            )
                    except Exception:
                        if not make_valid(poly).equals(poly):
                            self._add_issue(
                                self.SEVERITY_HIGH,
                                "Self-Intersecting Polygon",
                                f"Feature at index {idx} contains a self-intersecting polygon",
                                geometry_reference=f"feature_index:{idx}",
                            )

    def _build_report(self) -> dict[str, Any]:
        end_time = datetime.now(UTC)
        duration_ms = int((end_time - self._start_time).total_seconds() * 1000)

        severity_counts = {
            "critical": 0,
            "high": 0,
            "medium": 0,
            "low": 0,
        }
        for issue in self.issues:
            key = issue.severity.lower()
            if key in severity_counts:
                severity_counts[key] += 1

        total_issues = len(self.issues)
        passed = total_issues == 0 or not any(
            i.severity in (self.SEVERITY_CRITICAL, self.SEVERITY_HIGH) for i in self.issues
        )

        return {
            "summary": {
                "total_issues": total_issues,
                "passed": passed,
                "feature_count": self._feature_count,
            },
            "statistics": {
                "critical": severity_counts["critical"],
                "high": severity_counts["high"],
                "medium": severity_counts["medium"],
                "low": severity_counts["low"],
                "feature_count": self._feature_count,
                "validation_duration_ms": duration_ms,
            },
            "errors": [issue.to_dict() for issue in self.issues],
        }
