export const pastAudits = [
  {
    id: 1,
    name: "Urban Flood Model",
    repository: "github.com/org/flood-sim",
    date: "2026-06-01",
    status: "Complete",
  },
  {
    id: 2,
    name: "Agriculture Estimation",
    repository: "github.com/Deviprasad101/AGRICULTURE-ESTIMATION",
    date: "2026-05-28",
    status: "Complete",
  },
  {
    id: 3,
    name: "Coastal Risk ZIP",
    repository: "ZIP upload",
    date: "2026-05-20",
    status: "Failed",
  },
  {
    id: 4,
    name: "Pipeline QA",
    repository: "github.com/org/geo-pipeline",
    date: "2026-05-15",
    status: "Complete",
  },
];

export const issues = [
  {
    id: 1,
    severity: "Critical",
    file: "src/api/client.js",
    description: "Unhandled promise rejection in fetch wrapper",
    status: "Open",
  },
  {
    id: 2,
    severity: "High",
    file: "data/farm_fields.geojson",
    description: "Invalid geometry in feature index 42",
    status: "Open",
  },
  {
    id: 3,
    severity: "Medium",
    file: "scripts/build_boundary.py",
    description: "Duplicate function definition",
    status: "In Review",
  },
  {
    id: 4,
    severity: "Low",
    file: "README.md",
    description: "Missing dataset attribution section",
    status: "Resolved",
  },
  {
    id: 5,
    severity: "High",
    file: "config.yaml",
    description: "Deprecated API version reference",
    status: "Open",
  },
];

export const datasets = [
  {
    id: 1,
    name: "farm_fields.geojson",
    records: 1284,
    status: "Valid",
    lastUpdated: "2026-06-02",
  },
  {
    id: 2,
    name: "ap_boundary.geojson",
    records: 56,
    status: "Warning",
    lastUpdated: "2026-06-01",
  },
  {
    id: 3,
    name: "chinagottigallu_fields.geojson",
    records: 890,
    status: "Valid",
    lastUpdated: "2026-05-30",
  },
  {
    id: 4,
    name: "dashboard_result.json",
    records: 0,
    status: "Failed",
    lastUpdated: "2026-05-28",
  },
];

export const rules = [
  { id: 1, name: "GeoJSON Schema Check", category: "Dataset", enabled: true },
  { id: 2, name: "Python Syntax Scan", category: "Code", enabled: true },
  { id: 3, name: "Secret Detection", category: "Security", enabled: true },
  { id: 4, name: "Duplicate Code Threshold", category: "Quality", enabled: false },
  { id: 5, name: "CRS Validation", category: "Dataset", enabled: true },
  { id: 6, name: "License Header Required", category: "Compliance", enabled: false },
];

export const benchmarkScores = {
  performance: 87,
  codeQuality: 74,
  security: 91,
  dataset: 68,
};

export const benchmarkTrend = [
  { month: "Jan", score: 62 },
  { month: "Feb", score: 65 },
  { month: "Mar", score: 70 },
  { month: "Apr", score: 72 },
  { month: "May", score: 78 },
  { month: "Jun", score: 82 },
];

export const rankings = [
  { name: "Security", score: 91, rank: 1 },
  { name: "Performance", score: 87, rank: 2 },
  { name: "Code Quality", score: 74, rank: 3 },
  { name: "Dataset", score: 68, rank: 4 },
];
