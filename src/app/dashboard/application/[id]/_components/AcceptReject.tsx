"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  useApplicationApproveMutation,
  useApplicationRejectMutation,
  useArchiveApplicationMutation,
} from "@/hooks/useApplication.hook";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronsUpDown, Archive, XCircle } from "lucide-react";
import { siteRoutes } from "@/constants/site-routes";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Checkbox } from "@/components/ui/checkbox";

interface AcceptRejectProps {
  applicationId: string;
}

export default function AcceptRejectStatus({ applicationId }: AcceptRejectProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isAppealable, setIsAppealable] = useState(false);

  const approveMutation = useApplicationApproveMutation(applicationId);
  const rejectMutation = useApplicationRejectMutation(applicationId);
  const archiveMutation = useArchiveApplicationMutation();

  const isPending =
    approveMutation.isPending ||
    rejectMutation.isPending ||
    archiveMutation.isPending;

  const handleAccept = () => {
    approveMutation.mutate(
      { offer_details: {} },
      {
        onSuccess: () => {
          toast.success("Application accepted.");
          setOpen(false);
        },
        onError: (error) => {
          toast.error(error.message || "Failed to accept application");
        },
      }
    );
  };

  const openRejectDialog = () => {
    setRejectionReason("");
    setIsAppealable(false);
    setRejectOpen(true);
  };

  const handleRejectSubmit = () => {
    const trimmed = rejectionReason.trim();
    if (trimmed.length < 10 || trimmed.length > 1000) {
      toast.error("Rejection reason must be between 10 and 1000 characters");
      return;
    }
    rejectMutation.mutate(
      { rejection_reason: trimmed, is_appealable: isAppealable },
      {
        onSuccess: () => {
          toast.success("Application rejected.");
          setRejectOpen(false);
          setOpen(false);
        },
        onError: (error) => {
          toast.error(error.message || "Failed to reject application");
        },
      }
    );
  };

  const handleArchive = () => {
    archiveMutation.mutate(applicationId, {
      onSuccess: (res) => {
        if (res?.success) {
          toast.success("Application archived.");
          setOpen(false);
          router.push(siteRoutes.dashboard.application.root);
        }
      },
      onError: (error) => {
        toast.error(error.message || "Failed to archive application");
      },
    });
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={isPending}
            className="w-full h-8 justify-between text-sm min-w-[120px]"
          >
            {isPending ? (
              "Loading..."
            ) : (
              <>
                <span className="text-foreground">Accept / Reject</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-1" align="center">
          <div className="flex flex-col gap-0.5">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
              onClick={handleAccept}
              disabled={approveMutation.isPending}
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Accept
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10"
              onClick={openRejectDialog}
              disabled={rejectMutation.isPending}
            >
              <XCircle className="h-4 w-4 shrink-0" />
              Reject
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-muted-foreground hover:bg-muted"
              onClick={handleArchive}
              disabled={archiveMutation.isPending}
            >
              <Archive className="h-4 w-4 shrink-0" />
              Archive
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">
                Reason for rejection <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="rejection-reason"
                placeholder="Provide a reason (10–1000 characters)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="resize-none"
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground">
                {rejectionReason.length}/1000 characters (min 10)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="is-appealable"
                checked={isAppealable}
                onCheckedChange={(v) => setIsAppealable(!!v)}
              />
              <Label htmlFor="is-appealable" className="text-sm font-normal cursor-pointer">
                Applicant may appeal this decision
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectSubmit}
              disabled={
                rejectMutation.isPending ||
                rejectionReason.trim().length < 10
              }
            >
              {rejectMutation.isPending ? "Rejecting…" : "Reject application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
