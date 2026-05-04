"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import AdvancedStandingForm from "@/features/advanced-standing/components/advanced-standing-form";
import { useGalaxySyncDeclarationMutation } from "@/features/application-form/hooks/galaxy-sync.hook";
import { APPLICATION_STAGE, USER_ROLE } from "@/shared/constants/types";
import {
  useApplicationChangeStageMutation,
  useApplicationGetQuery,
  useApplicationSendOfferLetterMutation,
  useApplicationUpdateMutation,
} from "@/shared/hooks/use-applications";
import { ArrowRight, Loader2, FileText, Sparkles, Clock, PenTool, Check, X, Eye } from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/shared/lib/utils";

type InReviewStageCardProps = {
  applicationId: string;
  isInteractive: boolean;
  isAllStagesSynced: boolean;
  onSyncBlocked: () => void;
  studentEmail?: string | null;
  studentName: string;
  withUnresolvedWarning?: (action: () => void) => void;
  currentRole?: string;
};

const getSafeSyncToastMessage = (data: unknown) => {
  if (typeof data === "string" && data.trim()) return data;
  if (data && typeof data === "object") {
    const maybeMessage = (data as { message?: unknown }).message;
    if (typeof maybeMessage === "string" && maybeMessage.trim()) {
      return maybeMessage;
    }
  }
  return "Declaration synced to Galaxy.";
};

export default function InReviewStageCard({
  applicationId,
  isInteractive,
  isAllStagesSynced,
  onSyncBlocked,
  studentEmail,
  studentName,
  withUnresolvedWarning,
  currentRole,
}: InReviewStageCardProps) {
  const { data: appResponse } = useApplicationGetQuery(applicationId);
  const isStaff = currentRole === USER_ROLE.STAFF;
  const isAgent = currentRole === USER_ROLE.AGENT;

  const enrollmentData = (appResponse?.data?.enrollment_data || {}) as Record<string, unknown>;
  const isAdvancedStandingRequested = enrollmentData?.advanced_standing_requested === true;
  const isAdvancedStandingSubmitted = enrollmentData?.advanced_standing_submitted === true;
  const advancedStandingStatus = enrollmentData?.advanced_standing_status as string || "Pending";

  const syncDeclaration = useGalaxySyncDeclarationMutation(applicationId);
  const sendOfferLetter = useApplicationSendOfferLetterMutation(applicationId);
  const changeStage = useApplicationChangeStageMutation(applicationId);
  const updateApplication = useApplicationUpdateMutation(applicationId);

  const isPending = syncDeclaration.isPending || sendOfferLetter.isPending || updateApplication.isPending;

  const handleSendOfferLetter = () => {
    if (!studentEmail) {
      toast.error("Student email is missing.");
      return;
    }

    sendOfferLetter.mutate(
      {
        student_email: studentEmail,
        student_name: studentName,
      },
      {
        onSuccess: (data) => {
          toast.success(data?.message || "Offer letter sent successfully!");
          changeStage.mutate(
            { to_stage: APPLICATION_STAGE.OFFER_LETTER },
            {
              onError: (error) => {
                toast.error(error.message || "Failed to change stage");
              },
            },
          );
        },
        onError: (error) => {
          toast.error(error.message || "Failed to send offer letter");
        },
      },
    );
  };

  const handleGenerateOffer = () => {
    if (!isAllStagesSynced) {
      onSyncBlocked();
      return;
    }

    syncDeclaration.mutate(undefined, {
      onSuccess: (data) => {
        toast.success(getSafeSyncToastMessage(data));
        handleSendOfferLetter();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to sync declaration to Galaxy");
      },
    });
  };

  const handleGenerateOfferClick = () => {
    if (!isAllStagesSynced) {
      handleGenerateOffer();
      return;
    }

    if (withUnresolvedWarning) {
      withUnresolvedWarning(handleGenerateOffer);
      return;
    }

    handleGenerateOffer();
  };

  return (
    <>
      {(isStaff || (isAgent && isAdvancedStandingRequested)) && (
        <div className="mb-6 overflow-hidden rounded-xl border-2 border-primary/20 bg-primary/5 shadow-sm">
          <div className="bg-primary/10 px-4 py-3 flex items-center justify-between">
            <div className="flex flex-col w-full">
              <div className="flex w-full justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h3 className="text-[14px] font-bold uppercase tracking-wider">Advanced Standing</h3>
                </div>
                {isAdvancedStandingRequested && (
                  <span className={cn(
                    "text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter",
                    advancedStandingStatus === "Approved" ? "bg-green-500/20 text-green-700" :
                    advancedStandingStatus === "Rejected" ? "bg-red-500/20 text-red-700" :
                    isAdvancedStandingSubmitted ? "bg-blue-500/20 text-blue-700" :
                    "bg-primary/20 text-primary-700"
                  )}>
                    {advancedStandingStatus === "Approved" ? "Approved" :
                     advancedStandingStatus === "Rejected" ? "Rejected" :
                     isAdvancedStandingSubmitted ? "Submitted" : "Requested"}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="p-4">
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              {isStaff
                ? "If the student requires Course Credit, request the form from them. They will be notified and can fill it directly in their portal."
                : "The staff has requested you to fill the Advanced Standing (Course Credit) form. Please provide the details of your previous studies."
              }
            </p>

            {isStaff ? (
              <div className="space-y-3">
                {!isAdvancedStandingSubmitted ? (
                  <Button
                    variant="outline"
                    disabled={isPending}
                    onClick={() => {
                      const currentEnrollmentData = (appResponse?.data?.enrollment_data || {}) as Record<string, unknown>;
                      updateApplication.mutate({
                        enrollment_data: {
                          ...currentEnrollmentData,
                          advanced_standing_requested: true,
                        }
                      }, {
                        onSuccess: () => {
                          toast.success("Requested Advanced Standing form from student.");
                        },
                        onError: (error) => {
                          toast.error(error.message || "Failed to request Advanced Standing");
                        }
                      });
                    }}
                    className="w-full flex items-center gap-2 text-[11px] font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-300 break-words"
                  >
                    <span className="flex-shrink-0 flex items-center justify-center">
                      {updateApplication.isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <FileText className="h-5 w-5" />
                      )}
                    </span>
                    <span className="flex-1 text-left whitespace-normal">
                      {isAdvancedStandingRequested ? "Re-request Advanced Standing" : "Request Advanced Standing"}
                    </span>
                  </Button>
                ) : advancedStandingStatus === "Approved" ? (
                  <div className="p-3 bg-green-50 border border-green-100 rounded-lg text-center space-y-2">
                    <p className="text-[10px] font-bold text-green-700 uppercase">Assessment Approved</p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full h-8 text-[10px] border-green-200 hover:bg-green-100 text-green-700">
                          <Eye className="h-3 w-3 mr-2" /> View Assessed Form
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-6xl max-h-[95vh] overflow-auto p-0 border-none">
                        <VisuallyHidden>
                          <DialogTitle>View Assessed Advanced Standing Form</DialogTitle>
                        </VisuallyHidden>
                        <AdvancedStandingForm applicationId={applicationId} isStaffMode={true} />
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : advancedStandingStatus === "Rejected" ? (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-center space-y-2">
                    <p className="text-[10px] font-bold text-red-700 uppercase">Assessment Rejected</p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full h-8 text-[10px] border-red-200 hover:bg-red-100 text-red-700">
                          <Eye className="h-3 w-3 mr-2" /> View Form
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-6xl max-h-[95vh] overflow-auto p-0 border-none">
                        <VisuallyHidden>
                          <DialogTitle>View Advanced Standing Form</DialogTitle>
                        </VisuallyHidden>
                        <AdvancedStandingForm applicationId={applicationId} isStaffMode={true} />
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full flex items-center gap-2 text-[10px] font-bold bg-primary text-primary-foreground shadow-md hover:shadow-lg transition-all duration-300">
                        <PenTool className="h-3.5 w-3.5" />
                        Assess the Advanced Standing Form
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl max-h-[95vh] overflow-auto p-0 border-none">
                      <VisuallyHidden>
                        <DialogTitle>Assess Advanced Standing Form</DialogTitle>
                      </VisuallyHidden>
                      <AdvancedStandingForm applicationId={applicationId} isStaffMode={true} />
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {advancedStandingStatus === "Rejected" ? (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-center">
                    <p className="text-[10px] font-bold text-red-700 uppercase">Assessment Rejected</p>
                    <p className="text-[10px] text-red-600 mt-1">No course credit points have been granted.</p>
                  </div>
                ) : advancedStandingStatus === "Approved" ? (
                  <div className="p-3 bg-green-50 border border-green-100 rounded-lg text-center space-y-2">
                    <p className="text-[10px] font-bold text-green-700 uppercase">Assessment Approved</p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full h-8 text-[10px] border-green-200 hover:bg-green-100 text-green-700">
                          <Eye className="h-3 w-3 mr-2" /> View Assessed Form
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-5xl h-[90vh] p-6">
                        <VisuallyHidden>
                          <DialogTitle>View Assessed Advanced Standing Form</DialogTitle>
                        </VisuallyHidden>
                        <AdvancedStandingForm applicationId={applicationId} />
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : isAdvancedStandingSubmitted ? (
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-center">
                    <Check className="h-5 w-5 mx-auto text-blue-600 mb-1" />
                    <p className="text-[10px] font-bold text-blue-700 uppercase">Form Submitted</p>
                    <p className="text-[10px] text-blue-600 mt-1">Your application is being reviewed by Churchill staff.</p>
                  </div>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className={cn(
                        "w-full flex items-center gap-2 text-[10px] font-bold shadow-md transition-all duration-300 px-4 py-2",
                        "bg-primary text-primary-foreground"
                      )}>
                        <span className="flex-shrink-0 flex items-center justify-center">
                          <FileText className="h-4 w-4" />
                        </span>
                        <span className="flex-1 text-left whitespace-normal truncate">
                          Fill Advanced Standing Form
                        </span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl max-h-[95vh] overflow-auto p-0 border-none">
                      <VisuallyHidden>
                        <DialogTitle>Advanced Standing Form</DialogTitle>
                      </VisuallyHidden>
                      <div aria-labelledby="advanced-standing-form-title">
                        <AdvancedStandingForm applicationId={applicationId} />
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {isStaff && (
        <>
          <h3 className="text-base font-semibold">Confirm before generating Offer Letter</h3>
          <p className="text-sm text-muted-foreground mt-2 mb-4">
            Please review all the requirements and if it satisfies please process
            further with generate offer letter or else please reject application
            with reason.
          </p>

          <Button
            onClick={handleGenerateOfferClick}
            disabled={!isInteractive || isPending}
            className="w-full py-6 text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isPending && <Loader2 className="h-5 w-5 mr-3 animate-spin" />}
            Generate Offer Letter
            {!isPending && <ArrowRight className="ml-2 h-5 w-5" />}
          </Button>
        </>
      )}

      {!isStaff && !isAdvancedStandingRequested && (
        <div className="py-8 text-center bg-muted/20 rounded-lg border-dashed border-2">
          <Clock className="h-8 w-8 mx-auto text-muted-foreground opacity-50 mb-2" />
          <p className="text-sm font-medium text-muted-foreground">Application is under review by Churchill staff.</p>
          <p className="text-xs text-muted-foreground mt-1 px-4">We will notify you if any additional documents are required.</p>
        </div>
      )}
    </>
  );
}
