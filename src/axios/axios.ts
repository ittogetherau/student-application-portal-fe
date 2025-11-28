import axios, {
  AxiosHeaders,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import { getSession, signOut, type Session } from "next-auth/react";

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") || undefined;

const createAxiosInstance = () =>
  axios.create({
    baseURL,
    timeout: 20000,
  });

export const axiosPublic = createAxiosInstance();
export const axiosPrivate = createAxiosInstance();

// Backwards compatibility aliases
export const axiosDataPublic = axiosPublic;
export const axiosDataPrivate = axiosPrivate;

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

const applyAuthHeader = (
  headers: InternalAxiosRequestConfig["headers"],
  value: string,
) => {
  const merged =
    headers instanceof AxiosHeaders ? headers : new AxiosHeaders(headers);
  merged.set("Authorization", value);
  return merged;
};

type SessionWithTokens = Session & {
  accessToken?: string;
  access_token?: string;
  tokenType?: string;
};

const extractTokens = (session: Session | null): SessionWithTokens => {
  if (!session) return {};
  return session as SessionWithTokens;
};

// Attach auth token for protected requests
axiosPrivate.interceptors.request.use(
  async (config) => {
    const session = extractTokens(await getSession());
    const accessToken = session.accessToken ?? session.access_token;
    const tokenType = session.tokenType || "Bearer";

    if (accessToken) {
      config.headers = applyAuthHeader(
        config.headers,
        `${tokenType} ${accessToken}`,
      );
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Refresh token on 401 once, then retry
axiosPrivate.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequest;

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ update: true }),
        });

        const updatedSession = extractTokens(await getSession());
        const refreshedToken =
          updatedSession.accessToken ?? updatedSession.access_token;
        const tokenType = updatedSession.tokenType || "Bearer";

        if (!refreshedToken) {
          throw new Error("Unable to refresh access token");
        }

        originalRequest.headers = applyAuthHeader(
          originalRequest.headers,
          `${tokenType} ${refreshedToken}`,
        );

        return axiosPrivate(originalRequest);
      } catch (refreshError) {
        await signOut({ redirect: false, callbackUrl: "/login" });
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
