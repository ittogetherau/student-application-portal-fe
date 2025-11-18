import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SidebarNav, {
  type SidebarIconName,
} from "@/components/dashboard/sidebar-nav";
import AppToolbar from "@/components/dashboard/app-toolbar";
import { SidebarInset } from "@/components/ui/sidebar";
import { AUTH_COOKIE_NAME, parseAuthCookie, type UserRole } from "@/lib/auth";

type NavItem = { label: string; href: string; icon: SidebarIconName };

const NAV_LINKS: Record<UserRole, Array<NavItem>> = {
  admin: [{ label: "Dashboard", href: "/dashboard", icon: "dashboard" }],
  agent: [
    { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
    {
      label: "Applications",
      href: "/dashboard/application",
      icon: "applications",
    },
  ],
  staff: [
    { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
    { label: "Agents", href: "/dashboard/agents", icon: "agents" },
    {
      label: "Application Queue",
      href: "/dashboard/application-queue",
      icon: "queue",
    },
  ],
};

const getDisplayName = (email: string) => email.split("@")[0] ?? email;

const DashboardLayout = async ({ children }: { children: ReactNode }) => {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const session = parseAuthCookie(authCookie);

  if (!session) redirect("/login");

  const navItems = NAV_LINKS[session.role] ?? NAV_LINKS.admin;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarNav
        items={navItems}
        user={{
          email: session.email,
          name: getDisplayName(session.email),
          role: session.role,
        }}
      />
      <SidebarInset>
        <AppToolbar />
        <div className="flex-1 p-8">{children}</div>
      </SidebarInset>
    </div>
  );
};

export default DashboardLayout;
