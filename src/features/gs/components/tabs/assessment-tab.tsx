"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GSAssessmentStaffForm } from "@/features/gs/components/forms/gs-assessment-staff-form";
import { GSAssessmentPdfDownloadButton } from "@/features/gs/components/forms/gs-assessment-pdf-download-button";
import { useGSStaffAssessmentQuery } from "@/hooks/useGSAssessment.hook";
import { APPLICATION_STAGE, USER_ROLE } from "@/shared/constants/types";
import { useApplicationChangeStageMutation } from "@/shared/hooks/use-applications";
import { CheckCircle2, Clock } from "lucide-react";
import { useSession } from "next-auth/react";

// type ViewState = "cards" | { mode: "view" | "edit" };

type GSAssessmentTabProps = {
  trackingCode?: string | null;
  applicationId?: string;
  isStaff?: boolean;
  isStageCompleted?: boolean;
  onStageComplete?: () => Promise<void>;
};

export default function GSAssessmentTab({
  // trackingCode,
  applicationId,
  isStageCompleted = false,
  onStageComplete,
}: GSAssessmentTabProps) {
  const { data: session } = useSession();
  const ROLE = session?.user.role;

  // const [viewState, setViewState] = useState<ViewState>("cards");

  // const { data: staffAssessment, isLoading } = useGSStaffAssessmentQuery(
  //   applicationId ?? null,
  // );
  const changeStage = useApplicationChangeStageMutation(applicationId ?? "");

  // const assessmentStatus = staffAssessment?.data?.status;
  // const isSubmitted =
  //   assessmentStatus === "submitted" || assessmentStatus === "completed";

  // const isCompleted =
  //   staffAssessment?.data?.completed_at !== null &&
  //   staffAssessment?.data?.completed_at !== undefined;

  // const handleBack = () => setViewState("cards");

  const handleFormSuccess = async () => {
    await onStageComplete?.();
    // setViewState("cards");
    await changeStage.mutateAsync({ to_stage: APPLICATION_STAGE.COE_ISSUED });
  };

  const { data: staffAssessmentResponse } = useGSStaffAssessmentQuery(
    ROLE === USER_ROLE.AGENT ? (applicationId ?? null) : null,
  );
  const staffAssessment = staffAssessmentResponse?.data ?? null;

  const isStaffAssessmentSubmitted =
    staffAssessment?.status === "submitted" || staffAssessment?.status === "completed";
  const shouldShowSubmittedState = isStageCompleted || isStaffAssessmentSubmitted;

  // if (isLoading) {
  //   return (
  //     <Card>
  //       <CardContent className="flex items-center justify-center py-12">
  //         <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
  //       </CardContent>
  //     </Card>
  //   );
  // }

  if (ROLE === USER_ROLE.STAFF)
    return (
      <div className="px-6 pt-8">
        <GSAssessmentStaffForm
          applicationId={applicationId}
          onSuccess={handleFormSuccess}
        />
      </div>
    );

  if (shouldShowSubmittedState) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">Successfully submitted</CardTitle>
              <Badge
                variant="outline"
                className="border-emerald-500 text-emerald-600 text-[11px]"
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                Submitted
              </Badge>
            </div>

            <GSAssessmentPdfDownloadButton
              data={staffAssessment}
              applicationId={applicationId}
              buttonText="Download assessment PDF"
              size="sm"
              variant="outline"
              className="gap-2"
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">
              The GS assessment has been submitted by staff.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">
                  Awaiting Staff GS Submission
                </CardTitle>
                <Badge variant="secondary" className="text-[11px]">
                  Pending
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div className="space-y-1">
                  <p className="text-sm font-medium">
                    A Churchill representative is completing the final assessment.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    We&apos;ll notify you by email once the assessment is
                    submitted or if any updates are required.
                  </p>
                </div>
              </div>
            </div>
        </CardContent>
      </Card>
    </>
  );

  // if (viewState === "cards") {
  //   return (
  //     <div className="space-y-4">
  //       <div className="flex items-center gap-2">
  //         <Button
  //           variant="ghost"
  //           size="sm"
  //           onClick={handleBack}
  //           className="gap-2"
  //         >
  //           <ArrowLeft className="h-4 w-4" />
  //           Back to Assessment
  //         </Button>
  //         <span className="text-muted-foreground">/</span>
  //         <span className="text-sm font-medium">Staff Assessment</span>
  //       </div>

  //     </div>
  //   );
  // }

  // return (
  //   <Card>
  //     <CardHeader className="pb-3">
  //       <CardTitle className="text-base">Final Staff Assessment</CardTitle>
  //     </CardHeader>
  //     <CardContent className="space-y-4">
  //       <div className="space-y-2 text-sm">
  //         <p className="font-medium">Checklist</p>
  //         <ul className="space-y-2 text-xs text-muted-foreground">
  //           <li className="flex items-center gap-2">
  //             <CheckCircle2 className="h-4 w-4 text-emerald-600" />
  //             All documents verified
  //           </li>
  //           <li className="flex items-center gap-2">
  //             <CheckCircle2 className="h-4 w-4 text-emerald-600" />
  //             Declarations reviewed
  //           </li>
  //           <li className="flex items-center gap-2">
  //             <CheckCircle2 className="h-4 w-4 text-emerald-600" />
  //             Interview notes captured
  //           </li>
  //         </ul>
  //       </div>

  //       <div className="flex flex-wrap items-center gap-2">
  //         {isStaff && (
  //           <Button
  //             className="gap-2"
  //             onClick={() => setViewState({ mode: "view" })}
  //           >
  //             <FileText className="h-4 w-4" />
  //             Open Staff Assessment Form
  //           </Button>
  //         )}

  //         {/* {trackingCode && (
  //           <Button asChild variant="outline" className="gap-2">
  //             <Link href={`/track/gs-form/${trackingCode}?id=${applicationId}`}>
  //               <FileText className="h-4 w-4" />
  //               View Declaration
  //             </Link>
  //           </Button>
  //         )} */}

  //         {isCompleted && !isStageCompleted && !isSubmitted && (
  //           <Button variant="outline" className="gap-2">
  //             <CheckCircle2 className="h-4 w-4" />
  //             Submit and continue
  //           </Button>
  //         )}
  //       </div>

  //       {isStageCompleted && (
  //         <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">
  //           <CheckCircle2 className="h-5 w-5" />
  //           <span className="text-sm font-medium">
  //             Assessment stage completed. GS Assessment finished.
  //           </span>
  //         </div>
  //       )}
  //     </CardContent>
  //   </Card>
  // );
}
