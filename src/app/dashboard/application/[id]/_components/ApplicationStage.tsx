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
import { APPLICATION_STAGE } from "@/constants/types";
import {
  useApplicationChangeStageMutation,
  useApplicationEnrollGalaxyCourseMutation,
  useApplicationGetQuery,
  useApplicationSendOfferLetterMutation,
} from "@/hooks/useApplication.hook";
import { Check, FileCheck, Loader2, Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-hot-toast";

interface ApplicationStageProps {
  id: string;
}

const ApplicationStage = ({ id }: ApplicationStageProps) => {
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
        <Card>
          <CardHeader>
            <CardTitle>Ready to Start Review?</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              You can start reviewing this application. Click the button below
              to begin.
            </CardDescription>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => handleStartReview(APPLICATION_STAGE.STAFF_REVIEW)}
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
      ) : application.current_stage === APPLICATION_STAGE.STAFF_REVIEW ? (
        <Card>
          <CardHeader className="p-4">
            <CardTitle>Confirm Applicant Details</CardTitle>
          </CardHeader>

          <CardContent className="p-4 pt-0">
            <CardDescription>
              You have reviewed the application and confirmed all applicant
              details are accurate and complete. Confirm to move this
              application to the offer letter stage.
            </CardDescription>
          </CardContent>

          <CardFooter className="p-4 pt-0">
            <Button
              onClick={handleEnrollGalaxyCourse}
              disabled={changeStage.isPending}
              variant="outline"
              className="w-full"
            >
              {enrollGalaxyCourse.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Enroll Student
            </Button>
          </CardFooter>
        </Card>
      ) : application.current_stage === APPLICATION_STAGE.OFFER_GENERATED ? (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="text-lg">
              Ready to Send Offer Letter?
            </CardTitle>
            <CardDescription>
              All documents have been reviewed and synced to Galaxy. You can now
              send the offer letter to the agent and student.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button
                className="w-full sm:w-auto"
                onClick={handleSendOfferLetter}
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
      ) : null}
    </div>
  );
};

export default ApplicationStage;
