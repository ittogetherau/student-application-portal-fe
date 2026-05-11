import Providers from "@/app/providers";
import type { Metadata } from "next";
import "./globals.css";
import "./fullcalendar.tailwind.css";

export const metadata: Metadata = {
  title: "Student Application Management System",
  description: "student-application-management-system",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
