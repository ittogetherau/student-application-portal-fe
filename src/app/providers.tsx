"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { useState, type ReactNode } from "react";
import { Toaster } from "react-hot-toast";

const Providers = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <NuqsAdapter>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </NuqsAdapter>

        <Toaster
          position="bottom-right"
          containerClassName="toaster-wrapper"
          toastOptions={{
            style: {
              background: "var(--primary)",
              color: "var(--primary-foreground)",
              border: "1px solid var(--primary)",
              borderRadius: "var(--radius-md)",
              fontSize: "14px",
            },
            iconTheme: {
              primary: "white",
              secondary: "var(--accent)",
            },
            success: {
              style: {
                background: "green",
                color: "white",
                border: "1px solid green",
              },
              iconTheme: {
                primary: "white",
                secondary: "green",
              },
            },
            error: {
              style: {
                background: "var(--destructive)",
                color: "white",
                border: "1px solid var(--destructive)",
              },
              iconTheme: {
                primary: "white",
                secondary: "var(--destructive)",
              },
            },
            loading: {
              style: {
                background: "var(--primary)",
                color: "var(--primary-foreground)",
                border: "1px solid var(--primary)",
              },
              iconTheme: {
                primary: "white",
                secondary: "var(--accent)",
              },
            },
          }}
        />
      </QueryClientProvider>
    </SessionProvider>
  );
};

export default Providers;
