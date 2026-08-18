"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { StaffMember } from "@/service/staff-members.service";

const formatRole = (role: string) =>
  role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

const isActiveStatus = (status: string) => status.toLowerCase() === "active";

interface StaffDirectoryTableProps {
  staffMembers: StaffMember[];
}

export function StaffDirectoryTable({
  staffMembers,
}: StaffDirectoryTableProps) {
  if (staffMembers.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">
        No staff members found.
      </div>
    );
  }

  return (
    <div className="rounded-md border w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Job Title</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staffMembers.map((staff) => (
            <TableRow key={staff.id}>
              <TableCell className="font-medium">{staff.email}</TableCell>
              <TableCell>{formatRole(staff.role)}</TableCell>
              <TableCell>{staff.staff_profile?.department || "-"}</TableCell>
              <TableCell>{staff.staff_profile?.job_title || "-"}</TableCell>
              <TableCell>
                <Badge variant={isActiveStatus(staff.status) ? "default" : "secondary"}>
                  {staff.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
