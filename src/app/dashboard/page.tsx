"use client";

import AgentDashboard from "@/features/dashboard/components/agent-dashboard";
import StaffDashboard from "@/features/dashboard/components/staff-dashboard";
import { useSession } from "next-auth/react";
import { Suspense } from "react";

function DashboardContent() {
  const { data: session } = useSession();
  const role =
    (session?.user?.role as "staff" | "admin" | "agent" | undefined) ?? "admin";

  if (role === "agent") {
    return <AgentDashboard />;
  }

  return <StaffDashboard />;
}

export default function Dashboard() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}
