"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Users,
  Inbox,
  LogOut,
  UserRound,
} from "lucide-react";

import type { UserRole } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarItem,
  SidebarMenu,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import LogoutButton from "@/components/logout-button";

const ICONS = {
  dashboard: LayoutDashboard,
  applications: FileText,
  agents: Users,
  queue: Inbox,
};

export type SidebarIconName = keyof typeof ICONS;

type SidebarNavItem = {
  href: string;
  label: string;
  icon: SidebarIconName;
};

type SidebarNavProps = {
  items: SidebarNavItem[];
  user: {
    email: string;
    name: string;
    role: UserRole;
  };
};

const SidebarNav = ({ items, user }: SidebarNavProps) => {
  const pathname = usePathname();
  const { close, open } = useSidebar();
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [menuOpen]);

  const handleNavigate = () => {
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      close();
    }
    setMenuOpen(false);
  };

  const roleLabel =
    user.role === "staff"
      ? "Staff Portal"
      : user.role === "agent"
      ? "Agent Portal"
      : "Admin Portal";
  const initials =
    user.name?.[0]?.toUpperCase() ?? user.email[0]?.toUpperCase() ?? "?";

  return (
    <>
      <Sidebar>
        <SidebarContent>
          <div className="mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-900 text-lg font-semibold text-white">
                C
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Churchill University
                </p>
                <p className="text-xs text-gray-500">{roleLabel}</p>
              </div>
            </div>
          </div>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => {
                  const isExactMatch =
                    pathname === item.href ||
                    (item.href !== "/dashboard" &&
                      pathname.startsWith(`${item.href}/`));
                  const Icon = ICONS[item.icon] ?? LayoutDashboard;
                  return (
                    <SidebarItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isExactMatch}
                        onClick={handleNavigate}
                        className="gap-3"
                      >
                        <Link href={item.href}>
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-gray-100"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-950 text-sm font-semibold text-secondary">
                {initials}
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </button>

            {menuOpen && (
              <div className="absolute bottom-14 left-0 z-50 w-full rounded-2xl bg-white p-2 text-sm shadow-lg">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-gray-700 transition hover:bg-gray-50"
                >
                  <UserRound className="h-4 w-4" />
                  Profile
                </button>
                <LogoutButton
                  redirectPath="/login"
                  variant="ghost"
                  className="w-full justify-start"
                  size="sm"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="pl-2">Logout</span>
                </LogoutButton>
              </div>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>
      <div
        className={cn(
          "fixed inset-0 z-30 bg-black/30 sm:hidden",
          open ? "block" : "hidden"
        )}
        onClick={() => {
          close();
          setMenuOpen(false);
        }}
      />
    </>
  );
};

export default SidebarNav;
