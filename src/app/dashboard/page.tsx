"use client";

import AgentDashboard from "@/features/dashboard/components/agent-dashboard";
import StaffDashboard from "@/features/dashboard/components/staff-dashboard";
import { useSession } from "next-auth/react";

export default function Dashboard() {
  const { data: session } = useSession();
  const role =
    (session?.user?.role as "staff" | "admin" | "agent" | undefined) ?? "admin";

  if (role === "agent") {
    return <AgentDashboard />;
  }

  return <StaffDashboard />;
}
