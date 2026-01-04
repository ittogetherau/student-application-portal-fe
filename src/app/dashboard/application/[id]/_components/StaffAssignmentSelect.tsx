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
import { useApplicationAssignMutation } from "@/hooks/useApplication.hook";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import useStaffMembersQuery from "../_hooks/useStaffMembers.hook";

interface StaffAssignmentSelectProps {
  applicationId: string;
  assignedStaffId?: string | null;
}

export function StaffAssignmentSelect({
  applicationId,
  assignedStaffId = null,
}: StaffAssignmentSelectProps) {
  const [open, setOpen] = useState(false);
  const { data: staffResponse, isLoading: isStaffLoading } =
    useStaffMembersQuery();
  const assignMutation = useApplicationAssignMutation(applicationId);

  const currentStaffId = assignedStaffId || null;

  const staffMembers = staffResponse?.data || [];

  const currentStaff = currentStaffId
    ? staffMembers.find((s) => s.staff_profile?.id === currentStaffId)
    : null;

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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={assignMutation.isPending}
          className="w-full h-8 justify-between text-sm"
        >
          {assignMutation.isPending ? (
            "Loading..."
          ) : currentStaff ? (
            currentStaff.email
          ) : isStaffLoading ? (
            "Loading..."
          ) : (
            <span className="text-foreground">Unassigned</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
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
                <span className="text-foreground">Unassigned</span>
              </CommandItem>
              {staffMembers.map((staff) => {
                const assignId = staff.staff_profile?.id || staff.id;

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
  );
}
