import {
  POST_LOGIN_REDIRECT_COOKIE,
  POST_LOGIN_REDIRECT_MAX_AGE_SECONDS,
} from "@/shared/constants/post-login-redirect";

const readCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;

  const encodedName = encodeURIComponent(name);
  const parts = document.cookie.split("; ");

  for (const part of parts) {
    const [rawKey, ...rawValueParts] = part.split("=");
    if (!rawKey) continue;

    if (rawKey === encodedName || rawKey === name) {
      const rawValue = rawValueParts.join("=");
      try {
        return decodeURIComponent(rawValue);
      } catch {
        return rawValue;
      }
    }
  }

  return null;
};

const clearCookie = (name: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
};

const isSafeInternalRedirect = (path: string) => {
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;
  if (path.includes("://")) return false;

  return path.startsWith("/dashboard");
};

export const setPostLoginRedirect = (path: string) => {
  if (typeof document === "undefined") return;
  if (!isSafeInternalRedirect(path)) return;

  document.cookie = `${POST_LOGIN_REDIRECT_COOKIE}=${encodeURIComponent(
    path,
  )}; path=/; max-age=${POST_LOGIN_REDIRECT_MAX_AGE_SECONDS}; SameSite=Lax${
    process.env.NODE_ENV === "production" ? "; Secure" : ""
  }`;
};

export const consumePostLoginRedirect = (): string | null => {
  const value = readCookie(POST_LOGIN_REDIRECT_COOKIE);
  if (!value) return null;

  clearCookie(POST_LOGIN_REDIRECT_COOKIE);

  if (!isSafeInternalRedirect(value)) {
    return null;
  }

  return value;
};
