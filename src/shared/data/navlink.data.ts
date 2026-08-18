import type { SidebarIconName } from "@/features/dashboard/components/sidebar-nav";
import { siteRoutes } from "@/shared/constants/site-routes";
import type { UserRole } from "@/shared/lib/auth";

type NavItem = { label: string; href: string; icon: SidebarIconName };

const STAFF_DIRECTORY_NAV_ITEM: NavItem = {
  label: "Staff Directory",
  href: siteRoutes.dashboard.staffDirectory,
  icon: "agents",
};

const NAV_LINKS: Record<UserRole, Array<NavItem>> = {
  admin: [
    { label: "Dashboard", href: siteRoutes.dashboard.root, icon: "dashboard" },
  ],
  student: [
    { label: "Dashboard", href: siteRoutes.dashboard.root, icon: "dashboard" },
  ],
  agent: [
    { label: "Dashboard", href: siteRoutes.dashboard.root, icon: "dashboard" },
    {
      label: "Applications",
      href: siteRoutes.dashboard.application.root,
      icon: "applications",
    },
    {
      label: "Archived Applications",
      href: siteRoutes.dashboard.application.archived,
      icon: "queue",
    },
    {
      label: "Tasks",
      href: siteRoutes.dashboard.tasks,
      icon: "tasks",
    },
    {
      label: "GS Interviews",
      href: siteRoutes.dashboard.gsInterviews,
      icon: "calendar",
    },
  ],
  staff: [
    { label: "Dashboard", href: siteRoutes.dashboard.root, icon: "dashboard" },
    {
      label: "Application Queue",
      href: siteRoutes.dashboard.application.root,
      icon: "queue",
    },
    {
      label: "Archived Applications",
      href: siteRoutes.dashboard.application.archived,
      icon: "queue",
    },
    {
      label: "Tasks",
      href: siteRoutes.dashboard.tasks,
      icon: "tasks",
    },
    {
      label: "GS Interviews",
      href: siteRoutes.dashboard.gsInterviews,
      icon: "calendar",
    },
  ],
};

export const getNavItems = (
  role: UserRole,
  flags: { canViewStaffDirectory: boolean },
): NavItem[] => {
  const items = NAV_LINKS[role] ?? NAV_LINKS.agent;
  if (role === "staff" && flags.canViewStaffDirectory) {
    return [...items, STAFF_DIRECTORY_NAV_ITEM];
  }
  return items;
};

export default NAV_LINKS;
