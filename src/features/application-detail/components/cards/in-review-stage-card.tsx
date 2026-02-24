"use client";

import { Button } from "@/components/ui/button";
import { useGalaxySyncDeclarationMutation } from "@/features/application-form/hooks/galaxy-sync.hook";
import { APPLICATION_STAGE } from "@/shared/constants/types";
import {
  useApplicationChangeStageMutation,
  useApplicationSendOfferLetterMutation,
} from "@/shared/hooks/use-applications";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

type InReviewStageCardProps = {
  applicationId: string;
  isInteractive: boolean;
  isAllStagesSynced: boolean;
  onSyncBlocked: () => void;
  studentEmail?: string | null;
  studentName: string;
  withUnresolvedWarning?: (action: () => void) => void;
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
}: InReviewStageCardProps) {
  const syncDeclaration = useGalaxySyncDeclarationMutation(applicationId);
  const sendOfferLetter = useApplicationSendOfferLetterMutation(applicationId);
  const changeStage = useApplicationChangeStageMutation(applicationId);

  const isPending = syncDeclaration.isPending || sendOfferLetter.isPending;

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
      <h3 className="text-base">Confirm before generating Offer Letter</h3>
      <p className="text-sm text-muted-foreground mt-2 mb-4">
        Please review all the requirements and if it satisfies please process
        further with generate offer letter or else please reject application
        with reason.
      </p>

      <Button
        onClick={handleGenerateOfferClick}
        disabled={!isInteractive || isPending}
        className="w-full"
      >
        {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Generate Offer Letter
        {!isPending && <ArrowRight />}
      </Button>
    </>
  );
}
