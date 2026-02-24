"use client";

import { USER_ROLE } from "@/shared/constants/types";
import { useSession } from "next-auth/react";

const normalizeRole = (role?: string | null): USER_ROLE | undefined => {
  if (!role) return undefined;
  return Object.values(USER_ROLE).includes(role as USER_ROLE)
    ? (role as USER_ROLE)
    : undefined;
};

export type RoleFlags = {
  role: USER_ROLE | undefined;
  isAgent: boolean;
  isStaff: boolean;
  isStaffAdmin: boolean;
  isStaffOrAdmin: boolean;
};

export const useRoleFlags = (): RoleFlags => {
  const { data: session } = useSession();

  const role = normalizeRole(session?.user.role);
  const isStaffAdmin = Boolean(session?.user.staff_admin);
  const isStaff = role === USER_ROLE.STAFF;
  const isAgent = role === USER_ROLE.AGENT;

  return {
    role,
    isAgent,
    isStaff,
    isStaffAdmin,
    isStaffOrAdmin: isStaff || isStaffAdmin,
  };
};
