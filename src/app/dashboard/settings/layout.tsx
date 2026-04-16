"use client";

import { cn } from "@/shared/lib/utils";
import { siteRoutes } from "@/shared/constants/site-routes";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { User, Users } from "lucide-react";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    {
      title: "My Profile",
      href: siteRoutes.dashboard.settings.profile,
      icon: <User className="w-4 h-4 mr-2" />,
    },
    {
      title: "Sub-Agents",
      href: siteRoutes.dashboard.settings.subAgents,
      icon: <Users className="w-4 h-4 mr-2" />,
    },
  ];

  return (
    <div className="flex-1 w-full p-4 md:p-8 space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account profile and sub-agents.
        </p>
      </div>

      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/5">
          <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <NextLink
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-muted/50",
                    isActive
                      ? "bg-primary/10 text-primary hover:bg-primary/15 font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.icon}
                  {item.title}
                </NextLink>
              );
            })}
          </nav>
        </aside>
        <div className="flex-1 lg:max-w-4xl">{children}</div>
      </div>
    </div>
  );
}
