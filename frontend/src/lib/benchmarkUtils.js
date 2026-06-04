export function computeBenchmarkScores(analysis, scanSummary) {
  const code = analysis?.code;
  const datasets = analysis?.datasets;
  const structure = analysis?.structure;

  let codeQuality = 100 - (code?.syntax_errors ?? 0) * 12 - (code?.warnings ?? 0) * 4;
  codeQuality = Math.round(Math.max(0, Math.min(100, codeQuality)));

  let dataset = 68;
  if (datasets?.validation_status === "passed") dataset = 91;
  else if (datasets?.validation_status === "warning") dataset = 74;
  else if (datasets?.validation_status === "failed") dataset = 45;
  else if (datasets?.dataset_file_count > 0) dataset = 80;

  const files = structure?.total_files ?? 0;
  let performance = files > 0 ? Math.min(95, 68 + Math.min(files, 27)) : 72;

  let security = 100 - (scanSummary?.error_count ?? 0) * 10 - (scanSummary?.warning_count ?? 0) * 3;
  security = Math.round(Math.max(50, Math.min(100, security)));

  return {
    performance: Math.round(performance),
    codeQuality,
    security,
    dataset,
  };
}

export function scoreRating(value) {
  if (value >= 85) return { label: "Excellent", className: "bg-blue-100 text-blue-700" };
  if (value >= 70) return { label: "Good", className: "bg-cyan-100 text-cyan-700" };
  if (value >= 50) return { label: "Fair", className: "bg-amber-100 text-amber-700" };
  return { label: "Poor", className: "bg-red-100 text-red-700" };
}

export function sparklinePoints(value, seed = 0) {
  const base = value / 100;
  return Array.from({ length: 8 }, (_, i) => {
    const wave = Math.sin((i + seed) * 0.9) * 8;
    return Math.round(Math.max(20, Math.min(98, value * 0.55 + i * 4 + wave)));
  });
}

export function formatFileSize(bytes) {
  if (!bytes || bytes < 1) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
