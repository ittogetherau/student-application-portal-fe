"use client";

import { useCallback, useState, type ComponentProps } from "react";
import { Download } from "lucide-react";
import { toast } from "react-hot-toast";
import type { VariantProps } from "class-variance-authority";

import { Button, buttonVariants } from "@/components/ui/button";
import type { StaffAssessmentResponse } from "@/service/gs-assessment.service";

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
  const a = getString(answer).toLowerCase();
  if (a === "yes") return "Yes";
  if (a === "no") return "No";
  return a ? a : "-";
}

function formatBoolean(value: unknown): string {
  return value === true ? "Yes" : "No";
}

function formatStaffAssessmentText(data: StaffAssessmentResponse): string {
  const applicant = (data.applicant_details ?? {}) as Record<string, unknown>;
  const stage1 = (data.stage1_questions ?? []) as Array<
    Record<string, unknown>
  >;
  const stage2 = (data.stage2_questions ?? []) as Array<
    Record<string, unknown>
  >;

  const lines: string[] = [];

  lines.push("Staff GS Assessment");
  lines.push("");
  lines.push(`ID: ${getString(data.id)}`);
  if (data.status) lines.push(`Status: ${getString(data.status)}`);
  lines.push("");

  lines.push("Applicant Details");
  lines.push(`Given name: ${getString(applicant.given_name)}`);
  lines.push(`Family name: ${getString(applicant.family_name)}`);
  lines.push(`DOB: ${getString(applicant.dob)}`);
  lines.push(`Student ID / Ref no: ${getString(applicant.ref_no)}`);
  lines.push(`Passport no: ${getString(applicant.passport_no)}`);
  lines.push(`Email: ${getString(applicant.email)}`);
  lines.push("");

  lines.push("Stage 1 Questions");
  stage1.forEach((q, index) => {
    const answer = formatAnswer(q.answer);
    const question = getString(q.question);
    const evidence = formatBoolean(q.evidence_verified);
    lines.push(`${index + 1}. Answer: ${answer}`);
    lines.push(`Question: ${question}`);
    lines.push(`Evidence verified: ${evidence}`);
  });
  if (stage1.length === 0) lines.push("- None");
  lines.push("");

  lines.push("Stage 2 Questions");
  stage2.forEach((q, index) => {
    const answer = formatAnswer(q.answer);
    const question = getString(q.question);
    const evidence = formatBoolean(q.evidence_verified);
    const approvalStatus = getString(q.approval_status);
    lines.push(`${index + 1}. Answer: ${answer}`);
    lines.push(`Question: ${question}`);
    lines.push(`Evidence verified: ${evidence}`);
    if (approvalStatus) lines.push(`Approval status: ${approvalStatus}`);
  });
  if (stage2.length === 0) lines.push("- None");
  lines.push("");

  if (data.recommendation)
    lines.push(`Recommendation: ${getString(data.recommendation)}`);
  if (data.final_decision)
    lines.push(`Final decision: ${getString(data.final_decision)}`);
  if (data.decision_rationale)
    lines.push(`Decision rationale: ${getString(data.decision_rationale)}`);
  if (data.risk_level) lines.push(`Risk level: ${getString(data.risk_level)}`);
  if (data.conditions) lines.push(`Conditions: ${getString(data.conditions)}`);
  if (data.additional_comments)
    lines.push(`Additional comments: ${getString(data.additional_comments)}`);

  return lines.join("\n");
}

export function GSAssessmentStaffPdfDownloadButton({
  data,
  applicationId,
  buttonText = "Download PDF",
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

      const { Document, Page, Text, pdf } = await import("@react-pdf/renderer");

      const plainText = formatStaffAssessmentText(data);
      const blob = await pdf(
        <Document>
          <Page size="A4">
            <Text>{plainText}</Text>
          </Page>
        </Document>,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const anchor = window.document.createElement("a");
      anchor.href = url;
      anchor.download = `staff-gs-assessment-${applicationId ?? "application"}.pdf`;
      window.document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch {
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
