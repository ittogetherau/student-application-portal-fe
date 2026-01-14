"use client";

import { Button } from "@/components/ui/button";
import { APPLICATION_STAGE, USER_ROLE } from "@/constants/types";
import {
  useApplicationChangeStageMutation,
  useApplicationEnrollGalaxyCourseMutation,
  useApplicationGetQuery,
  useApplicationSendOfferLetterMutation,
} from "@/hooks/useApplication.hook";
import {
  ArrowRight,
  BadgeCheck,
  ClipboardCheck,
  FileText,
  GraduationCap,
  ListTodo,
  Loader2,
  LucideIcon,
  MinusCircle,
  ScanSearch,
  Signature,
  User,
  XCircle,
} from "lucide-react";
import React from "react";
import { toast } from "react-hot-toast";
import ApplicationSignDisplay from "./ApplicationSignDisplay";

interface ApplicationStageProps {
  currentStatus: APPLICATION_STAGE;
  id: string;
  current_role?: string;
}

const IconMap: Record<APPLICATION_STAGE, LucideIcon> = {
  [APPLICATION_STAGE.DRAFT]: User,
  [APPLICATION_STAGE.SUBMITTED]: ClipboardCheck,
  [APPLICATION_STAGE.STAFF_REVIEW]: ScanSearch,
  [APPLICATION_STAGE.AWAITING_DOCUMENTS]: FileText,
  [APPLICATION_STAGE.OFFER_GENERATED]: Signature,
  [APPLICATION_STAGE.OFFER_ACCEPTED]: BadgeCheck,
  [APPLICATION_STAGE.GS_ASSESSMENT]: ListTodo,
  [APPLICATION_STAGE.ENROLLED]: GraduationCap,
  [APPLICATION_STAGE.REJECTED]: XCircle,
  [APPLICATION_STAGE.WITHDRAWN]: MinusCircle,
};

const ApplicationStage = ({ id, current_role }: ApplicationStageProps) => {
  // Queries & Mutations
  const { data: response, isLoading } = useApplicationGetQuery(id);
  const changeStage = useApplicationChangeStageMutation(id);
  const sendOfferLetter = useApplicationSendOfferLetterMutation(id);
  const enrollGalaxyCourse = useApplicationEnrollGalaxyCourseMutation(id);
  const stageChange = useApplicationChangeStageMutation(id);

  const application = response?.data;

  // Handlers
  const handleStartReview = (toStage: APPLICATION_STAGE) => {
    changeStage.mutate(
      { to_stage: toStage },
      {
        onSuccess: () => {
          toast.success(`Moved to ${toStage.replace("_", " ")}`);
        },
        onError: (error) => {
          toast.error(error.message || "Failed to change stage");
        },
      }
    );
  };

  const handleStageChange = (str: APPLICATION_STAGE) => {
    stageChange.mutateAsync({ to_stage: str });
  };

  const handleEnrollGalaxyCourse = () => {
    enrollGalaxyCourse.mutate(undefined, {
      onSuccess: (data) => {
        toast.success(
          data?.message || "Course enrollment in Galaxy completed."
        );
        handleStageChange(APPLICATION_STAGE.OFFER_GENERATED);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to enroll course in Galaxy");
      },
    });
  };

  const handleSendOfferLetter = () => {
    const studentEmail = application?.personal_details?.email;

    if (!studentEmail) {
      toast.error("Student email is missing.");
      return;
    }

    sendOfferLetter.mutate(
      { student_email: studentEmail },
      {
        onSuccess: (data) => {
          toast.success(data?.message || "Offer letter sent successfully!");
          handleStageChange(APPLICATION_STAGE.AWAITING_DOCUMENTS);
        },
        onError: (error) => {
          toast.error(error.message || "Failed to send offer letter");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!application) return null;

  const stages = Object.values(APPLICATION_STAGE);

  const currentIndex = stages.indexOf(application.current_stage);

  return (
    <div className="">
      <div className="">
        {stages.map((el, i) => {
          if (i < 1) return;

          const Icon = IconMap[el];
          const isCurrent = i === currentIndex;
          // const isPrevious = i === currentIndex - 1;
          // const isNext = i === currentIndex + 1;
          // const isCompleted = i < currentIndex;

          const cardBorderClass = `
          p-3 border-x-2 last:border-b-2 capitalize flex flex-col  gap-0
          ${isCurrent ? "bg-primary/5 border-primary" : ""}
          border-b-2
        `;

          return (
            <React.Fragment key={el}>
              <div
                className={`p-2 first:rounded-t-lg border-x-2 border-t-2 last:rounded-b-lg capitalize flex items-center justify-between gap-2.5 ${
                  isCurrent ? "bg-primary/5 border-primary" : "last:border-b"
                }`}
                key={el}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-primary/10 outline-2 outline-primary/30 text-primary rounded-sm dark:text-white">
                    <Icon size={17} className="" />
                  </div>
                  {el.replace("_", " ")}
                </div>

                {i < currentIndex && (
                  <BadgeCheck fill="#2a52be" className="text-white" />
                )}
              </div>

              {isCurrent && application.current_stage === "submitted" ? (
                <>
                  {current_role === USER_ROLE.STAFF && (
                    <>
                      <div className={cardBorderClass}>
                        <h3 className="text-base">Ready to Start Review?</h3>
                        <p className="text-sm text-muted-foreground mt-2 mb-4">
                          You can start reviewing this application. Click the
                          button below to begin.
                        </p>
                        <Button
                          onClick={() =>
                            handleStartReview(APPLICATION_STAGE.STAFF_REVIEW)
                          }
                          disabled={changeStage.isPending}
                          className="w-full"
                        >
                          {changeStage.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : null}
                          Start Review
                          {!changeStage.isPending && <ArrowRight />}
                        </Button>
                      </div>
                    </>
                  )}
                </>
              ) : isCurrent &&
                application.current_stage === APPLICATION_STAGE.STAFF_REVIEW ? (
                <>
                  {current_role === USER_ROLE.STAFF && (
                    <div className={cardBorderClass}>
                      <h3 className="text-base">Confirm Applicant Details</h3>
                      <p className="text-sm text-muted-foreground mt-2 mb-4">
                        You have reviewed the application and confirmed all
                        applicant details are accurate and complete. Confirm to
                        move this application to the offer letter stage.
                      </p>

                      <Button
                        onClick={handleEnrollGalaxyCourse}
                        disabled={changeStage.isPending}
                        className="w-full"
                      >
                        {enrollGalaxyCourse.isPending && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        Sync To Galaxy
                        {!enrollGalaxyCourse.isPending && <ArrowRight />}
                      </Button>
                    </div>
                  )}
                </>
              ) : isCurrent &&
                application.current_stage ===
                  APPLICATION_STAGE.OFFER_GENERATED ? (
                <>
                  {current_role === USER_ROLE.STAFF && (
                    <div className={cardBorderClass}>
                      <h3 className="text-base">Ready to Send Offer Letter?</h3>
                      <p className="text-sm text-muted-foreground mt-2 mb-4">
                        All documents have been reviewed and synced to Galaxy.
                        You can now send the offer letter to the agent and
                        student.
                      </p>
                      <Button
                        className="w-full"
                        onClick={handleSendOfferLetter}
                        disabled={sendOfferLetter.isPending}
                      >
                        {sendOfferLetter.isPending && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        Send Offer Letter
                        {!sendOfferLetter.isPending && <ArrowRight />}
                      </Button>
                    </div>
                  )}
                </>
              ) : isCurrent &&
                application.current_stage ===
                  APPLICATION_STAGE.AWAITING_DOCUMENTS ? (
                <>
                  <ApplicationSignDisplay
                    applicationId={id}
                    currentRole={current_role}
                    studentEmail={application?.personal_details?.email}
                    cardBorderClass={cardBorderClass}
                  />
                </>
              ) : null}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ApplicationStage;
