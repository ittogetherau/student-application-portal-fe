"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { siteRoutes } from "@/constants/site-routes";
import {
  useApplicationRejectMutation,
  useArchiveApplicationMutation,
} from "@/hooks/useApplication.hook";
import { Archive, ChevronDown, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface ApplicationActionsMenuProps {
  applicationId: string;
}

export function ApplicationActionsMenu({
  applicationId,
}: ApplicationActionsMenuProps) {
  const router = useRouter();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isAppealable, setIsAppealable] = useState(false);

  const rejectMutation = useApplicationRejectMutation(applicationId);
  const archiveMutation = useArchiveApplicationMutation();

  const isBusy = rejectMutation.isPending || archiveMutation.isPending;

  const openRejectDialog = () => {
    setRejectionReason("");
    setIsAppealable(false);
    setPopoverOpen(false);
    setRejectOpen(true);
  };

  const handleRejectSubmit = () => {
    const trimmed = rejectionReason.trim();
    if (trimmed.length < 10 || trimmed.length > 1000) {
      toast.error("Rejection reason must be 10–1000 characters");
      return;
    }
    rejectMutation.mutate(
      { rejection_reason: trimmed, is_appealable: isAppealable },
      {
        onSuccess: () => {
          toast.success("Application rejected.");
          setRejectOpen(false);
        },
        onError: (e) => {
          toast.error(e.message || "Failed to reject");
        },
      },
    );
  };

  const handleArchive = () => {
    setPopoverOpen(false);
    archiveMutation.mutate(applicationId, {
      onSuccess: (res) => {
        if (res?.success) {
          toast.success("Application archived.");
          router.push(siteRoutes.dashboard.application.root);
        }
      },
      onError: (e) => {
        toast.error(e.message || "Failed to archive");
      },
    });
  };

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-2 min-w-[120px] justify-between"
            disabled={isBusy}
          >
            {isBusy ? (
              <span className="text-muted-foreground">Loading…</span>
            ) : (
              <>
                <span>Actions</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-48 p-2">
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={openRejectDialog}
              disabled={rejectMutation.isPending}
              className="justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleArchive}
              disabled={archiveMutation.isPending}
              className="justify-start text-muted-foreground"
            >
              <Archive className="mr-2 h-4 w-4" />
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
              <Label
                htmlFor="is-appealable"
                className="text-sm font-normal cursor-pointer"
              >
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
                rejectMutation.isPending || rejectionReason.trim().length < 10
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
