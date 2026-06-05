import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatAuditDate } from "../api/audit";

const BRAND = "Geo Test Hub";

function pdfFilename(project, reportId) {
  const safeName = (project?.name || "report").replace(/[^\w.-]+/g, "-");
  const date = formatAuditDate(project?.auditedAt).replace(/\s/g, "-");
  return `${safeName}-${reportId}-${date}.pdf`;
}

function addHeader(doc, title, project) {
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 210, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text(BRAND, 14, 12);
  doc.setFontSize(11);
  doc.text(title, 14, 20);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  let y = 38;
  doc.text(`Project: ${project?.name || "—"}`, 14, y);
  y += 6;
  doc.text(`Repository: ${project?.repository || "—"}`, 14, y);
  y += 6;
  doc.text(`Audit date: ${formatAuditDate(project?.auditedAt)}`, 14, y);
  y += 6;
  doc.text(`Status: ${project?.status || "—"}`, 14, y);
  return y + 10;
}

function addSummaryTable(doc, startY, rows) {
  autoTable(doc, {
    startY,
    head: [["Metric", "Value"]],
    body: rows,
    theme: "grid",
    headStyles: { fillColor: [37, 99, 235] },
    styles: { fontSize: 9, cellPadding: 3 },
    margin: { left: 14, right: 14 },
  });
  return doc.lastAutoTable.finalY + 8;
}

function buildAuditPdf(data) {
  const doc = new jsPDF();
  let y = addHeader(doc, data.title, data.project);

  y = addSummaryTable(doc, y, [
    ["Total files", String(data.summary?.totalFiles ?? 0)],
    ["Total folders", String(data.summary?.totalFolders ?? 0)],
    ["File types", String(data.summary?.fileTypes ?? 0)],
    ["Files analyzed", String(data.summary?.filesAnalyzed ?? 0)],
    ["Syntax errors", String(data.summary?.syntaxErrors ?? 0)],
    ["Warnings", String(data.summary?.warnings ?? 0)],
    ["Scan errors", String(data.summary?.scanErrors ?? 0)],
    ["Scan warnings", String(data.summary?.scanWarnings ?? 0)],
  ]);

  if (data.fileTypes?.length) {
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text("File types", 14, y);
    autoTable(doc, {
      startY: y + 4,
      head: [["Type", "Count"]],
      body: data.fileTypes.map((row) => [row.type, String(row.count)]),
      theme: "striped",
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  if (data.issuesByFile?.length) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(11);
    doc.text("Issues by file", 14, y);
    const issueRows = data.issuesByFile.flatMap((group) =>
      (group.issues || []).map((issue) => [
        group.file,
        issue.severity || "—",
        (issue.message || "").slice(0, 80),
      ])
    );
    autoTable(doc, {
      startY: y + 4,
      head: [["File", "Severity", "Message"]],
      body: issueRows.slice(0, 25),
      theme: "striped",
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    });
  }

  return doc;
}

function buildDatasetPdf(data) {
  const doc = new jsPDF();
  let y = addHeader(doc, data.title, data.project);

  y = addSummaryTable(doc, y, [
    ["Dataset count", String(data.summary?.datasetCount ?? 0)],
    ["Validation status", data.summary?.validationStatus ?? "—"],
    ["Schema check", data.summary?.schemaCheck ?? "—"],
    ["Invalid records", String(data.summary?.invalidRecords ?? 0)],
    ["Missing values", String(data.summary?.missingValues ?? 0)],
  ]);

  if (data.files?.length) {
    doc.setFontSize(11);
    doc.text("Dataset files", 14, y);
    autoTable(doc, {
      startY: y + 4,
      head: [["File", "Status", "Size (bytes)"]],
      body: data.files.map((file) => [
        file.name || file.path,
        file.status || "—",
        String(file.size_bytes ?? 0),
      ]),
      theme: "striped",
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  if (data.issues?.length) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(11);
    doc.text("Dataset issues", 14, y);
    autoTable(doc, {
      startY: y + 4,
      head: [["File", "Severity", "Message"]],
      body: data.issues.slice(0, 25).map((issue) => [
        issue.file_path || "—",
        issue.severity || "—",
        (issue.message || "").slice(0, 80),
      ]),
      theme: "striped",
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    });
  }

  return doc;
}

function buildBenchmarkPdf(data) {
  const doc = new jsPDF();
  let y = addHeader(doc, data.title, data.project);

  y = addSummaryTable(doc, y, [
    ["Overall score", `${data.overall ?? 0} / 100`],
    ["Performance", `${data.scores?.performance ?? 0} / 100`],
    ["Code quality", `${data.scores?.codeQuality ?? 0} / 100`],
    ["Security", `${data.scores?.security ?? 0} / 100`],
    ["Dataset", `${data.scores?.dataset ?? 0} / 100`],
  ]);

  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(
    "Scores are computed from audit structure, code issues, dataset validation, and scan results.",
    14,
    y
  );

  return doc;
}

export function downloadReportPdf(reportId, data) {
  let doc;
  if (reportId === "audit") {
    doc = buildAuditPdf(data);
  } else if (reportId === "dataset") {
    doc = buildDatasetPdf(data);
  } else {
    doc = buildBenchmarkPdf(data);
  }

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i += 1) {
    doc.setPage(i);
    doc.text(
      `Generated by ${BRAND} · ${new Date().toLocaleString()}`,
      14,
      290
    );
  }

  doc.save(pdfFilename(data.project, reportId));
}
