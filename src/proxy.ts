import { siteRoutes } from "@/shared/constants/site-routes";
import { AUTH_SECRET } from "@/shared/lib/auth-options";
import {
  POST_LOGIN_REDIRECT_COOKIE,
  POST_LOGIN_REDIRECT_MAX_AGE_SECONDS,
} from "@/shared/constants/post-login-redirect";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const SHARED_PATHS = [
  siteRoutes.dashboard.root,
  siteRoutes.dashboard.application.root,
];

const STAFF_ONLY_PATHS = [siteRoutes.dashboard.tasks];

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

const isSafeInternalRedirect = (path: string) => {
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;
  if (path.includes("://")) return false;

  return path.startsWith(siteRoutes.dashboard.root);
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
    const storedRedirect = request.cookies.get(
      POST_LOGIN_REDIRECT_COOKIE,
    )?.value;
    const destination =
      storedRedirect && isSafeInternalRedirect(storedRedirect)
        ? storedRedirect
        : getDefaultRedirect(token.role as string);

    const redirectUrl = new URL(destination, request.url);
    const response = NextResponse.redirect(redirectUrl);

    if (storedRedirect) {
      response.cookies.delete(POST_LOGIN_REDIRECT_COOKIE);
    }

    return response;
  }

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL(siteRoutes.auth.login, request.url);
    const response = NextResponse.redirect(loginUrl);

    const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    response.cookies.set(POST_LOGIN_REDIRECT_COOKIE, nextPath, {
      path: "/",
      maxAge: POST_LOGIN_REDIRECT_MAX_AGE_SECONDS,
      sameSite: "lax",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
    });

    return response;
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
