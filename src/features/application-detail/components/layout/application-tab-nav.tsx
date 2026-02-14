import clsx from "clsx";
import Link from "next/link";

import type { ResolvedNavItem } from "@/features/application-detail/hooks/useApplicationLayoutData.hook";

type ApplicationTabNavProps = {
  activeSegment: string;
  navItems: ResolvedNavItem[];
};

function navButtonClass(isActive: boolean) {
  return clsx(
    "text-xs px-3 py-2 rounded-lg border transition",
    isActive
      ? "border-transparent bg-primary text-primary-foreground"
      : "border-muted/40 text-muted-foreground hover:text-foreground hover:border-border",
  );
}

export default function ApplicationTabNav({
  activeSegment,
  navItems,
}: ApplicationTabNavProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {navItems.map((item) => {
        const isActive = activeSegment === item.key;

        return (
          <Link
            key={item.key}
            href={item.href}
            className={navButtonClass(isActive)}
            aria-current={isActive ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
