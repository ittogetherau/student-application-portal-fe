"use client";

import AgentDashboard from "@/components/dashboard/dash/agent";
import StaffDashboard from "@/components/dashboard/dash/staff";
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
