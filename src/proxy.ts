import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { AUTH_SECRET } from "@/lib/auth-options";
import { siteRoutes } from "@/constants/site-routes";

const SHARED_PATHS = [
  siteRoutes.dashboard.root,
  siteRoutes.dashboard.application.root,
];

const STAFF_ONLY_PATHS = [
  siteRoutes.dashboard.agents.root,
  siteRoutes.dashboard.tasks,
];

const AUTH_PAGES = [
  siteRoutes.auth.login,
  siteRoutes.auth.register,
  siteRoutes.auth.signUp,
  siteRoutes.auth.signUpAlt,
] as const;

const normalizePath = (pathname: string): string =>
  pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;

const isProtectedPath = (pathname: string): boolean =>
  pathname.startsWith(siteRoutes.dashboard.root);

const matchesRoute = (pathname: string, route: string): boolean => {
  const normalized = normalizePath(pathname);
  return normalized === route || normalized.startsWith(`${route}/`);
};

const isAllowedPath = (pathname: string, role: string): boolean => {
  if (role === "admin") return true;

  const isSharedPath = SHARED_PATHS.some((route) =>
    matchesRoute(pathname, route),
  );
  if (isSharedPath) return true;

  const isStaffOnlyPath = STAFF_ONLY_PATHS.some((route) =>
    matchesRoute(pathname, route),
  );

  if (role === "staff") return isStaffOnlyPath;
  if (role === "agent") return !isStaffOnlyPath;

  return false;
};

const getDefaultRedirect = (role: string): string => {
  return siteRoutes.dashboard.root;
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({
    req: request,
    secret: AUTH_SECRET,
  });

  if (
    token &&
    (AUTH_PAGES as readonly string[]).includes(normalizePath(pathname))
  ) {
    const redirectUrl = new URL(
      getDefaultRedirect(token.role as string),
      request.url,
    );
    return NextResponse.redirect(redirectUrl);
  }

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL(siteRoutes.auth.login, request.url);
    return NextResponse.redirect(loginUrl);
  }

  const role = (token.role as string | undefined) ?? "admin";

  if (role === "student") {
    const loginUrl = new URL(siteRoutes.auth.login, request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (!isAllowedPath(pathname, role)) {
    const redirectUrl = new URL(siteRoutes.dashboard.root, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/sign-up", "/signup"],
};
