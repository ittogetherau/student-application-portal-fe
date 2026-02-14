"use client";

import { Button } from "@/components/ui/button";
import { APPLICATION_STAGE } from "@/shared/constants/types";
import { useApplicationChangeStageMutation } from "@/shared/hooks/use-applications";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

type SubmittedStageCardProps = {
  applicationId: string;
  isInteractive: boolean;
};

export default function SubmittedStageCard({
  applicationId,
  isInteractive,
}: SubmittedStageCardProps) {
  const changeStage = useApplicationChangeStageMutation(applicationId);

  const handleStartReview = () => {
    changeStage.mutate(
      { to_stage: APPLICATION_STAGE.IN_REVIEW },
      {
        onSuccess: () => {
          toast.success("Application is now under review.");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to change stage");
        },
      },
    );
  };

  return (
    <>
      <h3 className="text-base">Ready to Start Review?</h3>
      <p className="text-sm text-muted-foreground mt-2 mb-4">
        Please check all the student details documents uploaded and make sure it
        can proceed before completing review or else please reject application
        with reason.
      </p>
      <Button
        onClick={handleStartReview}
        disabled={!isInteractive || changeStage.isPending}
        className="w-full"
      >
        {changeStage.isPending ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : null}
        Start Application Review
        {!changeStage.isPending && <ArrowRight />}
      </Button>
    </>
  );
}
