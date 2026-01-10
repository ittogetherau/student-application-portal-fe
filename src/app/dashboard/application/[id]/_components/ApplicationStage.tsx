"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APPLICATION_STAGE, USER_ROLE } from "@/constants/types";
import {
  useApplicationChangeStageMutation,
  useApplicationEnrollGalaxyCourseMutation,
  useApplicationGetQuery,
  useApplicationSendOfferLetterMutation,
} from "@/hooks/useApplication.hook";
import { FileCheck, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import ApplicationSignDisplay from "./ApplicationSignDisplay";

interface ApplicationStageProps {
  id: string;
  current_role?: string;
}

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

  return (
    <div className="space-y-4">
      {application.current_stage === "submitted" ? (
        <>
          {current_role === USER_ROLE.STAFF && (
            <Card className="bg-chart-4/10 border border-chart-4">
              <CardHeader>
                <CardTitle>Ready to Start Review?</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  You can start reviewing this application. Click the button
                  below to begin.
                </CardDescription>
              </CardContent>
              <CardFooter>
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
                </Button>
              </CardFooter>
            </Card>
          )}
        </>
      ) : application.current_stage === APPLICATION_STAGE.STAFF_REVIEW ? (
        <>
          {current_role === USER_ROLE.STAFF && (
            <Card className="bg-chart-1/10 border border-chart-1">
              <CardHeader>
                <CardTitle>Confirm Applicant Details</CardTitle>
              </CardHeader>

              <CardContent>
                <CardDescription className="text-card-foreground">
                  You have reviewed the application and confirmed all applicant
                  details are accurate and complete. Confirm to move this
                  application to the offer letter stage.
                </CardDescription>
              </CardContent>

              <CardFooter>
                <Button
                  onClick={handleEnrollGalaxyCourse}
                  disabled={changeStage.isPending}
                  className="w-full bg-chart-1 hover:bg-chart-1/50 text-background"
                >
                  {enrollGalaxyCourse.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Sync To Galaxy
                </Button>
              </CardFooter>
            </Card>
          )}
        </>
      ) : application.current_stage === APPLICATION_STAGE.OFFER_GENERATED ? (
        <>
          {current_role === USER_ROLE.STAFF && (
            <Card className="bg-chart-2/10 border border-chart-2 ">
              <CardHeader>
                <CardTitle className="text-lg">
                  Ready to Send Offer Letter?
                </CardTitle>
                <CardDescription className="text-card-foreground">
                  All documents have been reviewed and synced to Galaxy. You can
                  now send the offer letter to the agent and student.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <Button
                    className="w-full bg-chart-2 hover:bg-chart-2/50 text-background"
                    onClick={handleSendOfferLetter}
                    variant={"secondary"}
                    disabled={sendOfferLetter.isPending}
                  >
                    {sendOfferLetter.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <FileCheck className="h-4 w-4 mr-2" />
                    )}
                    Send Offer Letter
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : application.current_stage === APPLICATION_STAGE.AWAITING_DOCUMENTS ? (
        <>
          {/* {current_role === USER_ROLE.AGENT && ()} */}
          <ApplicationSignDisplay
            applicationId={id}
            currentRole={current_role}
            studentEmail={application?.personal_details?.email}
          />
        </>
      ) : null}
    </div>
  );
};

export default ApplicationStage;
