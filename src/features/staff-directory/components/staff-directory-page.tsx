"use client";

import ContainerLayout from "@/components/ui-kit/layout/container-layout";
import { useStaffMembersQuery } from "@/features/application-detail/hooks/useStaffMembers.hook";
import { useRoleFlags } from "@/shared/hooks/use-role-flags";
import { siteRoutes } from "@/shared/constants/site-routes";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { StaffDirectoryTable } from "./staff-directory-table";

export default function StaffDirectoryPage() {
  const router = useRouter();
  const { canViewStaffDirectory } = useRoleFlags();
  const staffQuery = useStaffMembersQuery({ enabled: canViewStaffDirectory });

  useEffect(() => {
    if (!canViewStaffDirectory) {
      router.replace(siteRoutes.dashboard.root);
    }
  }, [canViewStaffDirectory, router]);

  useEffect(() => {
    if (!staffQuery.isError) return;
    const message =
      staffQuery.error instanceof Error
        ? staffQuery.error.message
        : "Failed to load staff members";
    toast.error(message);
  }, [staffQuery.error, staffQuery.isError]);

  if (!canViewStaffDirectory) {
    return null;
  }

  return (
    <ContainerLayout className="py-6 flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Staff Directory
      </h1>

      {staffQuery.isLoading ? (
        <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">
          Loading staff members...
        </div>
      ) : (
        <StaffDirectoryTable staffMembers={staffQuery.data?.data ?? []} />
      )}
    </ContainerLayout>
  );
}
