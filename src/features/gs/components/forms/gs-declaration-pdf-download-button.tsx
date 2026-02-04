"use client";
import { Button, buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";
import { Download } from "lucide-react";
import {
  useCallback,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { toast } from "react-hot-toast";
import { GSScreeningFormValues } from "../../utils/gs-screening.validation";

type ButtonVariantProps = VariantProps<typeof buttonVariants>;
type ButtonLikeProps = ComponentProps<"button"> &
  ButtonVariantProps & { asChild?: boolean };

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

function isYesAnswer(answer: unknown): boolean {
  return formatAnswer(answer).toLowerCase() === "yes";
}

function formatMoney(value: unknown): string {
  const raw = typeof value === "number" ? value : parseFloat(getString(value));
  if (!Number.isFinite(raw)) return "";
  return raw.toFixed(2);
}

export function GSDeclarationPdfDownloadButton({
  data,
  applicationId,
  buttonText = "Download PDF",
  ...buttonProps
}: {
  data: GSScreeningFormValues | null | undefined;
  applicationId?: string;
  buttonText?: string;
} & Omit<ButtonLikeProps, "type" | "onClick" | "disabled" | "children">) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!data) {
      toast.error("No declaration data to export");
      return;
    }

    try {
      setIsDownloading(true);

      const {
        Document,
        Page,
        Text,
        View,
        StyleSheet,
        pdf,
        Image: PdfImage,
        Link,
      } = await import("@react-pdf/renderer");

      const PRIMARY_ORANGE = "#E59725";
      const BORDER_COLOR = "#E59725";

      const LINK_DEFS: Array<{ match: string; href: string }> = [
        {
          match: "Department of Home Affairs website.",
          href: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500/genuine-student-requirement",
        },
        {
          match:
            "Genuine Student criteria provided by the Department of Home Affairs",
          href: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500/genuine-student-requirement",
        },
        {
          match: "Genuine Student requirements",
          href: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500/genuine-student-requirement",
        },
        {
          match: "THE DHA",
          href: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500/genuine-student-requirement",
        },
        {
          match: "the DHA",
          href: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500/genuine-student-requirement",
        },
        {
          match: "Ministerial Direction No 106",
          href: "https://immi.homeaffairs.gov.au/Visa-subsite/files/direction-no-106.pdf",
        },
        {
          match: "Ministerial Direction Number 106",
          href: "https://immi.homeaffairs.gov.au/Visa-subsite/files/direction-no-106.pdf",
        },
        {
          match: "Subclass 500 Student visa)",
          href: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
        },
        {
          match: "Admission Policy / Guidelines",
          href: "https://student.churchill.nsw.edu.au/policies",
        },
        {
          match: "Admissions Policy / Guidelines",
          href: "https://student.churchill.nsw.edu.au/policies",
        },
        {
          match: "Student Fees Policy",
          href: "https://student.churchill.nsw.edu.au/policies",
        },
        {
          match: "course information on Churchill's website",
          href: "https://churchill.nsw.edu.au/courses",
        },
        {
          match: "course information on Churchill’s website",
          href: "https://churchill.nsw.edu.au/courses",
        },
        {
          match:
            "Refer to the advanced standing information on Churchill's website",
          href: "https://churchill.nsw.edu.au/apply-for-advanced-standing",
        },
        {
          match:
            "Refer to the advanced standing information on Churchill’s website",
          href: "https://churchill.nsw.edu.au/apply-for-advanced-standing",
        },
        {
          match: "any change to the information I have provided.",
          href: "http://www.uow.edu.au/legal/privacy/UOW089606.html",
        },
        {
          match: "admissions@churchill.nsw.edu.au",
          href: "mailto:admissions@churchill.nsw.edu.au",
        },
      ];

      const svgToPngDataUrl = async (svgString: string) => {
        const objectUrl = URL.createObjectURL(
          new Blob([svgString], { type: "image/svg+xml" }),
        );
        try {
          const img = new window.Image();
          img.decoding = "async";
          img.src = objectUrl;
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error("Failed to load SVG"));
          });

          const canvas = window.document.createElement("canvas");
          // Render at a reasonably high resolution for crisp PDF output.
          canvas.width = 1200;
          canvas.height = 240;
          const ctx = canvas.getContext("2d");
          if (!ctx) return null;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          return canvas.toDataURL("image/png");
        } catch {
          return null;
        } finally {
          URL.revokeObjectURL(objectUrl);
        }
      };

      const logoDataUrl = await (async () => {
        try {
          const response = await fetch("/images/logo.svg", {
            cache: "force-cache",
          });
          if (!response.ok) return null;
          const blob = await response.blob();

          const isSvg =
            blob.type === "image/svg+xml" ||
            blob.type === "" ||
            response.headers.get("content-type")?.includes("image/svg+xml") ===
              true;

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
      })();

      const applicantSignatureDataUrl = data.applicantSignature
        ? await svgToPngDataUrl(String(data.applicantSignature))
        : null;
      const agentSignatureDataUrl = data.agentSignature
        ? await svgToPngDataUrl(String(data.agentSignature))
        : null;

      const styles = StyleSheet.create({
        page: {
          paddingTop: 70,
          paddingBottom: 46,
          paddingHorizontal: 32,
          fontSize: 10,
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
        logoRow: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
          marginBottom: 10,
        },
        logo: {
          width: 160,
          height: 32,
          objectFit: "contain",
        },
        header: {
          fontSize: 9,
          color: "#475569",
          textAlign: "right",
          marginBottom: 10,
        },
        footerContainer: {
          position: "absolute",
          left: 32,
          right: 32,
          bottom: 18,
          fontSize: 8,
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
        link: {
          color: PRIMARY_ORANGE,
          textDecoration: "underline",
        },
        title: {
          fontSize: 17,
          textAlign: "left",
          fontWeight: "bold",
          marginBottom: 6,
          textTransform: "uppercase",
        },
        subtitle: {
          fontSize: 10,
          textAlign: "left",
          marginBottom: 12,
        },
        paragraph: {
          marginBottom: 6,
        },
        introParagraph: {
          fontSize: 9,
          marginBottom: 6,
          color: "#334155",
        },
        note: {
          fontSize: 9,
          fontStyle: "italic",
          color: "#475569",
          marginTop: 2,
          marginBottom: 10,
        },
        sectionTitle: {
          fontSize: 11,
          fontWeight: "bold",
          marginTop: 8,
          marginBottom: 6,
          textTransform: "uppercase",
        },
        sectionBlock: {
          marginBottom: 12,
        },
        sectionDivider: {
          height: 1,
          backgroundColor: "#0f172a",
          marginBottom: 6,
        },
        fieldRow: {
          flexDirection: "row",
          gap: 10,
          marginBottom: 6,
        },
        fieldLabel: {
          width: 130,
          color: "#1f2937",
        },
        fieldValue: {
          flexGrow: 1,
          borderBottomWidth: 1,
          borderBottomColor: BORDER_COLOR,
          paddingBottom: 2,
        },
        fieldGridRow: {
          flexDirection: "row",
          gap: 12,
          marginBottom: 10,
        },
        fieldGridItem: {
          flex: 1,
        },
        fieldGridLabel: {
          fontSize: 9,
          color: "#1f2937",
          marginBottom: 4,
        },
        fieldGridLabelStrong: {
          fontWeight: "bold",
        },
        boldText: {
          fontWeight: "bold",
        },
        fieldGridBox: {
          borderWidth: 1,
          borderColor: BORDER_COLOR,
          paddingVertical: 7,
          paddingHorizontal: 8,
          minHeight: 26,
          borderRadius: 2,
        },
        questionBlock: {
          marginBottom: 8,
        },
        questionLabel: {
          fontSize: 11,
          fontWeight: "bold",
          marginBottom: 2,
        },
        answerBox: {
          borderWidth: 1,
          borderColor: BORDER_COLOR,
          minHeight: 24,
          padding: 6,
          marginBottom: 4,
        },
        checkboxRow: {
          marginBottom: 8,
        },
        checkboxQuestion: {
          fontSize: 11,
          fontWeight: "bold",
          marginBottom: 4,
        },
        checkboxOptionsRow: {
          flexDirection: "row",
          gap: 14,
        },
        checkboxOption: {
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
        },
        checkboxBox: {
          width: 12,
          height: 12,
          borderWidth: 1,
          borderColor: "#0f172a",
          alignItems: "center",
          justifyContent: "center",
        },
        checkboxMark: {
          fontSize: 10,
          lineHeight: 1,
          marginTop: -1,
        },
        checkboxOptionLabel: {
          fontSize: 9,
        },
        listRow: {
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 6,
          marginBottom: 4,
        },
        orderedMarker: {
          width: 14,
          textAlign: "right",
        },
        bulletMarker: {
          width: 18,
          textAlign: "right",
        },
        listBody: {
          flex: 1,
        },
        listSubRow: {
          marginLeft: 14,
        },
        applicantDetailsTable: {
          borderWidth: 1,
          borderColor: BORDER_COLOR,
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
        applicantDetailsCellLabel: {
          backgroundColor: "#f8fafc",
        },
        applicantDetailsCellLast: {
          borderRightWidth: 0,
        },
        applicantDetailsLabel: {
          fontSize: 9,
          color: "#334155",
          fontWeight: "bold",
          marginBottom: 2,
        },
        applicantDetailsValue: {
          fontSize: 10,
        },
        table: {
          borderWidth: 1,
          borderColor: BORDER_COLOR,
          marginTop: 6,
        },
        tableRow: {
          flexDirection: "row",
          borderBottomWidth: 1,
          borderBottomColor: "#e2e8f0",
        },
        tableCell: {
          flex: 1,
          paddingVertical: 4,
          paddingHorizontal: 6,
          borderRightWidth: 1,
          borderRightColor: "#e2e8f0",
        },
        tableCellLast: {
          borderRightWidth: 0,
        },
        tableHeader: {
          backgroundColor: "#f8fafc",
          fontWeight: "bold",
        },
        footerNote: {
          fontSize: 9,
          color: "#475569",
          marginTop: 8,
        },
        signatureLine: {
          marginTop: 10,
          borderBottomWidth: 1,
          borderBottomColor: "#0f172a",
        },
        signatureImage: {
          width: 160,
          height: 56,
          objectFit: "contain",
          marginTop: 6,
          marginBottom: 6,
        },
        signatureBox: {
          borderWidth: 1,
          borderColor: BORDER_COLOR,
          paddingVertical: 8,
          paddingHorizontal: 8,
          minHeight: 70,
          borderRadius: 2,
          justifyContent: "center",
        },
        signaturePlaceholder: {
          height: 56,
        },
        documentLine: {
          fontSize: 9,
          color: "#1f2937",
          marginTop: 2,
        },
      });

      const renderTextWithLinks = (text: string) => {
        let segments: Array<string | { match: string; href: string }> = [text];

        for (const def of LINK_DEFS) {
          const next: typeof segments = [];
          for (const segment of segments) {
            if (typeof segment !== "string") {
              next.push(segment);
              continue;
            }

            let remaining = segment;
            while (remaining.includes(def.match)) {
              const idx = remaining.indexOf(def.match);
              const before = remaining.slice(0, idx);
              if (before) next.push(before);
              next.push({ match: def.match, href: def.href });
              remaining = remaining.slice(idx + def.match.length);
            }
            if (remaining) next.push(remaining);
          }
          segments = next;
        }

        let linkKey = 0;
        return segments.map((segment) => {
          if (typeof segment === "string") return segment;
          linkKey += 1;
          return (
            <Link
              key={`${segment.href}-${linkKey}`}
              src={segment.href}
              style={styles.link}
            >
              {segment.match}
            </Link>
          );
        });
      };

      const renderFooter = () => (
        <View style={styles.footerContainer} fixed>
          <View style={styles.footerRow}>
            <Text
              style={styles.footerLeft}
              render={({ pageNumber }) =>
                `Page | ${pageNumber} Churchill Institute of Higher Education Genuine Student (GS) Screening Form CRICOS: 04082E`
              }
            />
            <Text style={styles.footerRight}>February 2026</Text>
          </View>
        </View>
      );

      const FieldGridItem = ({
        label,
        value,
        labelStyle,
      }: {
        label: string;
        value: string;
        labelStyle?: any;
      }) => (
        <View style={styles.fieldGridItem}>
          <Text style={[styles.fieldGridLabel, labelStyle]}>{label}</Text>
          <View style={styles.fieldGridBox}>
            <Text>{value || " "}</Text>
          </View>
        </View>
      );

      const SignatureGridItem = ({
        label,
        signatureDataUrl,
        labelStyle,
      }: {
        label: string;
        signatureDataUrl: string | null;
        labelStyle?: any;
      }) => (
        <View style={styles.fieldGridItem}>
          <Text style={[styles.fieldGridLabel, labelStyle]}>{label}</Text>
          <View style={styles.signatureBox}>
            {signatureDataUrl ? (
              <PdfImage style={styles.signatureImage} src={signatureDataUrl} />
            ) : (
              <View style={styles.signaturePlaceholder} />
            )}
          </View>
        </View>
      );

      const QuestionBlock = ({
        label,
        answer,
      }: {
        label: string;
        answer?: string;
      }) => (
        <View style={styles.questionBlock}>
          <Text style={styles.questionLabel}>{label}</Text>
          <View style={styles.answerBox}>
            <Text>{answer || " "}</Text>
          </View>
        </View>
      );

      const CheckboxRow = ({
        label,
        value,
      }: {
        label: string;
        value?: string;
      }) => {
        const normalized = formatAnswer(value ?? "")
          .trim()
          .toLowerCase();
        const isYes = normalized === "yes";
        const isNo = normalized === "no";

        if (!isYes && !isNo) {
          return (
            <View style={styles.checkboxRow}>
              <Text style={styles.checkboxQuestion}>{label}</Text>
              <Text>{value ? value : "-"}</Text>
            </View>
          );
        }

        return (
          <View style={styles.checkboxRow}>
            <Text style={styles.checkboxQuestion}>{label}</Text>
            <View style={styles.checkboxOptionsRow}>
              <View style={styles.checkboxOption}>
                <View style={styles.checkboxBox}>
                  {isYes ? <Text style={styles.checkboxMark}>X</Text> : null}
                </View>
                <Text style={styles.checkboxOptionLabel}>Yes</Text>
              </View>
              <View style={styles.checkboxOption}>
                <View style={styles.checkboxBox}>
                  {isNo ? <Text style={styles.checkboxMark}>X</Text> : null}
                </View>
                <Text style={styles.checkboxOptionLabel}>No</Text>
              </View>
            </View>
          </View>
        );
      };

      const OrderedListItem = ({
        index,
        children,
      }: {
        index: number;
        children: ReactNode;
      }) => (
        <View style={styles.listRow}>
          <Text style={styles.orderedMarker}>{index}.</Text>
          <Text style={styles.listBody}>{children}</Text>
        </View>
      );

      const BulletListItem = ({
        children,
        bullet = "-",
        isSubItem = false,
      }: {
        children: ReactNode;
        bullet?: string;
        isSubItem?: boolean;
      }) => (
        <View
          style={
            isSubItem ? [styles.listRow, styles.listSubRow] : styles.listRow
          }
        >
          <Text style={styles.bulletMarker}>{bullet}</Text>
          <Text style={styles.listBody}>{children}</Text>
        </View>
      );

      const doc = (
        <Document>
          <Page size="A4" style={styles.page} wrap>
            <View style={styles.headerContainer} fixed>
              {logoDataUrl ? (
                <PdfImage style={styles.logo} src={logoDataUrl} />
              ) : null}
            </View>
            {renderFooter()}
            <Text style={styles.title}>
              GENUINE STUDENT (GS) SCREENING FORM
            </Text>
            <Text style={styles.subtitle}>
              Genuine Student (GS) Form - Student to Complete
            </Text>
            <Text style={styles.introParagraph}>
              The Australian government has replaced the Genuine Temporary
              Entrant (GTE) requirement for student visas with a Genuine Student
              (GS) requirement. This is effective for student visa applications
              lodged on and after 23 March 2024.
            </Text>
            <Text style={styles.introParagraph}>
              All applicants for a student visa must be a genuine applicant for
              entry to Australia for the purpose of studying and obtaining a
              qualification. They must be able to demonstrate that studying in
              Australia is the primary reason of their student visa. To be
              granted a student visa, all applicants must demonstrate they
              satisfy the genuine student criterion or the genuine student
              dependent criterion. More information regarding the Genuine
              Student requirement is available on the{" "}
              {renderTextWithLinks("Department of Home Affairs website.")}
            </Text>
            <Text style={styles.introParagraph}>
              International students applying to Churchill Institute of Higher
              Education (PRV14305 | CRICOS Provider: 04082E) must be genuine in
              their intention to study, must comply with student visa
              requirements, enrol into their degree at Churchill Institute and
              must successfully complete their course at Churchill Institute of
              Higher Education. Please complete the below questions to
              demonstrate you meet the GS criteria. You must complete this form;
              and limit your response to each question below to a maximum of 150
              words and provide evidence to support your statements. Please
              refer to the{" "}
              {renderTextWithLinks(
                "Genuine Student criteria provided by the Department of Home Affairs",
              )}{" "}
              and {renderTextWithLinks("Ministerial Direction No 106")} when
              responding to the above questions.
            </Text>
            <Text style={styles.note}>
              Note: The Churchill Institute of Higher Education Genuine Student
              (GS) Checklist (Appendix A) must also be completed with this form
              as part of the application documents.
            </Text>

            <Text style={styles.sectionTitle}>SECTION A</Text>
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>1. Applicant details</Text>
              <View style={styles.applicantDetailsTable}>
                <View style={styles.applicantDetailsRow}>
                  <View
                    style={[
                      styles.applicantDetailsCell,
                      styles.applicantDetailsCellLabel,
                    ]}
                  >
                    <Text style={styles.applicantDetailsLabel}>
                      Given Name(s)
                    </Text>
                  </View>
                  <View style={styles.applicantDetailsCell}>
                    <Text style={styles.applicantDetailsValue}>
                      {getString(data.firstName) || " "}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.applicantDetailsCell,
                      styles.applicantDetailsCellLabel,
                    ]}
                  >
                    <Text style={styles.applicantDetailsLabel}>
                      Family Name
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.applicantDetailsCell,
                      styles.applicantDetailsCellLast,
                    ]}
                  >
                    <Text style={styles.applicantDetailsValue}>
                      {getString(data.lastName) || " "}
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
                    <Text style={styles.applicantDetailsLabel}>
                      Date of Birth (DOB)
                    </Text>
                  </View>
                  <View style={styles.applicantDetailsCell}>
                    <Text style={styles.applicantDetailsValue}>
                      {getString(data.dateOfBirth) || " "}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.applicantDetailsCell,
                      styles.applicantDetailsCellLabel,
                    ]}
                  >
                    <Text style={styles.applicantDetailsLabel}>
                      Student ID / Reference Number
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.applicantDetailsCell,
                      styles.applicantDetailsCellLast,
                    ]}
                  >
                    <Text style={styles.applicantDetailsValue}>
                      {getString(data.studentId) || " "}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.applicantDetailsRow,
                    styles.applicantDetailsRowLast,
                  ]}
                >
                  <View
                    style={[
                      styles.applicantDetailsCell,
                      styles.applicantDetailsCellLabel,
                    ]}
                  >
                    <Text style={styles.applicantDetailsLabel}>
                      Passport Number
                    </Text>
                  </View>
                  <View style={styles.applicantDetailsCell}>
                    <Text style={styles.applicantDetailsValue}>
                      {getString(data.passportNumber) || " "}
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
                      {getString(data.email) || " "}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>
                2. Current location (in Australia or overseas)
              </Text>
              <CheckboxRow
                label="A. Are you currently onshore/living in Australia?"
                value={formatAnswer(data.currentlyInAustralia)}
              />
              <CheckboxRow
                label="B. Do you intend to apply for a student visa to study this course?"
                value={formatAnswer(data.intendToApplyStudentVisa)}
              />
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>3. Immigration history</Text>
              <CheckboxRow
                label="A. Have you ever had a visa refused or cancelled in any country including Australia?"
                value={formatAnswer(data.visaRefusedOrCancelled)}
              />
              {isYesAnswer(data.visaRefusedOrCancelled) ? (
                <QuestionBlock
                  label="If Yes – explain the reason for your previous visa refusal, how your circumstances have changed since then, and why you believe your new visa application will be successful."
                  answer={getString(data.visaRefusalExplanation)}
                />
              ) : null}
              <CheckboxRow
                label="B. Have any of your immediate family members ever had a visa refused or cancelled in any country including Australia?"
                value={formatAnswer(data.familyVisaRefusedOrCancelled)}
              />
            </View>

            <Text style={styles.sectionTitle}>
              4. Course information and personal circumstances
            </Text>
            <QuestionBlock
              label="A. Provide information about your current situation, such as your connections to family, community, work and economic circumstances."
              answer={getString(data.currentSituation)}
            />
            <QuestionBlock
              label="B. Briefly outline your reasons for choosing the course/s you applied for at Churchill Institute of Higher Education and your understanding of the course."
              answer={getString(data.reasonsForCourse)}
            />
            <QuestionBlock
              label="C. Explain how completing this course will be of benefit to your future career prospects."
              answer={getString(data.careerBenefits)}
            />
            <QuestionBlock
              label="D. Provide any other relevant information that you have not included in the above responses."
              answer={getString(data.otherInformation)}
            />
            <Text style={styles.note}>
              If you are currently in Australia (onshore), complete Items E and
              F below.
            </Text>
            <QuestionBlock
              label="E. Provide details of your study history in Australia (include all courses studied, institution names and dates and previous visas held during this time). Attach copies of previous offer of admission letters, COEs, and academic transcripts."
              answer={getString(data.studyHistoryInAustralia)}
            />
            <QuestionBlock
              label="F. If you are holding a visa other than a student visa, provide reasons why you are now applying for a student visa. Include your study history while in Australia."
              answer={getString(data.reasonForStudentVisa)}
            />

            <Text style={styles.sectionTitle}>5. Family details</Text>
            <CheckboxRow
              label="Are you married?"
              value={formatAnswer(data.isMarried)}
            />
            <CheckboxRow
              label="Do you have children?"
              value={formatAnswer(data.hasChildren)}
            />
            <CheckboxRow
              label="A. Do you have any relatives (parents, brothers, sisters, aunties, uncles, cousins or in-laws) living in Australia?"
              value={formatAnswer(data.hasRelativesInAustralia)}
            />
            <CheckboxRow
              label="If Yes - are they a citizen/permanent resident of Australia?"
              value={formatAnswer(data.relativesAreCitizens)}
            />
            {data.relativesRelationshipType ? (
              <Text style={styles.documentLine}>
                {`Relationship details: ${getString(
                  data.relativesRelationshipType,
                )}`}
              </Text>
            ) : null}
            {data.relativesVisaType ? (
              <Text style={styles.documentLine}>
                {`Relatives visa type: ${getString(data.relativesVisaType)}`}
              </Text>
            ) : null}
            <CheckboxRow
              label="Do you intend to live with them while studying?"
              value={formatAnswer(data.intendToLiveWithRelatives)}
            />
            {data.relationshipDetails ? (
              <Text style={styles.documentLine}>
                {`Relationship details: ${getString(data.relationshipDetails)}`}
              </Text>
            ) : null}

            <Text style={styles.sectionTitle}>6. Living in Australia</Text>
            <QuestionBlock
              label="A. At which Churchill Institute of Higher Education campus will you study your course/s?"
              answer={getString(data.campusLocation)}
            />
            <QuestionBlock
              label="B. Name the specific suburb/city where you intend to live whilst studying (Include any family living in this location, your planned living and family arrangements, how you will commute to campus, etc.)"
              answer={getString(data.intendedSuburb)}
            />
            <QuestionBlock
              label="C. Explain your knowledge about living in Australia (e.g. accommodation details, cost of living and how you will commute to campus)"
              answer={getString(data.knowledgeAboutAustralia)}
            />

            <Text style={styles.sectionTitle}>
              SECTION B - FINANCIAL CAPACITY ASSESSMENT
            </Text>
            <Text style={styles.paragraph}>
              Check the Department of Home Affairs website ({" "}
              {renderTextWithLinks("Subclass 500 Student visa)")} for the most
              updated information about the financial capacity requirements.
            </Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCell}> </Text>
                <Text style={styles.tableCell}>Applicant</Text>
                <Text style={[styles.tableCell, styles.tableCellLast]}>
                  Family Members
                </Text>
              </View>
              {[
                [
                  "Travel (return Airfares)",
                  data.travelApplicant,
                  data.travelFamily,
                ],
                [
                  "Tuition for first year of study",
                  data.tuitionApplicant,
                  data.tuitionFamily,
                ],
                [
                  "Overseas Health Cover (OSHC)",
                  data.oshcApplicant,
                  data.oshcFamily,
                ],
                [
                  "Living Expenses",
                  data.livingExpensesApplicant,
                  data.livingExpensesFamily,
                ],
                [
                  "TOTAL funding (Applicant + Family Members)",
                  (
                    Number(data.travelApplicant || 0) +
                    Number(data.tuitionApplicant || 0) +
                    Number(data.oshcApplicant || 0) +
                    Number(data.livingExpensesApplicant || 0)
                  ).toFixed(2),
                  (
                    Number(data.travelFamily || 0) +
                    Number(data.tuitionFamily || 0) +
                    Number(data.oshcFamily || 0) +
                    Number(data.livingExpensesFamily || 0)
                  ).toFixed(2),
                ],
              ].map(([label, applicantValue, familyValue]) => (
                <View key={label as string} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{label as string}</Text>
                  <Text style={styles.tableCell}>
                    ${formatMoney(applicantValue)}
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellLast]}>
                    ${formatMoney(familyValue)}
                  </Text>
                </View>
              ))}
            </View>
            <Text style={styles.footerNote}>
              Applicants must refer to the{" "}
              <Text style={styles.boldText}>
                Churchill Institute of Higher Education
              </Text>{" "}
              Genuine Student (GS) Checklist (
              <Text style={styles.boldText}>Appendix A</Text>) for prescribed
              supporting documentation required to evidence financial capacity,
              sponsorship arrangements, and family circumstances, as mandated
              under the Department of Home Affairs student visa requirements.
            </Text>

            <Text style={styles.sectionTitle}>Declarations</Text>
            <Text style={styles.sectionTitle}>
              Applicant (Student) declaration
            </Text>
            {[
              "By submitting this form, I accept and declare that the information provided in this form is true and correct.",
              "I acknowledge and accept that Churchill Institute of Higher Education may vary or cancel any decision made based on incorrect, incomplete, false or misleading information which I may have provided, or due to changes to Australian Government policy.",
              "I understand that the information provided will be used for the assessment of my application for admission and subsequent enrolment by Churchill Institute of Higher Education and may also be accessed and used by Churchill Institute of Higher Education (such as any third party contractors engaged by Churchill Institute of Higher Education as part of the assessment process) and by the Education Agent, contracted by Churchill Institute, who has assisted with your completion this form. I understand that provision of this information is voluntary, and failure to provide the requested information may result in my application for admission being refused.",
              "I authorise any institution or organisation named on any document provided as evidence of my qualifications or work experience or which are named in my application to release to Churchill Institute of Higher Education or Churchill Institute of Higher Education (including any third party contractor engaged by Churchill Institute of Higher Education or its subsidiaries as part of the assessment process) personal information which they may hold about me for the purpose of verification of my supporting documents.",
              "I agree to inform Churchill Institute of Higher Education or Churchill Institute of Higher Education Australia immediately if there is any change to the information I have provided.",
            ].map((item, idx) => (
              <OrderedListItem key={item} index={idx + 1}>
                {renderTextWithLinks(item)}
              </OrderedListItem>
            ))}
            <View style={styles.fieldGridRow}>
              <FieldGridItem
                label="Applicant Full Name"
                value={getString(data.applicantFullName)}
                labelStyle={styles.fieldGridLabelStrong}
              />
              <FieldGridItem
                label="Date"
                value={getString(data.applicantDate)}
                labelStyle={styles.fieldGridLabelStrong}
              />
            </View>
            <View style={styles.fieldGridRow}>
              <SignatureGridItem
                label="Applicant signature"
                signatureDataUrl={applicantSignatureDataUrl}
                labelStyle={styles.fieldGridLabelStrong}
              />
              <View style={styles.fieldGridItem} />
            </View>

            <Text style={styles.sectionTitle}>Education Agent declaration</Text>
            <BulletListItem>
              {renderTextWithLinks(
                "I confirm that I have made reasonable enquiries to verify the information and documents provided to me by the student and, to the best of my knowledge and belief, the student is a Genuine Student for the purpose of studying in Australia. I understand that a GS is a person who satisfies the GS criterion for an Australian student visa as set out in Ministerial Direction Number 106.",
              )}
            </BulletListItem>
            <BulletListItem>
              {renderTextWithLinks(
                "I confirm that I have sighted, and verified the authenticity of, the original Academic Transcripts, Graduation Certificate and/or Completion Certificate of the Student.",
              )}
            </BulletListItem>
            <BulletListItem>
              {renderTextWithLinks(
                "I confirm that I have counselled the student on their student visa obligations, including work limitations, maintaining full-time study, holding Overseas Student Health Cover (OSHC), having and continuing to have sufficient financial resources to study and live in Australia and restrictions on deferring or suspending studies.",
              )}
            </BulletListItem>
            <BulletListItem>
              {renderTextWithLinks("I confirm that:")}
            </BulletListItem>
            {[
              "I have sighted, and verified the authenticity of, original financial statements which show that the student has access to sufficient funds for tuition, OSHC, living expenses and other fees payable for the duration of the student’s studies at Churchill Institute of Higher Education.",
              "I have counselled the student on the estimated cost of living in Australia and confirm that the student (and their dependents where applicable) will have sufficient funds to return to their country of citizenship or residence at the end of their studies.",
              "I have informed the student that they should notify Churchill Institute of Higher Education immediately if they encounter any financial difficulties during their studies, and that Churchill Institute cannot guarantee financial assistance; and",
              "I have informed the student that Churchill Institute of Higher Education reserves the right to ask for further documentation proving they have sufficient funds for the duration of their studies and, if Churchill Institute is not satisfied, they may withdraw any Offer of Admission and notify the Department of Home Affairs accordingly.",
            ].map((item) => (
              <BulletListItem key={item} bullet="- -" isSubItem>
                {renderTextWithLinks(item)}
              </BulletListItem>
            ))}
            <View style={styles.fieldGridRow}>
              <FieldGridItem
                label="Agency name / Branch"
                value={getString(data.agentAgencyName)}
                labelStyle={styles.fieldGridLabelStrong}
              />
              <FieldGridItem
                label="Counsellor’s name"
                value={getString(data.agentCounsellorName)}
                labelStyle={styles.fieldGridLabelStrong}
              />
            </View>
            <View style={styles.fieldGridRow}>
              <SignatureGridItem
                label="Agent signature"
                signatureDataUrl={agentSignatureDataUrl}
                labelStyle={styles.fieldGridLabelStrong}
              />
              <FieldGridItem
                label="Date"
                value={getString(data.agentDate)}
                labelStyle={styles.fieldGridLabelStrong}
              />
            </View>

            <View break />
            <Text style={styles.sectionTitle}>
              Appendix A: Application Checklist
            </Text>
            <Text style={styles.paragraph}>
              {renderTextWithLinks(
                "International Admissions Office - Churchill Institute of Higher Education (admissions@churchill.nsw.edu.au)",
              )}
            </Text>
            <Text style={styles.sectionTitle}>
              Demonstration of Financial Capacity
            </Text>
            <Text style={styles.paragraph}>
              It is a requirement for Student visa applicants to demonstrate the
              financial capacity to meet the tuition, living and travel costs
              associated with their studies in Australia. Applicants must also
              show that they can support members of their family who will be
              accompanying them during their stay in the country. If you have
              been requested by Churchill Institute of Higher Education to
              demonstrate financial capacity, you will need to provide:
            </Text>
            <Text style={styles.paragraph}>
              A completed Demonstration of Financial Capacity - Declaration
              form. Documentary evidence that satisfies either Option (1) or
              Option (2) described below.
            </Text>
            <Text style={styles.sectionTitle}>
              Option 1 - Showing sufficient funds to meet 12-month of expenses
              in Australia
            </Text>
            <Text style={styles.paragraph}>
              The amount of funds you are required to demonstrate are as per the
              table below, by adding the items (a) + (b) + (c) respectively.
            </Text>

            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCell}> </Text>
                <Text style={styles.tableCell}>Primary Applicant</Text>
                <Text style={[styles.tableCell, styles.tableCellLast]}>
                  Secondary Applicant(s)
                </Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Student</Text>
                <Text style={styles.tableCell}>Spouse</Text>
                <Text style={[styles.tableCell, styles.tableCellLast]}>
                  Children
                </Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Tuition Fees and OSHC</Text>
                <Text style={styles.tableCell}>
                  Refer to your Offer of Admission for the annual tuition fee
                  and OSHC
                </Text>
                <Text style={[styles.tableCell, styles.tableCellLast]}>-</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Living Expenses</Text>
                <Text style={styles.tableCell}>AUD$29,710</Text>
                <Text style={[styles.tableCell, styles.tableCellLast]}>
                  add AUD$10,394 (spouse) / add AUD$4,449 per child. Add an
                  extra AUD$13,502 per child of schooling age (6 - 17 years).
                </Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Travel</Text>
                <Text style={styles.tableCell}>AUD$2,000</Text>
                <Text style={[styles.tableCell, styles.tableCellLast]}>
                  - $5,000 depending on country where the application is lodged
                </Text>
              </View>
            </View>
            <Text style={styles.footerNote}>
              These figures are for 12 months, as of 10 May 2024. They should
              only be used for the GS assessment and are not representative of
              all costs that could be incurred.
            </Text>

            <Text style={styles.sectionTitle}>GS Checklist</Text>
            <Text style={styles.paragraph}>
              The GS checklist must be completed and attached alongside the
              declaration form. Ensure all items are verified with supporting
              documentation.
            </Text>
            {[
              "Have you explained the academic entry requirements of the course to the applicant (refer to the Admission Policy / Guidelines)?",
              "Does the applicant meet the English Language Proficiency (ELP) requirements? (Refer to the Admissions Policy / Guidelines)",
              "Has the applicant been advised of the study details, including content, duration, tuition fees, campus location, and career opportunities on completion of the program(s)? Refer the course information on Churchill's website",
              "If the applicant is seeking advanced standing (credit) have the relevant course outlines been provided? Refer to the advanced standing information on Churchill's website",
              "Are you satisfied that the course the applicant has selected is linked to their previous educational background and/or future career aspirations? Has evidence been sighted to support this?",
              "Are there any gaps in the applicant's study or employment history? If yes, provide details with supporting documentation.",
              "Has the applicant ever been excluded from another institution? If yes, provide details with supporting documentation.",
              "Have you verified that the applicant is able to meet the full financial requirements of the program/package programs applied, including the associated living and travel expenses as specified by DHA?",
              "Have you explained to the applicant the financial evidence they must be able to demonstrate to secure a student visa to study in Australia?",
              "Has the applicant been advised regarding tuition fee payments and refunds based on Churchill's Student Fees Policy?",
              "Have the scholarship terms and conditions been explained to the applicant, if applicable?",
              "Is the applicant married or in de-facto relationship?",
              "Does the applicant have children?",
              "Does the applicant intend to travel to Australia with their spouse or other family members?",
              "Does the applicant have any relatives living in Australia?",
              "Have you explained to the applicant the Genuine Student requirements as defined by the DHA?",
              "Is the applicant aware that they may be interviewed by Australian immigration authorities to determine their status as a Genuine Student?",
              "Does the applicant (or accompanying family members) have any visa refusals for Australia or any other country? If yes, attach all visa decision records.",
              "Are you satisfied that the applicant is a Genuine Student and can meet the Genuine Student requirements?",
            ].map((item) => (
              <Text key={item} style={styles.paragraph}>
                {renderTextWithLinks(item)}
              </Text>
            ))}
          </Page>
        </Document>
      );

      const blob = await pdf(doc).toBlob();

      const url = URL.createObjectURL(blob);
      const anchor = window.document.createElement("a");
      anchor.href = url;
      anchor.download = `gs-screening-form-${applicationId ?? "application"}.pdf`;
      window.document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsDownloading(false);
    }
  }, [applicationId, data]);

  return (
    <Button
      type="button"
      onClick={handleDownload}
      disabled={isDownloading || !data}
      {...buttonProps}
    >
      <Download />
      {isDownloading ? "Generating PDF..." : buttonText}
    </Button>
  );
}
