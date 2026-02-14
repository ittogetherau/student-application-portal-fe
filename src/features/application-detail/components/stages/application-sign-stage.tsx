"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { APPLICATION_STAGE, USER_ROLE } from "@/shared/constants/types";
import {
  useApplicationRequestSignaturesMutation,
  useApplicationSendOfferLetterMutation,
} from "@/shared/hooks/use-applications";
import { formatUtcToFriendlyLocal } from "@/shared/lib/format-utc-to-local";
import {
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Loader2,
  Mail,
} from "lucide-react";
import { memo, useEffect } from "react";
import ResendOfferLetterAction from "./resend-offer-letter-action";

interface SignerRowProps {
  name: string;
  email: string;
  url: string;
  signedAt?: string | null;
  isInteractive?: boolean;
}

const SignerRow = memo(
  ({ name, email, url, signedAt, isInteractive = true }: SignerRowProps) => (
    <a
      href={isInteractive ? url : "#"}
      target={isInteractive ? "_blank" : undefined}
      rel={isInteractive ? "noreferrer" : undefined}
      aria-disabled={!isInteractive}
      tabIndex={isInteractive ? 0 : -1}
      onClick={(event) => {
        if (!isInteractive) {
          event.preventDefault();
        }
      }}
      className={`flex items-center justify-between p-2 rounded-md transition-colors ${
        isInteractive ? "hover:bg-muted/40" : "opacity-70"
      }`}
    >
      <div className="flex items-center justify-between w-full gap-3 min-w-0">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium leading-none truncate">{name}</p>
            {signedAt ? (
              <Badge variant="default" className="text-[10px] px-1.5">
                Signed
              </Badge>
            ) : null}
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Mail className="h-3 w-3" />
            <span className="truncate max-w-[16ch] block">{email}</span>
          </div>
        </div>

        <div className="s">
          <Button variant={"ghost"} size={"icon-sm"} disabled={!isInteractive}>
            <ExternalLink />
          </Button>
        </div>
      </div>
    </a>
  ),
);

SignerRow.displayName = "SignerRow";

interface ApplicationSignStageProps {
  applicationId: string;
  currentRole?: string;
  studentEmail?: string | null;
  handleStageChange: (val: APPLICATION_STAGE) => void;
  isInteractive?: boolean;
  isAllStagesSynced?: boolean;
  onSyncBlocked?: () => void;
}

const ApplicationSignStage = ({
  applicationId,
  currentRole,
  studentEmail,
  handleStageChange,
  isInteractive = true,
  isAllStagesSynced = false,
  onSyncBlocked,
}: ApplicationSignStageProps) => {
  const {
    data,
    mutateAsync: requestSignatures,
    error,
    isPending,
  } = useApplicationRequestSignaturesMutation(applicationId);

  const { mutateAsync: sendOfferLetter, isPending: isSending } =
    useApplicationSendOfferLetterMutation(applicationId);

  useEffect(() => {
    requestSignatures().catch(() => {});
  }, [requestSignatures]);

  const handleResend = async () => {
    if (!studentEmail) return;
    await sendOfferLetter({ student_email: studentEmail, student_name: "" });
    await requestSignatures();
  };

  const handleBeforeResendOpen = () => {
    if (!isAllStagesSynced) {
      onSyncBlocked?.();
      return false;
    }
    return true;
  };

  if (error) {
    return (
      <div className="space-y-2 text-center">
        <AlertCircle className="h-8 w-8 mx-auto text-destructive" />
        <p className="text-sm font-medium">Signature data unavailable</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => requestSignatures()}
          disabled={!isInteractive}
        >
          Retry
        </Button>
      </div>
    );
  }

  const firstItem = data?.items?.[0];
  const canShowResendOffer =
    currentRole === USER_ROLE.STAFF && (data?.items?.length ?? 0) > 0;

  const canStartGs =
    currentRole === USER_ROLE.STAFF &&
    !!firstItem?.student.signed_at &&
    !!firstItem?.agent.signed_at;

  return (
    <div>
      <div className=" flex items-center justify-between">
        {isPending && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {!data?.items?.length ? (
        <div className="text-center">
          <p className="text-xs text-muted-foreground italic">
            {isPending
              ? "Loading signature records"
              : "No active signature requests"}
          </p>
        </div>
      ) : (
        <section className="">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                {firstItem?.document_title}
              </h4>
            </div>

            <div>
              <SignerRow
                name={firstItem?.student.name ?? ""}
                email={firstItem?.student.email ?? ""}
                url={firstItem?.student.signing_url ?? "#"}
                signedAt={firstItem?.student.signed_at}
                isInteractive={true}
              />
              <SignerRow
                name={firstItem?.agent.name ?? ""}
                email={firstItem?.agent.email ?? ""}
                url={firstItem?.agent.signing_url ?? "#"}
                signedAt={firstItem?.agent.signed_at}
                isInteractive={true}
              />
            </div>
          </div>

          <p className="text-[10px] text-right text-muted-foreground mb-2">
            Initiated{" "}
            {firstItem?.created_at
              ? formatUtcToFriendlyLocal(firstItem.created_at)
              : "-"}
          </p>
        </section>
      )}

      <ResendOfferLetterAction
        isVisible={canShowResendOffer}
        hasStudentEmail={!!studentEmail}
        isSending={isSending}
        onBeforeOpen={handleBeforeResendOpen}
        onConfirm={handleResend}
      />

      {canStartGs ? (
        <div className="px-2">
          <Button
            onClick={() => handleStageChange(APPLICATION_STAGE.GS_ASSESSMENT)}
            className="w-full text-xs"
            disabled={!isInteractive}
          >
            Start GS Documentation
            <ArrowRight />
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default ApplicationSignStage;
