"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useApplicationAssignMutation } from "@/shared/hooks/use-applications";
import { Check, ChevronsUpDown, OctagonAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useStaffMembersQuery } from "../../hooks/useStaffMembers.hook";

interface StaffAssignmentSelectProps {
  applicationId: string;
  assignedStaffId?: string | null;
  assignedStaffEmail?: string | null;
}

export function StaffAssignmentSelect({
  applicationId,
  assignedStaffId = null,
  assignedStaffEmail = null,
}: StaffAssignmentSelectProps) {
  const [open, setOpen] = useState(false);
  const { data: staffResponse, isLoading: isStaffLoading } =
    useStaffMembersQuery();
  const assignMutation = useApplicationAssignMutation(applicationId);

  const staffMembers = staffResponse?.data || [];

  const currentStaffId = useMemo(() => {
    if (assignedStaffId) return assignedStaffId;
    if (!assignedStaffEmail) return null;
    const staffMatch = staffMembers.find(
      (staff) =>
        staff.email &&
        staff.email.toLowerCase() === assignedStaffEmail.toLowerCase(),
    );
    return staffMatch?.staff_profile?.id || staffMatch?.id || null;
  }, [assignedStaffEmail, assignedStaffId, staffMembers]);

  const currentStaff = useMemo(() => {
    if (!currentStaffId) return null;
    return (
      staffMembers.find((s) => s.staff_profile?.id === currentStaffId) || null
    );
  }, [currentStaffId, staffMembers]);

  const handleAssign = (staffId: string | null) => {
    assignMutation.mutate(staffId, {
      onSuccess: () => {
        toast.success(`Application assigned to staff`);
        setOpen(false);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to assign staff member");
      },
    });
  };

  return (
    <div className="flex items-center gap-1 min-w-0 w-full relative">
      {!(assignedStaffId || assignedStaffEmail) && (
        <div className="absolute top-1/2 -translate-y-1/2 right-6 animate-scale-pulse">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={"ghost"}
                size={"icon-xs"}
                className="text-destructive"
              >
                <OctagonAlert />
              </Button>
            </TooltipTrigger>
            <TooltipContent>No staff is assigned.</TooltipContent>
          </Tooltip>
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={assignMutation.isPending}
            id="1-sre"
            className="flex-1 min-w-0 h-8 justify-between text-sm"
          >
            {assignMutation.isPending ? (
              "Loading..."
            ) : currentStaff ? (
              <span className="block w-full truncate">
                {currentStaff.email}
              </span>
            ) : assignedStaffEmail ? (
              <span className="block w-full truncate">
                {assignedStaffEmail}
              </span>
            ) : isStaffLoading ? (
              "Loading..."
            ) : (
              <span className="text-foreground">Assign To</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[264px] p-0" align="center">
          <Command>
            <CommandInput placeholder="Search by email..." className="h-9" />
            <CommandList>
              <CommandEmpty>No staff member found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="unassigned"
                  onSelect={() => handleAssign(null)}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      !currentStaffId ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <span className="text-foreground">Assign To</span>
                </CommandItem>
                {staffMembers.map((staff) => {
                  const assignId = staff.staff_profile?.id || staff.id;

                  if (!staff.staff_profile) return;

                  return (
                    <CommandItem
                      key={staff.id}
                      value={staff.email}
                      onSelect={() => handleAssign(assignId)}
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          currentStaffId === assignId
                            ? "opacity-100"
                            : "opacity-0"
                        }`}
                      />
                      <div className="flex flex-col text-foreground">
                        <span>{staff.email}</span>
                        {staff.staff_profile?.department && (
                          <span className="text-xs text-muted-foreground">
                            {staff.staff_profile.department}
                          </span>
                        )}
                        {/* {staff.role && (
                        <span className="text-xs text-muted-foreground">
                          {staff.role}
                        </span>
                      )} */}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
