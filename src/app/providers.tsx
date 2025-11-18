"use client";

import type { ReactNode } from "react";

import AppToaster from "@/components/ui/toaster";
import { SidebarProvider } from "@/components/ui/sidebar";

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <>
      {children}
      <AppToaster />
    </>
  );
};

export default Providers;
