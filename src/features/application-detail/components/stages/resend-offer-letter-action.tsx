"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, RotateCw } from "lucide-react";
import { useState } from "react";

type ResendOfferLetterActionProps = {
  isVisible: boolean;
  hasStudentEmail: boolean;
  isAllStagesSynced?: boolean;
  isSending: boolean;
  onBeforeOpen?: () => boolean;
  onConfirm: () => Promise<void>;
  withUnresolvedWarning?: (action: () => void) => void;
};

export default function ResendOfferLetterAction({
  isVisible,
  hasStudentEmail,
  isAllStagesSynced = true,
  isSending,
  onBeforeOpen,
  onConfirm,
  withUnresolvedWarning,
}: ResendOfferLetterActionProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!isVisible) return null;
  const isSyncBlocked = !isAllStagesSynced;

  const handleOpenClick = () => {
    if (isSyncBlocked || (onBeforeOpen && !onBeforeOpen())) {
      return;
    }

    const openConfirm = () => setConfirmOpen(true);

    if (withUnresolvedWarning) {
      withUnresolvedWarning(openConfirm);
      return;
    }

    openConfirm();
  };

  const handleConfirm = async () => {
    await onConfirm();
    setConfirmOpen(false);
  };

  return (
    <div className="p-2">
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <Button
          className="w-full h-9 text-xs font-semibold"
          variant="outline"
          disabled={!hasStudentEmail || isSending || isSyncBlocked}
          onClick={handleOpenClick}
        >
          {isSending ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Processing
            </>
          ) : (
            <>
              <RotateCw />
              Resend Offer Letter
            </>
          )}
        </Button>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset signatures</DialogTitle>
            <DialogDescription>
              Existing student signatures will be invalidated. The student must
              sign again.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={isSending}
            >
              Confirm resend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!hasStudentEmail && (
        <p className="mt-2 text-[10px] text-center text-destructive font-medium">
          Student email required
        </p>
      )}
      {isSyncBlocked && (
        <p className="mt-2 text-[10px] text-center text-destructive font-medium">
          All sections must be synced before resending.
        </p>
      )}
    </div>
  );
}
