import { useState } from "react";
import { AlertCircle, Shield } from "lucide-react";
import UploadPanel, { canStartAudit } from "../components/UploadPanel";
import FeatureHighlightCards from "../components/FeatureHighlightCards";
import ProjectStructureCard from "../components/ProjectStructureCard";
import CodeAnalysisCard from "../components/CodeAnalysisCard";
import DatasetValidationCard from "../components/DatasetValidationCard";
import BenchmarkCard from "../components/BenchmarkCard";
import { runAudit } from "../api/audit";
import { benchmarkScores } from "../data/mockData";

export default function NewAudit() {
  const [zipFile, setZipFile] = useState(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [auditing, setAuditing] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [scanSummary, setScanSummary] = useState(null);

  const startAudit = async () => {
    if (!canStartAudit(zipFile, githubUrl)) return;
    setAuditing(true);
    setError(null);
    setAnalysis(null);
    setScanSummary(null);

    try {
      const result = await runAudit({ zipFile, githubUrl });
      setScanSummary(result.scan);
      setAnalysis(result.scan?.analysis || null);
    } catch (err) {
      setError(
        err.message ||
          "Audit failed. Start the backend (python app.py in backend/) and try again."
      );
    } finally {
      setAuditing(false);
    }
  };

  const structure = analysis?.structure;
  const code = analysis?.code;
  const datasets = analysis?.datasets;
  const showResults = Boolean(analysis);
  const showResultsSection = auditing || showResults;

  const resetInputs = () => {
    setAnalysis(null);
    setScanSummary(null);
    setError(null);
  };

  return (
    <div className="space-y-10 pb-8">
      <UploadPanel
        zipFile={zipFile}
        setZipFile={(f) => {
          setZipFile(f);
          resetInputs();
        }}
        githubUrl={githubUrl}
        setGithubUrl={(url) => {
          setGithubUrl(url);
          resetInputs();
        }}
        disabled={auditing}
        auditing={auditing}
        onStartAudit={startAudit}
      />

      {error && (
        <div className="mx-auto flex max-w-6xl items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {!showResultsSection && <FeatureHighlightCards />}

      {showResultsSection && (
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
            <ProjectStructureCard
              structure={structure}
              loading={auditing && !structure}
            />
            <CodeAnalysisCard
              code={code}
              scanSummary={scanSummary}
              loading={auditing && !code}
            />
          </div>

          <DatasetValidationCard
            datasets={datasets}
            loading={auditing && !datasets}
          />

          {showResults && (
            <BenchmarkCard scores={benchmarkScores} visible />
          )}
        </div>
      )}

      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-slate-100 pt-8 text-xs text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <Shield size={14} className="text-slate-300" />
          Enterprise-grade security
        </span>
        <span className="hidden h-3 w-px bg-slate-200 sm:inline" />
        <span>SOC 2 Compliant</span>
        <span className="hidden h-3 w-px bg-slate-200 sm:inline" />
        <span>GDPR Ready</span>
      </footer>
    </div>
  );
}
