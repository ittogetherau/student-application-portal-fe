"use client";

import type { StaffAssessmentResponse } from "@/service/gs-assessment.service";
import {
  Document,
  Image as PdfImage,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from "@react-pdf/renderer";

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

function formatAnswer(answer: unknown): string {
  if (typeof answer === "boolean") return answer ? "Yes" : "No";
  const raw = getString(answer).trim();
  if (!raw) return "";
  const lower = raw.toLowerCase();
  if (lower === "yes" || lower === "y" || lower === "true") return "Yes";
  if (lower === "no" || lower === "n" || lower === "false") return "No";
  return raw;
}

function isYes(value: unknown): boolean {
  return formatAnswer(value).toLowerCase() === "yes";
}

function isNo(value: unknown): boolean {
  return formatAnswer(value).toLowerCase() === "no";
}

function isTrue(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  const raw = getString(value).trim().toLowerCase();
  return raw === "true" || raw === "yes" || raw === "1";
}

function formatApprovalStatus(
  value: unknown,
): "approved" | "not-approved" | "not-applicable" | "" {
  const raw = getString(value).trim().toLowerCase();
  if (!raw) return "";
  if (raw === "approved") return "approved";
  if (raw === "not-approved" || raw === "not approved" || raw === "rejected")
    return "not-approved";
  if (raw === "not-applicable" || raw === "not applicable" || raw === "na")
    return "not-applicable";
  return "";
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

async function loadLogoPngDataUrl(): Promise<string | null> {
  try {
    const response = await fetch("/images/logo.svg", { cache: "force-cache" });
    if (!response.ok) return null;

    const blob = await response.blob();
    const isSvg =
      blob.type.includes("svg") ||
      (await blob.slice(0, 200).text()).includes("<svg");

    if (isSvg) {
      const svgText = await blob.text();
      return await svgToPngDataUrl(svgText);
    }

    const reader = new FileReader();
    return await new Promise<string>((resolve, reject) => {
      reader.onerror = () => reject(new Error("Failed to read logo"));
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

const BORDER_COLOR = "#808285";
const LABEL_FILL = "#D0CECE";
const LIGHT_FILL = "#f8fafc";

const styles = StyleSheet.create({
  page: {
    paddingTop: 70,
    paddingBottom: 46,
    paddingHorizontal: 32,
    fontSize: 8,
    color: "#0f172a",
    lineHeight: 1.35,
    fontFamily: "Helvetica",
  },
  headerContainer: {
    position: "absolute",
    left: 32,
    right: 32,
    top: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  logo: {
    width: 170,
    height: 34,
    objectFit: "contain",
  },
  footerContainer: {
    position: "absolute",
    left: 32,
    right: 32,
    bottom: 18,
    fontSize: 7,
    color: "#475569",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerLeft: {
    flex: 1,
    paddingRight: 10,
  },
  footerRight: {
    width: 110,
    textAlign: "right",
  },
  title: {
    fontSize: 9,
    textAlign: "left",
    fontWeight: "bold",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  applicantDetailsTable: {
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    marginBottom: 10,
  },
  applicantDetailsRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  applicantDetailsRowLast: {
    borderBottomWidth: 0,
  },
  applicantDetailsCell: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRightWidth: 1,
    borderRightColor: BORDER_COLOR,
  },
  applicantDetailsCellLast: {
    borderRightWidth: 0,
  },
  applicantDetailsCellLabel: {
    backgroundColor: LABEL_FILL,
  },
  applicantDetailsLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#111827",
  },
  applicantDetailsValue: {
    fontSize: 8,
    color: "#0f172a",
  },
  table: {
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    marginBottom: 10,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: LIGHT_FILL,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableCell: {
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRightWidth: 1,
    borderRightColor: BORDER_COLOR,
  },
  tableCellLast: {
    borderRightWidth: 0,
  },
  cellQuestion: {
    flexGrow: 1,
    flexBasis: 0,
  },
  cellYN: {
    width: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  cellEvidence: {
    width: 74,
    alignItems: "center",
    justifyContent: "center",
  },
  cellApproval: {
    width: 150,
  },
  statusCellLabel: {
    width: "50%",
  },
  statusCellOption: {
    width: "25%",
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
  },
  statusHeaderText: {
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
  },
  checkboxBox: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxBoxSmall: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxMark: {
    fontSize: 8,
    lineHeight: 1,
    marginTop: -1,
  },
  checkboxMarkSmall: {
    fontSize: 7,
    lineHeight: 1,
    marginTop: -1,
  },
  approvalOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  compactTable: {
    fontSize: 8,
  },
  compactTableCell: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  compactHeaderText: {
    fontSize: 8,
  },
  compactApprovalOption: {
    gap: 4,
    marginBottom: 1,
  },
  compactApprovalLabel: {
    fontSize: 7,
  },
  approvalLabel: {
    fontSize: 8,
  },
  footerNote: {
    fontSize: 7,
    color: "#475569",
    marginTop: 8,
  },
});

export function getGsAssessmentPdfFilename(applicationId?: string): string {
  return `gs-assessment-${applicationId ?? "application"}.pdf`;
}

export async function generateGsAssessmentPdfBlob({
  data,
}: {
  data: StaffAssessmentResponse;
}): Promise<Blob> {
  const logoDataUrl = await loadLogoPngDataUrl();

  const renderFooter = () => (
    <View style={styles.footerContainer} fixed>
      <View style={styles.footerRow}>
        <Text
          style={styles.footerLeft}
          render={({ pageNumber }) =>
            `Page | ${pageNumber} Churchill Institute of Higher Education Staff GS Assessment`
          }
        />
        <Text style={styles.footerRight}>February 2026</Text>
      </View>
    </View>
  );

  const CheckboxMark = ({ checked }: { checked: boolean }) => (
    <View style={styles.checkboxBox}>
      {checked ? <Text style={styles.checkboxMark}>X</Text> : null}
    </View>
  );

  const ApplicantDetailsTable = () => {
    const applicant = (data.applicant_details ?? {}) as Record<string, unknown>;

    return (
      <View style={styles.applicantDetailsTable}>
        <View style={styles.applicantDetailsRow}>
          <View
            style={[
              styles.applicantDetailsCell,
              styles.applicantDetailsCellLabel,
            ]}
          >
            <Text style={styles.applicantDetailsLabel}>Given Name(s)</Text>
          </View>
          <View style={styles.applicantDetailsCell}>
            <Text style={styles.applicantDetailsValue}>
              {getString(applicant.given_name) || " "}
            </Text>
          </View>
          <View
            style={[
              styles.applicantDetailsCell,
              styles.applicantDetailsCellLabel,
            ]}
          >
            <Text style={styles.applicantDetailsLabel}>Family Name</Text>
          </View>
          <View
            style={[
              styles.applicantDetailsCell,
              styles.applicantDetailsCellLast,
            ]}
          >
            <Text style={styles.applicantDetailsValue}>
              {getString(applicant.family_name) || " "}
            </Text>
          </View>
        </View>

        <View style={styles.applicantDetailsRow}>
          <View
            style={[
              styles.applicantDetailsCell,
              styles.applicantDetailsCellLabel,
            ]}
          >
            <Text style={styles.applicantDetailsLabel}>DOB</Text>
          </View>
          <View style={styles.applicantDetailsCell}>
            <Text style={styles.applicantDetailsValue}>
              {getString(applicant.dob) || " "}
            </Text>
          </View>
          <View
            style={[
              styles.applicantDetailsCell,
              styles.applicantDetailsCellLabel,
            ]}
          >
            <Text style={styles.applicantDetailsLabel}>
              Student ID / Ref no
            </Text>
          </View>
          <View
            style={[
              styles.applicantDetailsCell,
              styles.applicantDetailsCellLast,
            ]}
          >
            <Text style={styles.applicantDetailsValue}>
              {getString(applicant.ref_no) || " "}
            </Text>
          </View>
        </View>

        <View
          style={[styles.applicantDetailsRow, styles.applicantDetailsRowLast]}
        >
          <View
            style={[
              styles.applicantDetailsCell,
              styles.applicantDetailsCellLabel,
            ]}
          >
            <Text style={styles.applicantDetailsLabel}>Passport No</Text>
          </View>
          <View style={styles.applicantDetailsCell}>
            <Text style={styles.applicantDetailsValue}>
              {getString(applicant.passport_no) || " "}
            </Text>
          </View>
          <View
            style={[
              styles.applicantDetailsCell,
              styles.applicantDetailsCellLabel,
            ]}
          >
            <Text style={styles.applicantDetailsLabel}>Email</Text>
          </View>
          <View
            style={[
              styles.applicantDetailsCell,
              styles.applicantDetailsCellLast,
            ]}
          >
            <Text style={styles.applicantDetailsValue}>
              {getString(applicant.email) || " "}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const Stage1Table = () => {
    const stage1 = (data.stage1_questions ?? []) as Array<
      Record<string, unknown>
    >;

    return (
      <View style={styles.table}>
        <View style={styles.tableHeaderRow}>
          <View style={[styles.tableCell, styles.cellQuestion]}>
            <Text style={styles.headerText}>A) Application</Text>
          </View>
          <View style={[styles.tableCell, styles.cellYN]}>
            <Text style={styles.headerText}>YES</Text>
          </View>
          <View style={[styles.tableCell, styles.cellYN]}>
            <Text style={styles.headerText}>NO</Text>
          </View>
          <View
            style={[
              styles.tableCell,
              styles.cellEvidence,
              styles.tableCellLast,
            ]}
          >
            <Text style={styles.headerText}>Evidence Verified</Text>
          </View>
        </View>

        {stage1.length ? (
          stage1.map((q, index) => {
            const answer = getString(q.answer);
            const rowIsLast = index === stage1.length - 1;
            return (
              <View
                key={`stage1-${getString(q.id) || index}`}
                style={
                  rowIsLast
                    ? [styles.tableRow, styles.tableRowLast]
                    : styles.tableRow
                }
              >
                <View style={[styles.tableCell, styles.cellQuestion]}>
                  <Text>
                    {getString(q.question) || `Question ${index + 1}`}
                  </Text>
                </View>
                <View style={[styles.tableCell, styles.cellYN]}>
                  <CheckboxMark checked={isYes(answer)} />
                </View>
                <View style={[styles.tableCell, styles.cellYN]}>
                  <CheckboxMark checked={isNo(answer)} />
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.cellEvidence,
                    styles.tableCellLast,
                  ]}
                >
                  <CheckboxMark checked={isTrue(q.evidence_verified)} />
                </View>
              </View>
            );
          })
        ) : (
          <View style={[styles.tableRow, styles.tableRowLast]}>
            <View style={[styles.tableCell, styles.cellQuestion]}>
              <Text style={styles.footerNote}>No stage 1 responses.</Text>
            </View>
            <View style={[styles.tableCell, styles.cellYN]} />
            <View style={[styles.tableCell, styles.cellYN]} />
            <View
              style={[
                styles.tableCell,
                styles.cellEvidence,
                styles.tableCellLast,
              ]}
            />
          </View>
        )}
      </View>
    );
  };

  const Stage2Table = () => {
    const stage2 = (data.stage2_questions ?? []) as Array<
      Record<string, unknown>
    >;

    const CheckboxMarkSmall = ({ checked }: { checked: boolean }) => (
      <View style={styles.checkboxBoxSmall}>
        {checked ? <Text style={styles.checkboxMarkSmall}>X</Text> : null}
      </View>
    );

    return (
      <View style={[styles.table, styles.compactTable]}>
        <View style={styles.tableHeaderRow}>
          <View
            style={[
              styles.tableCell,
              styles.compactTableCell,
              styles.cellQuestion,
            ]}
          >
            <Text style={[styles.headerText, styles.compactHeaderText]}>
              GTE Document
            </Text>
          </View>
          <View
            style={[styles.tableCell, styles.compactTableCell, styles.cellYN]}
          >
            <Text style={[styles.headerText, styles.compactHeaderText]}>
              YES
            </Text>
          </View>
          <View
            style={[styles.tableCell, styles.compactTableCell, styles.cellYN]}
          >
            <Text style={[styles.headerText, styles.compactHeaderText]}>
              NO
            </Text>
          </View>
          <View
            style={[
              styles.tableCell,
              styles.compactTableCell,
              styles.cellEvidence,
            ]}
          >
            <Text style={[styles.headerText, styles.compactHeaderText]}>
              Evidence Verified
            </Text>
          </View>
          <View
            style={[
              styles.tableCell,
              styles.compactTableCell,
              styles.cellApproval,
              styles.tableCellLast,
            ]}
          >
            <Text style={[styles.headerText, styles.compactHeaderText]}>
              Approval Status
            </Text>
          </View>
        </View>

        {stage2.length ? (
          stage2.map((q, index) => {
            const answer = getString(q.answer);
            const status = formatApprovalStatus(q.approval_status);
            const rowIsLast = index === stage2.length - 1;
            return (
              <View
                key={`stage2-${getString(q.id) || index}`}
                style={
                  rowIsLast
                    ? [styles.tableRow, styles.tableRowLast]
                    : styles.tableRow
                }
              >
                <View
                  style={[
                    styles.tableCell,
                    styles.compactTableCell,
                    styles.cellQuestion,
                  ]}
                >
                  <Text>
                    {getString(q.question) || `Question ${index + 1}`}
                  </Text>
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.compactTableCell,
                    styles.cellYN,
                  ]}
                >
                  <CheckboxMarkSmall checked={isYes(answer)} />
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.compactTableCell,
                    styles.cellYN,
                  ]}
                >
                  <CheckboxMarkSmall checked={isNo(answer)} />
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.compactTableCell,
                    styles.cellEvidence,
                  ]}
                >
                  <CheckboxMarkSmall checked={isTrue(q.evidence_verified)} />
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.compactTableCell,
                    styles.cellApproval,
                    styles.tableCellLast,
                  ]}
                >
                  <View
                    style={[
                      styles.approvalOption,
                      styles.compactApprovalOption,
                    ]}
                  >
                    <CheckboxMarkSmall checked={status === "approved"} />
                    <Text
                      style={[
                        styles.approvalLabel,
                        styles.compactApprovalLabel,
                      ]}
                    >
                      Approved
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.approvalOption,
                      styles.compactApprovalOption,
                    ]}
                  >
                    <CheckboxMarkSmall checked={status === "not-approved"} />
                    <Text
                      style={[
                        styles.approvalLabel,
                        styles.compactApprovalLabel,
                      ]}
                    >
                      Not Approved
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.approvalOption,
                      styles.compactApprovalOption,
                    ]}
                  >
                    <CheckboxMarkSmall checked={status === "not-applicable"} />
                    <Text
                      style={[
                        styles.approvalLabel,
                        styles.compactApprovalLabel,
                      ]}
                    >
                      Not Applicable
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          <View style={[styles.tableRow, styles.tableRowLast]}>
            <View
              style={[
                styles.tableCell,
                styles.compactTableCell,
                styles.cellQuestion,
              ]}
            >
              <Text style={styles.footerNote}>No stage 2 responses.</Text>
            </View>
            <View
              style={[styles.tableCell, styles.compactTableCell, styles.cellYN]}
            />
            <View
              style={[styles.tableCell, styles.compactTableCell, styles.cellYN]}
            />
            <View
              style={[
                styles.tableCell,
                styles.compactTableCell,
                styles.cellEvidence,
              ]}
            />
            <View
              style={[
                styles.tableCell,
                styles.compactTableCell,
                styles.cellApproval,
                styles.tableCellLast,
              ]}
            />
          </View>
        )}
      </View>
    );
  };

  const doc = (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.headerContainer} fixed>
          {logoDataUrl ? (
            <PdfImage style={styles.logo} src={logoDataUrl} />
          ) : null}
        </View>
        {renderFooter()}

        <Text style={styles.title}>Genuine Student (GS) Assessment</Text>

        <Text style={styles.sectionTitle}>Applicant Detail</Text>
        <ApplicantDetailsTable />

        <Text style={styles.sectionTitle}>Stage 1</Text>
        <Stage1Table />

        <Text style={styles.sectionTitle}>Stage 2</Text>
        <Stage2Table />

        <Text style={styles.sectionTitle}>Student GS Status</Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <View style={[styles.tableCell, styles.statusCellLabel]}>
              <Text style={styles.statusHeaderText}>Status</Text>
            </View>
            <View style={[styles.tableCell, styles.statusCellOption]}>
              <Text style={styles.statusHeaderText}>Approved</Text>
            </View>
            <View
              style={[
                styles.tableCell,
                styles.statusCellOption,
                styles.tableCellLast,
              ]}
            >
              <Text style={styles.statusHeaderText}>Not Approved</Text>
            </View>
          </View>
          <View style={[styles.tableRow, styles.tableRowLast]}>
            <View style={[styles.tableCell, styles.statusCellLabel]}>
              <Text>Student GS Status</Text>
            </View>
            <View style={[styles.tableCell, styles.statusCellOption]}>
              <CheckboxMark
                checked={
                  formatApprovalStatus(data.recommendation) === "approved" ||
                  getString(data.recommendation).toLowerCase() === "approved"
                }
              />
            </View>
            <View
              style={[
                styles.tableCell,
                styles.statusCellOption,
                styles.tableCellLast,
              ]}
            >
              <CheckboxMark
                checked={
                  formatApprovalStatus(data.recommendation) ===
                    "not-approved" ||
                  getString(data.recommendation).toLowerCase() ===
                    "not_approved" ||
                  getString(data.recommendation).toLowerCase() ===
                    "not approved"
                }
              />
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Note:</Text>
        <Text>{getString(data.additional_comments) || " "}</Text>
      </Page>
    </Document>
  );

  return await pdf(doc).toBlob();
}
