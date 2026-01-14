"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { USER_ROLE } from "@/constants/types";
import {
  useApplicationRequestSignaturesMutation,
  useApplicationSendOfferLetterMutation,
} from "@/hooks/useApplication.hook";
import { AlertCircle, Loader2, Mail, ShieldCheck, User } from "lucide-react";
import { memo, useEffect, useState } from "react";

const formatDateTime = (value: string | null) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface SignerRowProps {
  name: string;
  email: string;
  url: string;
  icon: React.ReactNode;
  signedAt?: string | null;
}

const SignerRow = memo(
  ({ name, email, url, icon, signedAt }: SignerRowProps) => (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between p-2 rounded-md hover:bg-muted/40 transition-colors"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="p-2 rounded-full bg-muted text-muted-foreground">
          {icon}
        </div>
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
      </div>
    </a>
  )
);

SignerRow.displayName = "SignerRow";

interface ApplicationSignDisplayProps {
  applicationId: string;
  currentRole?: string;
  studentEmail?: string | null;
}

const ApplicationSignDisplay = ({
  applicationId,
  currentRole,
  studentEmail,
}: ApplicationSignDisplayProps) => {
  const {
    data,
    mutateAsync: requestSignatures,
    error,
    isPending,
  } = useApplicationRequestSignaturesMutation(applicationId);

  const { mutateAsync: sendOfferLetter, isPending: isSending } =
    useApplicationSendOfferLetterMutation(applicationId);

  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    requestSignatures().catch(() => {});
  }, [requestSignatures]);

  const handleResend = async () => {
    if (!studentEmail) return;
    await sendOfferLetter({ student_email: studentEmail });
    await requestSignatures();
    setConfirmOpen(false);
  };

  if (error) {
    return (
      <Card className="border-destructive/40">
        <CardContent className="pt-6 text-center space-y-2">
          <AlertCircle className="h-8 w-8 mx-auto text-destructive" />
          <p className="text-sm font-medium">Signature data unavailable</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => requestSignatures()}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2 bg-muted/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold tracking-tight">
            Signatures
          </CardTitle>

          {isPending && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {!data?.items?.length ? (
          <div className="p-8 text-center">
            <p className="text-xs text-muted-foreground italic">
              {isPending
                ? "Loading signature records…"
                : "No active signature requests"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border ">
            {data.items.map((item, i) => {
              if (i === 0)
                return (
                  <div key={item.id} className="p-4 space-y-1">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      {item.document_title}
                    </h4>

                    <div className="">
                      <SignerRow
                        name={item.student.name}
                        email={item.student.email}
                        url={item.student.signing_url}
                        icon={<User className="h-4 w-4" />}
                        signedAt={item.student.signed_at}
                      />
                      <SignerRow
                        name={item.agent.name}
                        email={item.agent.email}
                        url={item.agent.signing_url}
                        icon={<ShieldCheck className="h-4 w-4" />}
                        signedAt={item.agent.signed_at}
                      />
                    </div>

                    <p className="text-[10px] text-right text-muted-foreground">
                      Initiated {formatDateTime(item.created_at)}
                    </p>
                  </div>
                );
            })}
          </div>
        )}

        {currentRole === USER_ROLE.STAFF && (
          <div className="p-4 border-t bg-muted/10">
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <DialogTrigger asChild>
                <Button
                  className="w-full h-9 text-xs font-semibold"
                  variant="outline"
                  disabled={!studentEmail || isSending}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Processing
                    </>
                  ) : (
                    "Resend Offer Letter"
                  )}
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reset signatures</DialogTitle>
                  <DialogDescription>
                    Existing signatures will be invalidated. Both parties must
                    sign again.
                  </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="ghost">Cancel</Button>
                  </DialogClose>
                  <Button
                    variant="destructive"
                    onClick={handleResend}
                    disabled={isSending}
                  >
                    Confirm resend
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {!studentEmail && (
              <p className="mt-2 text-[10px] text-center text-destructive font-medium">
                Student email required
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApplicationSignDisplay;
