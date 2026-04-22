"use client";

import { cn } from "@/shared/lib/utils";
import { siteRoutes } from "@/shared/constants/site-routes";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode } from "react";
import { User, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const role = session?.user?.role;

  useEffect(() => {
    if (status === "loading") return;
    if (role !== "agent") {
      router.replace(siteRoutes.dashboard.root);
    }
  }, [role, router, status]);

  if (status === "loading") {
    return null;
  }

  if (role !== "agent") {
    return null;
  }

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
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account profile and sub-agents.
        </p>
      </div>

      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/5">
          <nav className="flex rounded-xl border bg-card p-1.5 shadow-sm lg:flex-col lg:gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <NextLink
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-muted text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
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
