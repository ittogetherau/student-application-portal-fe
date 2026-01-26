"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, FileText, Loader2, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGSStaffAssessmentQuery } from "@/hooks/useGSAssessment.hook";
import { GSAssessmentStaffForm } from "../../forms/gs-assessment-staff-form";

type ViewState = "cards" | { mode: "view" | "edit" };

type GSAssessmentTabProps = {
  trackingCode?: string | null;
  applicationId?: string;
  isStaff?: boolean;
  isStageCompleted?: boolean;
  onStageComplete?: () => Promise<void>;
};

export default function GSAssessmentTab({
  trackingCode,
  applicationId,
  isStaff = false,
  isStageCompleted = false,
  onStageComplete,
}: GSAssessmentTabProps) {
  const [viewState, setViewState] = useState<ViewState>("cards");

  const { data: staffAssessment, isLoading } = useGSStaffAssessmentQuery(
    applicationId ?? null
  );

  const assessmentStatus = staffAssessment?.data?.status;
  const isSubmitted = assessmentStatus === "submitted" || assessmentStatus === "completed";

  const handleBack = () => setViewState("cards");

  const handleFormSuccess = async () => {
    await onStageComplete?.();
    setViewState("cards");
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (viewState !== "cards") {
    const isReadOnly = viewState.mode === "view";

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Assessment
          </Button>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium">
            {isReadOnly ? "View Staff Assessment" : "Edit Staff Assessment"}
          </span>
        </div>

        <GSAssessmentStaffForm
          applicationId={applicationId}
          readOnly={isReadOnly}
          onSuccess={isReadOnly ? handleBack : handleFormSuccess}
        />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Final Staff Assessment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <p className="font-medium">Checklist</p>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              All documents verified
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Declarations reviewed
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Interview notes captured
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isStaff && (
            <Button
              className="gap-2"
              onClick={() => setViewState({ mode: "view" })}
            >
              <FileText className="h-4 w-4" />
              Open Staff Assessment Form
            </Button>
          )}

          {isStaff && !isSubmitted && (
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setViewState({ mode: "edit" })}
            >
              <Pencil className="h-4 w-4" />
              Edit Form
            </Button>
          )}

          {trackingCode && (
            <Button asChild variant="outline" className="gap-2">
              <Link href={`/track/gs-form/${trackingCode}`}>
                <FileText className="h-4 w-4" />
                View Declaration
              </Link>
            </Button>
          )}
        </div>

        {isStageCompleted && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">
              Assessment stage completed. GS Assessment finished.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
