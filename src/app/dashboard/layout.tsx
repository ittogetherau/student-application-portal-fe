"use client";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppToolbar from "@/features/dashboard/components/app-toolbar";
import SidebarNav from "@/features/dashboard/components/sidebar-nav";
import { siteRoutes } from "@/shared/constants/site-routes";
import NAV_LINKS from "@/shared/data/navlink.data";
import type { UserRole } from "@/shared/lib/auth";
import { setPostLoginRedirect } from "@/shared/lib/post-login-redirect";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

const getDisplayName = (email: string) => email.split("@")[0] ?? email;

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      const search =
        typeof window !== "undefined" ? window.location.search : "";
      const nextPath = `${pathname}${search}`;
      setPostLoginRedirect(nextPath);
      router.replace(siteRoutes.auth.login);
    }
  }, [pathname, router, session?.user, status]);

  if (status !== "loading" && !session?.user) {
    return null;
  }

  // Safely extract the role with type guard and default fallback
  const userRole = session?.user?.role as UserRole;
  const userEmail = session?.user?.email ?? "";

  // Use the role to get the appropriate nav items
  const navItems = NAV_LINKS[userRole] ?? NAV_LINKS.agent;

  return (
    <SidebarProvider suppressHydrationWarning>
      {/* Do not add a parent here. will break the ui */}
      <SidebarNav
        items={navItems}
        user={{
          email: userEmail,
          name: getDisplayName(userEmail),
          role: userRole,
        }}
      />

      <SidebarInset className="bg-background flex flex-col relative">
        <AppToolbar />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
