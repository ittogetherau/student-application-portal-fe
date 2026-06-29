"use client";

import {
  Document,
  Image as PdfImage,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from "@react-pdf/renderer";

// ─── helpers ────────────────────────────────────────────────────────────────

function getString(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

async function svgToPngDataUrl(svgText: string): Promise<string> {
  const blob = new Blob([svgText], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load SVG"));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.width || 800;
    canvas.height = img.height || 200;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  const reader = new FileReader();
  return await new Promise<string>((resolve, reject) => {
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.readAsDataURL(blob);
  });
}

async function loadImageDataUrl(path: string): Promise<string | null> {
  try {
    const response = await fetch(path, { cache: "force-cache" });
    if (!response.ok) return null;
    const blob = await response.blob();
    const isSvg =
      blob.type.includes("svg") ||
      (await blob.slice(0, 200).text()).includes("<svg");
    if (isSvg) {
      const svgText = await blob.text();
      return await svgToPngDataUrl(svgText);
    }
    return await blobToDataUrl(blob);
  } catch {
    return null;
  }
}

// ─── colours matching GS PDF ─────────────────────────────────────────────────

const PRIMARY = "#E59725";
const BORDER = PRIMARY;
const LABEL_FILL = "#E5972522";
const LIGHT_FILL = "#FFF7EB";

// ─── styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    paddingTop: 95,
    paddingBottom: 88,
    paddingHorizontal: 32,
    fontSize: 8,
    color: "#0f172a",
    lineHeight: 1.35,
    fontFamily: "Helvetica",
  },
  pageBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 595.28,
    height: 841.89,
  },
  title: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
    textTransform: "uppercase",
    color: "#92400e",
  },
  policyBox: {
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: LIGHT_FILL,
    padding: 8,
    marginBottom: 8,
  },
  policyHeader: {
    fontSize: 8,
    fontWeight: "bold",
    marginBottom: 4,
  },
  policyText: {
    fontSize: 7.5,
    lineHeight: 1.5,
    color: "#1e293b",
  },
  policyBullet: {
    fontSize: 7.5,
    lineHeight: 1.5,
    color: "#1e293b",
    marginLeft: 8,
    marginBottom: 2,
  },
  detailsTable: {
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  detailsRowLast: {
    borderBottomWidth: 0,
  },
  detailsLabel: {
    width: "30%",
    paddingVertical: 3,
    paddingHorizontal: 4,
    backgroundColor: LABEL_FILL,
    borderRightWidth: 1,
    borderRightColor: BORDER,
    fontSize: 8,
    fontWeight: "bold",
  },
  detailsValue: {
    flex: 1,
    paddingVertical: 3,
    paddingHorizontal: 4,
    fontSize: 8,
  },
  checklistTable: {
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 6,
  },
  checklistHeaderRow: {
    flexDirection: "row",
    backgroundColor: LIGHT_FILL,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  checklistRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  checklistRowLast: {
    borderBottomWidth: 0,
  },
  checklistCellStage: {
    width: "15%",
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderRightWidth: 1,
    borderRightColor: BORDER,
  },
  checklistCellAssessment: {
    flex: 1,
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderRightWidth: 1,
    borderRightColor: BORDER,
  },
  checklistCellResult: {
    width: "22%",
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderRightWidth: 1,
    borderRightColor: BORDER,
  },
  checklistCellDate: {
    width: "25%",
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  headerText: {
    fontSize: 8,
    fontWeight: "bold",
  },
  cellText: {
    fontSize: 7.5,
  },
  eligibleText: {
    color: "#166534",
    fontWeight: "bold",
  },
  notEligibleText: {
    color: "#991b1b",
    fontWeight: "bold",
  },
  furtherReviewText: {
    color: "#92400e",
    fontWeight: "bold",
  },
  footerNote: {
    fontSize: 7,
    color: "#475569",
    marginTop: 6,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    marginVertical: 6,
  },
});

// ─── types ───────────────────────────────────────────────────────────────────

export type EsosCompliancePdfData = {
  studentName: string;
  studentOrigin: string;
  applicationId: string;
  // Stage 1 — Agent
  esosAgentAssessment: string;
  esosAgentAssessmentDate: string;
  esosAgentAssessmentReason?: string;
  // Stage 2 — Admissions
  esosAdmissionsReview: string;
  esosAdmissionsReviewDate: string;
  esosAdmissionsReviewReason?: string;
  // Stage 3 — COE
  esosCoeConfirmation: string;
  esosCoeConfirmationDate: string;
  esosCoeReason?: string;
};

// ─── filename helper ──────────────────────────────────────────────────────────

export function getEsosCompliancePdfFilename(applicationId?: string): string {
  return `esos-commission-compliance-${applicationId ?? "application"}.pdf`;
}

// ─── label helpers ────────────────────────────────────────────────────────────

function assessmentLabel(value: string): string {
  if (value === "eligible" || value === "confirmed_eligible") return "Eligible";
  if (value === "not_eligible" || value === "confirmed_not_eligible") return "Not Eligible";
  if (value === "further_review") return "Requires Further Review";
  if (!value) return "Not assessed";
  return value;
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-AU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

// ─── main export ─────────────────────────────────────────────────────────────

export async function generateEsosCompliancePdfBlob(
  data: EsosCompliancePdfData,
): Promise<Blob> {
  const letterheadDataUrl = await loadImageDataUrl("/images/letterhead.png");

  const ResultText = ({
    value,
    style,
  }: {
    value: string;
    style?: any;
  }) => {
    const label = assessmentLabel(value);
    const textStyle =
      value === "eligible" || value === "confirmed_eligible"
        ? styles.eligibleText
        : value === "not_eligible" || value === "confirmed_not_eligible"
          ? styles.notEligibleText
          : value === "further_review"
            ? styles.furtherReviewText
            : styles.cellText;

    return <Text style={[styles.cellText, textStyle, style]}>{label}</Text>;
  };

  const doc = (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* Letterhead */}
        {letterheadDataUrl ? (
          <PdfImage
            fixed
            style={styles.pageBackground}
            src={letterheadDataUrl}
          />
        ) : null}

        {/* Title */}
        <Text style={styles.title}>
          ESOS Onshore Commission Compliance Record
        </Text>

        {/* ── Policy Section ─────────────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Policy Reference</Text>
        <View style={styles.policyBox}>
          <Text style={styles.policyHeader}>
            Ban on the Payment of Agent Commissions for Onshore Transfers
          </Text>
          <Text style={styles.policyText}>
            From 1 July 2023, providers registered on CRICOS must not pay a
            commission or other benefit to an education agent for recruiting a
            student who is already in Australia on a student visa studying with
            a CRICOS provider (onshore student), unless a specific exemption
            applies.
          </Text>
          <Text style={[styles.policyText, { marginTop: 4 }]}>
            Exemptions may apply if:
          </Text>
          <Text style={styles.policyBullet}>
            • The student is transferring due to provider default or provider
            closure;
          </Text>
          <Text style={styles.policyBullet}>
            • The student is transferring within the first six months of their
            principal course and the provider has approved the transfer;
          </Text>
          <Text style={styles.policyBullet}>
            • The student holds a student visa to study a registered course with
            a CRICOS provider that is not their principal course, or is
            transferring from a school sector course;
          </Text>
          <Text style={styles.policyBullet}>
            • The original provider has ceased or is ceasing to provide the
            course;
          </Text>
          <Text style={styles.policyBullet}>
            • A government sponsor requires or requests the transfer.
          </Text>
          <Text style={[styles.policyText, { marginTop: 4 }]}>
            Source: Australian Government, Department of Education — ESOS
            Framework. For full details see:{" "}
          </Text>
          <Text style={[styles.policyText, { color: PRIMARY }]}>
            https://www.education.gov.au/esos-framework/resources/ban-payment-agent-commissions-onshore-transfers
          </Text>
        </View>

        {/* ── Applicant Details ─────────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Applicant Details</Text>
        <View style={styles.detailsTable}>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Student Name</Text>
            <Text style={styles.detailsValue}>
              {getString(data.studentName) || " "}
            </Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Student Origin</Text>
            <Text style={styles.detailsValue}>
              {getString(data.studentOrigin) || " "}
            </Text>
          </View>
          <View style={[styles.detailsRow, styles.detailsRowLast]}>
            <Text style={styles.detailsLabel}>Application ID</Text>
            <Text style={styles.detailsValue}>
              {getString(data.applicationId) || " "}
            </Text>
          </View>
        </View>

        {/* ── Compliance Checklist ──────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Compliance Checklist</Text>
        <View style={styles.checklistTable}>
          {/* Header */}
          <View style={styles.checklistHeaderRow}>
            <View style={styles.checklistCellStage}>
              <Text style={styles.headerText}>Stage</Text>
            </View>
            <View style={styles.checklistCellAssessment}>
              <Text style={styles.headerText}>Assessed By</Text>
            </View>
            <View style={styles.checklistCellResult}>
              <Text style={styles.headerText}>Result</Text>
            </View>
            <View style={styles.checklistCellDate}>
              <Text style={styles.headerText}>Timestamp</Text>
            </View>
          </View>

          {/* Stage 1 — Agent */}
          <View style={styles.checklistRow}>
            <View style={styles.checklistCellStage}>
              <Text style={styles.cellText}>1</Text>
            </View>
            <View style={styles.checklistCellAssessment}>
              <Text style={styles.cellText}>
                Agent Self-Assessment{"\n"}
                <Text style={{ color: "#64748b" }}>
                  (Submitted with application)
                </Text>
              </Text>
              {data.esosAgentAssessmentReason ? (
                <Text style={{ fontSize: 7, color: "#475569", marginTop: 4 }}>
                  Reason: {data.esosAgentAssessmentReason}
                </Text>
              ) : null}
            </View>
            <View style={styles.checklistCellResult}>
              <ResultText value={data.esosAgentAssessment} />
            </View>
            <View style={styles.checklistCellDate}>
              <Text style={styles.cellText}>
                {formatDate(data.esosAgentAssessmentDate)}
              </Text>
            </View>
          </View>

          {/* Stage 2 — Admissions Officer */}
          <View style={styles.checklistRow}>
            <View style={styles.checklistCellStage}>
              <Text style={styles.cellText}>2</Text>
            </View>
            <View style={styles.checklistCellAssessment}>
              <Text style={styles.cellText}>
                Admissions Officer Review{"\n"}
                <Text style={{ color: "#64748b" }}>
                  (Completed before offer letter)
                </Text>
              </Text>
              {data.esosAdmissionsReviewReason ? (
                <Text style={{ fontSize: 7, color: "#475569", marginTop: 4 }}>
                  Reason: {data.esosAdmissionsReviewReason}
                </Text>
              ) : null}
            </View>
            <View style={styles.checklistCellResult}>
              <ResultText value={data.esosAdmissionsReview} />
            </View>
            <View style={styles.checklistCellDate}>
              <Text style={styles.cellText}>
                {formatDate(data.esosAdmissionsReviewDate)}
              </Text>
            </View>
          </View>

          {/* Stage 3 — COE Confirmation */}
          <View style={[styles.checklistRow, styles.checklistRowLast]}>
            <View style={styles.checklistCellStage}>
              <Text style={styles.cellText}>3</Text>
            </View>
            <View style={styles.checklistCellAssessment}>
              <Text style={styles.cellText}>
                COE Confirmation{"\n"}
                <Text style={{ color: "#64748b" }}>
                  (Completed before COE issuance)
                </Text>
              </Text>
              {data.esosCoeReason ? (
                <Text style={{ fontSize: 7, color: "#475569", marginTop: 4 }}>
                  Notes: {data.esosCoeReason}
                </Text>
              ) : null}
            </View>
            <View style={styles.checklistCellResult}>
              <ResultText value={data.esosCoeConfirmation} />
            </View>
            <View style={styles.checklistCellDate}>
              <Text style={styles.cellText}>
                {formatDate(data.esosCoeConfirmationDate)}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer note */}
        <Text style={styles.footerNote}>
          This record was automatically generated by the Churchill Education
          student application portal. It documents compliance with the ESOS
          Framework ban on agent commissions for onshore transfers.
        </Text>
      </Page>
    </Document>
  );

  return await pdf(doc).toBlob();
}
