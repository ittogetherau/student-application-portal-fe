"use client";

import { ThemeToggle } from "@/components/shared/toggle-theme";
import { SidebarTrigger } from "@/components/ui/sidebar";
import NotificationsPopover from "@/features/notifications/components/notifications-popover";
import { cn, isUuid } from "@/shared/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

const formatSegment = (segment: string) =>
  segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const AppToolbar = () => {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const breadcrumbs = useMemo(
    () =>
      segments.reduce<Array<{ label: string; href: string }>>(
        (acc, segment, index) => {
          const href = "/" + segments.slice(0, index + 1).join("/");
          const isApplicationId =
            segments[index - 1] === "application" && isUuid(segment);
          if (isApplicationId) {
            return acc;
          }

          acc.push({
            label: index === 0 ? "Dashboard" : formatSegment(segment),
            href,
          });
          return acc;
        },
        [],
      ),
    [segments],
  );

  return (
    <div className="flex h-14 items-center justify-between border-b border-border bg-card px-4 sm:px-6 sticky top-0 left-0  z-[10]">
      <div className="flex items-center gap-3">
        <SidebarTrigger />

        <nav className="text-sm text-muted-foreground">
          <ol className="flex items-center gap-2">
            {breadcrumbs.map((crumb, index) => {
              const isActive = index === breadcrumbs.length - 1;
              return (
                <li key={crumb.href} className="flex items-center gap-2">
                  <Link
                    href={crumb.href}
                    className={cn(
                      "transition-colors",
                      isActive
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {crumb.label}
                  </Link>
                  {index < breadcrumbs.length - 1 && (
                    <span className="text-border">/</span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      <div>
        <ThemeToggle />
        <NotificationsPopover />
      </div>
    </div>
  );
};

export default AppToolbar;
