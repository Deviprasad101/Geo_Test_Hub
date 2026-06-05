import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import UploadPanel, { canStartAudit } from "../components/UploadPanel";
import ProjectStructureCard from "../components/ProjectStructureCard";
import CodeAnalysisCard from "../components/CodeAnalysisCard";
import DatasetValidationCard from "../components/DatasetValidationCard";
import BenchmarkCard, { AuditFooter } from "../components/BenchmarkCard";
import AuditProgressLoader from "../components/AuditProgressLoader";
import AuditPageContainer from "../components/AuditPageContainer";
import { loadAuditProjectResults, runAudit } from "../api/audit";
import { computeBenchmarkScores } from "../lib/benchmarkUtils";
import { useNewAudit } from "../context/NewAuditContext";

export default function NewAudit() {
  const location = useLocation();
  const navigate = useNavigate();
  const auditCtx = useNewAudit();
  const [zipFile, setZipFile] = useState(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [auditing, setAuditing] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [scanSummary, setScanSummary] = useState(null);
  const [auditStarted, setAuditStarted] = useState(false);
  const [progress, setProgress] = useState(0);

  const showResults = Boolean(analysis);
  const showResultsSection = auditing || showResults;

  useEffect(() => {
    auditCtx?.setAllowScroll(auditStarted);
    return () => auditCtx?.setAllowScroll(false);
  }, [auditStarted, auditCtx]);

  useEffect(() => {
    const projectId = location.state?.projectId;
    if (!projectId) return undefined;

    let cancelled = false;

    const openPastAudit = async () => {
      setAuditStarted(true);
      setAuditing(true);
      setError(null);
      setAnalysis(null);
      setScanSummary(null);
      setProgress(10);

      try {
        const result = await loadAuditProjectResults(projectId);
        if (cancelled) return;
        setProgress(100);
        setScanSummary(result.scan);
        setAnalysis(result.scan?.analysis || null);
      } catch (err) {
        if (cancelled) return;
        setError(
          err.message ||
            "Could not load this audit. Start the backend and try again from Past Audits."
        );
      } finally {
        if (!cancelled) {
          setAuditing(false);
          setProgress(0);
        }
      }
    };

    openPastAudit();
    navigate(location.pathname, { replace: true, state: {} });

    return () => {
      cancelled = true;
    };
  }, [location.state?.projectId, location.pathname, navigate]);

  useEffect(() => {
    if (!auditing) {
      setProgress(0);
      return undefined;
    }

    setProgress(5);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 92) return p;
        const step = 1.5 + Math.random() * 4;
        return Math.min(92, Math.round((p + step) * 10) / 10);
      });
    }, 180);

    return () => clearInterval(interval);
  }, [auditing]);

  const startAudit = async () => {
    if (!canStartAudit(zipFile, githubUrl)) return;
    setAuditStarted(true);
    setAuditing(true);
    setError(null);
    setAnalysis(null);
    setScanSummary(null);
    setProgress(5);

    try {
      const result = await runAudit({ zipFile, githubUrl });
      setProgress(100);
      await new Promise((r) => setTimeout(r, 350));
      setScanSummary(result.scan);
      setAnalysis(result.scan?.analysis || null);
    } catch (err) {
      setError(
        err.message ||
          "Audit failed. Start the backend (python app.py in backend/) and try again."
      );
    } finally {
      setAuditing(false);
      setProgress(0);
    }
  };

  const structure = analysis?.structure;
  const code = analysis?.code;
  const datasets = analysis?.datasets;
  const benchmarkScores = showResults
    ? computeBenchmarkScores(analysis, scanSummary)
    : null;
  const resetInputs = () => {
    setAnalysis(null);
    setScanSummary(null);
    setError(null);
    setAuditStarted(false);
  };

  return (
    <div
      className={
        auditStarted
          ? "space-y-10 pb-8"
          : "flex h-full max-h-full flex-col justify-center gap-5 overflow-hidden"
      }
    >
      <UploadPanel
        compact={!auditStarted}
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

      {auditing && <AuditProgressLoader progress={progress} />}

      {error && (
        <AuditPageContainer className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{error}</p>
        </AuditPageContainer>
      )}

      {showResultsSection && (
        <AuditPageContainer className="space-y-6">
          <div className="audit-results-grid">
            <div className="min-w-0">
              <ProjectStructureCard
                structure={structure}
                loading={auditing && !structure}
              />
            </div>
            <div className="min-w-0">
              <CodeAnalysisCard
                code={code}
                scanSummary={scanSummary}
                loading={auditing && !code}
              />
            </div>
            <div className="min-w-0">
              <DatasetValidationCard
                datasets={datasets}
                loading={auditing && !datasets}
              />
            </div>
          </div>

          {showResults && (
            <div className="min-w-0">
              <BenchmarkCard scores={benchmarkScores} visible />
            </div>
          )}
        </AuditPageContainer>
      )}

      {showResultsSection && (
        <AuditPageContainer>
          <AuditFooter />
        </AuditPageContainer>
      )}
    </div>
  );
}
