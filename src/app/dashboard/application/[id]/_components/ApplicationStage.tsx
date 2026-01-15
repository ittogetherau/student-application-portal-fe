"use client";

import { Button } from "@/components/ui/button";
import { APPLICATION_STAGE, USER_ROLE } from "@/constants/types";
import {
  useApplicationChangeStageMutation,
  useApplicationEnrollGalaxyCourseMutation,
  useApplicationGalaxySyncMutation,
  useApplicationGetQuery,
  useApplicationSendOfferLetterMutation,
} from "@/hooks/useApplication.hook";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CircleQuestionMark,
  ClipboardCheck,
  ListTodo,
  Loader2,
  LucideIcon,
  ScanSearch,
  Signature,
  User,
  X,
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
  [APPLICATION_STAGE.IN_REVIEW]: ScanSearch,
  [APPLICATION_STAGE.OFFER_LETTER]: Signature,
  [APPLICATION_STAGE.GS_ASSESSMENT]: ListTodo,
  [APPLICATION_STAGE.COE_ISSUED]: CircleQuestionMark,
  [APPLICATION_STAGE.ACCEPTED]: Check,
  [APPLICATION_STAGE.REJECTED]: X,
};

const ApplicationStage = ({ id, current_role }: ApplicationStageProps) => {
  // Queries & Mutations
  const { data: response, isLoading } = useApplicationGetQuery(id);
  const changeStage = useApplicationChangeStageMutation(id);
  const sendOfferLetter = useApplicationSendOfferLetterMutation(id);
  const enrollGalaxyCourse = useApplicationEnrollGalaxyCourseMutation(id);
  const syncGalaxyApplication = useApplicationGalaxySyncMutation(id);

  const application = response?.data;
  const isStaff = current_role === USER_ROLE.STAFF;

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
    changeStage.mutateAsync({ to_stage: str });
  };

  const handleEnrollGalaxyCourse = () => {
    enrollGalaxyCourse.mutate(undefined, {
      onSuccess: (data) => {
        toast.success(
          data?.message || "Course enrollment in Galaxy completed."
        );
        handleSendOfferLetter();
        handleStageChange(APPLICATION_STAGE.OFFER_LETTER);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to enroll course in Galaxy");
      },
    });
  };

  const handleSyncGalaxyApplication = () => {
    syncGalaxyApplication.mutate(undefined, {
      onSuccess: (data) => {
        toast.success(data?.message || "Galaxy sync completed.");
        // handleStageChange(APPLICATION_STAGE.OFFER_LETTER);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to sync application in Galaxy");
      },
    });
  };

  const handleSendOfferLetter = () => {
    const studentEmail = application?.personal_details?.email;
    const studentName = `${application?.personal_details?.given_name} ${
      application?.personal_details?.middle_name || ""
    } ${application?.personal_details?.family_name}`;

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
          // handleStageChange(APPLICATION_STAGE.OFFER_LETTER);
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
  const currentStage = application.current_stage;
  const currentIndex = stages.indexOf(currentStage);

  const renderStageAction = (
    stage: APPLICATION_STAGE,
    isCurrent: boolean,
    cardBorderClass: string
  ) => {
    if (!isCurrent) return null;

    if (stage === APPLICATION_STAGE.SUBMITTED) {
      if (!isStaff) return null;
      return (
        <div className={cardBorderClass}>
          <h3 className="text-base">Ready to Start Review?</h3>
          <p className="text-sm text-muted-foreground mt-2 mb-4">
            You can start reviewing this application. Click the button below to
            begin.
          </p>
          <Button
            onClick={() => handleStartReview(APPLICATION_STAGE.IN_REVIEW)}
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
      );
    }

    if (stage === APPLICATION_STAGE.IN_REVIEW) {
      if (!isStaff) return null;
      const isGeneratingOffer =
        enrollGalaxyCourse.isPending || sendOfferLetter.isPending;
      return (
        <div className={cardBorderClass}>
          <h3 className="text-base">Confirm Applicant Details</h3>
          <p className="text-sm text-muted-foreground mt-2 mb-4">
            Review and confirm application details to generate and send the
            offer letter.{" "}
          </p>

          <Button
            onClick={handleEnrollGalaxyCourse}
            disabled={isGeneratingOffer}
            className="w-full"
          >
            {isGeneratingOffer && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Generate Offer Letter
            {!isGeneratingOffer && <ArrowRight />}
          </Button>
        </div>
      );
    }

    if (stage === APPLICATION_STAGE.OFFER_LETTER) {
      return (
        <ApplicationSignDisplay
          applicationId={id}
          currentRole={current_role}
          studentEmail={application?.personal_details?.email}
          cardBorderClass={cardBorderClass}
          handleStageChange={handleStageChange}
        />
      );
    }

    if (stage === APPLICATION_STAGE.GS_ASSESSMENT)
      return (
        <div className={cardBorderClass}>
          <h3 className="text-base font-semibold">GS Assessment Phase</h3>
          <p className="text-sm text-muted-foreground mt-2">
            The application is currently undergoing Genuine Student assessment.
          </p>
        </div>
      );

    return null;
  };

  return (
    <div>
      {stages.map((el, i) => {
        if (i < 1) return null;

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

            {renderStageAction(el, isCurrent, cardBorderClass)}
          </React.Fragment>
        );
      })}

      {/* <div onClick={() => handleStageChange(APPLICATION_STAGE.IN_REVIEW)}>
        reset
      </div> */}
    </div>
  );
};

export default ApplicationStage;
