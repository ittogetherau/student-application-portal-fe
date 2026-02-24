"use client";

import clsx from "clsx";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { ResolvedNavItem } from "@/features/application-detail/hooks/useApplicationLayoutData.hook";
import { useApplicationUnresolvedThreadsQuery } from "@/features/threads/hooks/application-threads.hook";

type ApplicationTabNavProps = {
  activeSegment: string;
  applicationId: string;
  navItems: ResolvedNavItem[];
};

function navButtonClass(isActive: boolean) {
  return clsx(
    "relative inline-flex items-center text-xs px-3 py-2 rounded-lg border transition",
    isActive
      ? "border-transparent bg-primary text-primary-foreground"
      : "border-muted/40 text-muted-foreground hover:text-foreground hover:border-border",
  );
}

export default function ApplicationTabNav({
  activeSegment,
  applicationId,
  navItems,
}: ApplicationTabNavProps) {
  const unresolvedThreadsQuery =
    useApplicationUnresolvedThreadsQuery(applicationId);
  const unresolvedCount =
    unresolvedThreadsQuery.data?.data?.unresolved_count ?? 0;
  const shouldShowUnresolvedBadge =
    unresolvedCount > 0 &&
    !unresolvedThreadsQuery.isLoading &&
    !unresolvedThreadsQuery.isError;

  return (
    <div className="flex flex-wrap gap-2">
      {navItems.map((item) => {
        const isActive = activeSegment === item.key;
        const isCommunicationTab = item.key === "communication";

        return (
          <Link
            key={item.key}
            href={item.href}
            className={navButtonClass(isActive)}
            aria-current={isActive ? "page" : undefined}
          >
            {item.label}
            {isCommunicationTab && shouldShowUnresolvedBadge ? (
              <Badge
                variant="destructive"
                className="absolute  -top-2 -right-2 h-5 min-w-5 px-1 text-[10px] leading-none"
              >
                {unresolvedCount}
              </Badge>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
