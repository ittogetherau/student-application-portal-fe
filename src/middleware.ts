import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, parseAuthCookie } from "@/lib/auth";

const DASHBOARD_AGENT_PATHS = new Set([
  "/dashboard",
  "/dashboard/application",
]);
const DASHBOARD_STAFF_PATHS = new Set([
  "/dashboard",
  "/dashboard/agents",
  "/dashboard/application-queue",
]);

const normalizePath = (pathname: string) =>
  pathname.endsWith("/") && pathname !== "/"
    ? pathname.slice(0, -1)
    : pathname;

const isProtectedPath = (pathname: string) =>
  pathname.startsWith("/dashboard");

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/dash" || pathname.startsWith("/dash/")) {
    const targetPath = pathname.replace("/dash", "/dashboard");
    const url = new URL(targetPath, request.url);
    return NextResponse.redirect(url);
  }

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = parseAuthCookie(cookie);

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/dashboard")) {
    const normalized = normalizePath(pathname);
    const role = session.role;
    const allowedPaths =
      role === "agent"
        ? DASHBOARD_AGENT_PATHS
        : role === "staff"
          ? DASHBOARD_STAFF_PATHS
          : new Set(["/dashboard"]);

    if (!allowedPaths.has(normalized)) {
      const redirectUrl = new URL(Array.from(allowedPaths)[0], request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
