"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { siteRoutes } from "@/constants/site-routes";
import {
  useApplicationApproveMutation,
  useApplicationAssignMutation,
  useApplicationRejectMutation,
  useArchiveApplicationMutation,
} from "@/hooks/useApplication.hook";
import {
  Archive,
  Check,
  CheckCircle2,
  ChevronDown,
  UserPlus,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import useStaffMembersQuery from "../_hooks/useStaffMembers.hook";

interface ApplicationActionsMenuProps {
  applicationId: string;
  assignedStaffId?: string | null;
  assignedStaffEmail?: string | null;
}

export function ApplicationActionsMenu({
  applicationId,
  assignedStaffId = null,
  assignedStaffEmail = null,
}: ApplicationActionsMenuProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [assignSubOpen, setAssignSubOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isAppealable, setIsAppealable] = useState(false);

  useEffect(() => {
    if (!menuOpen) setAssignSubOpen(false);
  }, [menuOpen]);

  useEffect(() => {
    if (!assignSubOpen) return;
    const t = setTimeout(() => {
      document.getElementById("assign-staff-search")?.focus();
    }, 50);
    return () => clearTimeout(t);
  }, [assignSubOpen]);

  const { data: staffResponse, isLoading: isStaffLoading } =
    useStaffMembersQuery();
  const staffMembers = staffResponse?.data || [];

  const assignMutation = useApplicationAssignMutation(applicationId);
  const approveMutation = useApplicationApproveMutation(applicationId);
  const rejectMutation = useApplicationRejectMutation(applicationId);
  const archiveMutation = useArchiveApplicationMutation();

  const currentStaffId = useMemo(() => {
    if (assignedStaffId) return assignedStaffId;
    if (!assignedStaffEmail) return null;
    const staffMatch = staffMembers.find(
      (s) =>
        s.email && s.email.toLowerCase() === assignedStaffEmail.toLowerCase(),
    );
    return staffMatch?.staff_profile?.id || staffMatch?.id || null;
  }, [assignedStaffEmail, assignedStaffId, staffMembers]);

  const currentStaff = useMemo(() => {
    if (!currentStaffId) return null;
    return (
      staffMembers.find((s) => s.staff_profile?.id === currentStaffId) ?? null
    );
  }, [currentStaffId, staffMembers]);

  const isBusy =
    assignMutation.isPending ||
    approveMutation.isPending ||
    rejectMutation.isPending ||
    archiveMutation.isPending;

  const handleAssign = (staffId: string | null) => {
    assignMutation.mutate(staffId, {
      onSuccess: () => {
        toast.success("Application assigned.");
        setMenuOpen(false);
      },
      onError: (e) => {
        toast.error(e.message || "Failed to assign");
      },
    });
  };

  // const handleAccept = () => {
  //   setMenuOpen(false);
  //   approveMutation.mutate(
  //     { offer_details: {} },
  //     {
  //       onSuccess: () => {
  //         toast.success("Application accepted.");
  //       },
  //       onError: (e) => {
  //         toast.error(e.message || "Failed to accept");
  //       },
  //     },
  //   );
  // };

  const openRejectDialog = () => {
    setRejectionReason("");
    setIsAppealable(false);
    setMenuOpen(false);
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
    setMenuOpen(false);
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
      <DropdownMenu
        open={menuOpen}
        onOpenChange={(open) => {
          setMenuOpen(open);
          if (!open) setAssignSubOpen(false);
        }}
      >
        <DropdownMenuTrigger asChild>
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
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
            Assign
          </DropdownMenuLabel>
          <DropdownMenuSub open={assignSubOpen} onOpenChange={setAssignSubOpen}>
            <DropdownMenuSubTrigger
              disabled={isStaffLoading || assignMutation.isPending}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              <span className="truncate">
                {currentStaff
                  ? currentStaff.email
                  : isStaffLoading
                    ? "Loading…"
                    : "Assign to…"}
              </span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent
              className="w-72 p-0"
              // align="start"
              // onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <Command
                className="rounded-lg border-0 bg-transparent"
                shouldFilter={true}
                loop
              >
                <CommandInput
                  id="assign-staff-search"
                  placeholder="Search by email or department…"
                  className="h-9 text-sm placeholder:text-muted-foreground"
                />
                <CommandList className="max-h-[260px]">
                  <CommandEmpty className="py-4 text-muted-foreground">
                    No staff member found.
                  </CommandEmpty>
                  <CommandGroup heading="Assignment">
                    <CommandItem
                      value="unassigned"
                      onSelect={() => handleAssign(null)}
                      className="gap-2"
                    >
                      <Check
                        className={`h-4 w-4 shrink-0 ${!currentStaffId ? "opacity-100" : "opacity-0"}`}
                      />
                      <span>Unassigned</span>
                    </CommandItem>
                    {staffMembers.map((staff) => {
                      const id = staff.staff_profile?.id || staff.id;
                      if (!staff.staff_profile || !staff.email) return null;
                      return (
                        <CommandItem
                          key={staff.id}
                          value={`${staff.email} ${staff.staff_profile?.department ?? ""}`.trim()}
                          onSelect={() => handleAssign(id)}
                          className="gap-2"
                        >
                          <Check
                            className={`h-4 w-4 shrink-0 ${currentStaffId === id ? "opacity-100" : "opacity-0"}`}
                          />
                          <div className="flex min-w-0 flex-col">
                            <span className="truncate">{staff.email}</span>
                            {staff.staff_profile?.department && (
                              <span className="truncate text-xs text-muted-foreground">
                                {staff.staff_profile.department}
                              </span>
                            )}
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
            Decision
          </DropdownMenuLabel>
          {/* <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              handleAccept();
            }}
            disabled={approveMutation.isPending}
            className="text-green-600 focus:text-green-700 focus:bg-green-50 dark:focus:bg-green-950"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Accept
          </DropdownMenuItem> */}
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              openRejectDialog();
            }}
            disabled={rejectMutation.isPending}
            className="text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Reject
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              handleArchive();
            }}
            disabled={archiveMutation.isPending}
            className="text-muted-foreground"
          >
            <Archive className="mr-2 h-4 w-4" />
            Archive
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
