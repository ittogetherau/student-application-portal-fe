"use client";
import { Button, buttonVariants } from "@/components/ui/button";
import type { StaffAssessmentResponse } from "@/service/gs-assessment.service";
import type { VariantProps } from "class-variance-authority";
import { Download } from "lucide-react";
import { useCallback, useState, type ComponentProps } from "react";
import { toast } from "react-hot-toast";

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
  const raw = getString(answer).trim();
  if (!raw) return "";
  const lower = raw.toLowerCase();
  if (lower === "yes") return "Yes";
  if (lower === "no") return "No";
  return raw;
}

function formatBoolean(value: unknown): string {
  return value === true ? "Yes" : "No";
}

export function GSAssessmentPdfDownloadButton({
  data,
  applicationId,
  buttonText = "Assessment PDF",
  ...buttonProps
}: {
  data: StaffAssessmentResponse | null | undefined;
  applicationId?: string;
  buttonText?: string;
} & Omit<ButtonLikeProps, "type" | "onClick" | "disabled" | "children">) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!data) {
      toast.error("No assessment data to export");
      return;
    }

    try {
      setIsDownloading(true);

      const { Document, Page, Text, View, StyleSheet, pdf } = await import(
        "@react-pdf/renderer"
      );

      const styles = StyleSheet.create({
        page: {
          paddingTop: 32,
          paddingBottom: 28,
          paddingHorizontal: 32,
          fontSize: 10,
          color: "#0f172a",
          lineHeight: 1.35,
          fontFamily: "Helvetica",
        },
        header: {
          fontSize: 9,
          color: "#475569",
          textAlign: "right",
          marginBottom: 10,
        },
        title: {
          fontSize: 16,
          textAlign: "center",
          fontWeight: "bold",
          marginBottom: 6,
          textTransform: "uppercase",
        },
        subtitle: {
          fontSize: 10,
          textAlign: "center",
          marginBottom: 12,
        },
        sectionTitle: {
          fontSize: 11,
          fontWeight: "bold",
          marginTop: 8,
          marginBottom: 6,
          textTransform: "uppercase",
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
          borderBottomColor: "#cbd5f5",
          paddingBottom: 2,
        },
        questionBlock: {
          marginBottom: 8,
        },
        questionLabel: {
          fontWeight: "bold",
          marginBottom: 2,
        },
        answerBox: {
          borderWidth: 1,
          borderColor: "#cbd5f5",
          minHeight: 24,
          padding: 6,
          marginBottom: 4,
        },
        footerNote: {
          fontSize: 9,
          color: "#475569",
          marginTop: 8,
        },
      });

      const applicant = (data.applicant_details ?? {}) as Record<string, unknown>;
      const stage1 = (data.stage1_questions ?? []) as Array<
        Record<string, unknown>
      >;
      const stage2 = (data.stage2_questions ?? []) as Array<
        Record<string, unknown>
      >;

      const renderHeader = (pageNumber: number) => (
        <Text style={styles.header}>
          {`Page | ${pageNumber} Churchill Institute of Higher Education Staff GS Assessment`}
        </Text>
      );

      const FieldRow = ({
        label,
        value,
      }: {
        label: string;
        value: string;
      }) => (
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>{label}</Text>
          <Text style={styles.fieldValue}>{value || " "}</Text>
        </View>
      );

      const QuestionBlock = ({
        label,
        answer,
        evidence,
        approval,
      }: {
        label: string;
        answer?: string;
        evidence?: string;
        approval?: string;
      }) => (
        <View style={styles.questionBlock}>
          <Text style={styles.questionLabel}>{label}</Text>
          <View style={styles.answerBox}>
            <Text>{answer || "-"}</Text>
          </View>
          {evidence ? <Text>{`Evidence verified: ${evidence}`}</Text> : null}
          {approval ? <Text>{`Approval status: ${approval}`}</Text> : null}
        </View>
      );

      const doc = (
        <Document>
          <Page size="A4" style={styles.page}>
            {renderHeader(1)}
            <Text style={styles.title}>STAFF GS ASSESSMENT</Text>
            <Text style={styles.subtitle}>Internal assessment summary</Text>

            <Text style={styles.sectionTitle}>Applicant details</Text>
            <View style={styles.sectionDivider} />
            <FieldRow
              label="Given Name(s)"
              value={getString(applicant.given_name)}
            />
            <FieldRow
              label="Family Name"
              value={getString(applicant.family_name)}
            />
            <FieldRow label="DOB" value={getString(applicant.dob)} />
            <FieldRow
              label="Student ID / Ref"
              value={getString(applicant.ref_no)}
            />
            <FieldRow
              label="Passport No"
              value={getString(applicant.passport_no)}
            />
            <FieldRow label="Email" value={getString(applicant.email)} />

            <Text style={styles.sectionTitle}>Stage 1 - Application</Text>
            <View style={styles.sectionDivider} />
            {stage1.length ? (
              stage1.map((q, index) => (
                <QuestionBlock
                  key={`stage1-${index}`}
                  label={`${index + 1}. ${getString(q.question) || "Question"}`}
                  answer={formatAnswer(q.answer)}
                  evidence={formatBoolean(q.evidence_verified)}
                />
              ))
            ) : (
              <Text style={styles.footerNote}>No stage 1 responses.</Text>
            )}

            <Text style={styles.sectionTitle}>Stage 2 - Document review</Text>
            <View style={styles.sectionDivider} />
            {stage2.length ? (
              stage2.map((q, index) => (
                <QuestionBlock
                  key={`stage2-${index}`}
                  label={`${index + 1}. ${getString(q.question) || "Question"}`}
                  answer={formatAnswer(q.answer)}
                  evidence={formatBoolean(q.evidence_verified)}
                  approval={getString(q.approval_status)}
                />
              ))
            ) : (
              <Text style={styles.footerNote}>No stage 2 responses.</Text>
            )}

            <Text style={styles.sectionTitle}>Decision summary</Text>
            <View style={styles.sectionDivider} />
            {data.recommendation ? (
              <Text>{`Recommendation: ${getString(data.recommendation)}`}</Text>
            ) : null}
            {data.final_decision ? (
              <Text>{`Final decision: ${getString(data.final_decision)}`}</Text>
            ) : null}
            {data.risk_level ? (
              <Text>{`Risk level: ${getString(data.risk_level)}`}</Text>
            ) : null}
            {data.conditions ? (
              <Text>{`Conditions: ${getString(data.conditions)}`}</Text>
            ) : null}
            {data.additional_comments ? (
              <Text>{`Additional comments: ${getString(
                data.additional_comments,
              )}`}</Text>
            ) : null}
          </Page>
        </Document>
      );

      const blob = await pdf(doc).toBlob();

      const url = URL.createObjectURL(blob);
      const anchor = window.document.createElement("a");
      anchor.href = url;
      anchor.download = `gs-assessment-${applicationId ?? "application"}.pdf`;
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
