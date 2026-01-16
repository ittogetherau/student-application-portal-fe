"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import type { LoginResponse } from "@/service/auth.service";
import { siteRoutes } from "@/constants/site-routes";

function CallbackContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Check for OAuth errors
        const error = searchParams.get("error");
        if (error) {
          const errorDesc = searchParams.get("error_description");
          throw new Error(errorDesc || error);
        }

        // Extract tokens from URL
        const accessToken = searchParams.get("access_token");
        const refreshToken = searchParams.get("refresh_token");
        const userId = searchParams.get("user_id");
        const email = searchParams.get("email");
        const role = searchParams.get("role");
        const tokenType = searchParams.get("token_type");

        // Validate required parameters
        if (!accessToken || !refreshToken) {
          throw new Error("Missing authentication tokens. Please try logging in again.");
        }

        // Parse JWT payload for additional user info
        const payload = parseJwtPayload(accessToken);
        
        const resolvedUserId = userId ?? (typeof payload?.sub === "string" ? payload.sub : "");
        const resolvedEmail = email ?? (typeof payload?.email === "string" ? payload.email : "");
        const resolvedRole = role ?? (typeof payload?.role === "string" ? payload.role : "staff");

        if (!resolvedUserId || !resolvedEmail) {
          throw new Error("Invalid user information received. Please try again.");
        }

        // Construct login data matching backend response format
        const loginData: LoginResponse = {
          access_token: accessToken,
          refresh_token: refreshToken,
          token_type: tokenType ?? "bearer",
          user: {
            id: resolvedUserId,
            email: resolvedEmail,
            role: resolvedRole,
            status: typeof payload?.status === "string" ? payload.status : "active",
            rto_profile_id: typeof payload?.rto_profile_id === "string" ? payload.rto_profile_id : null,
            staff_admin: typeof payload?.staff_admin === "boolean" ? payload.staff_admin : undefined,
          },
        };

        // Authenticate with NextAuth
        const signInResult = await signIn("credentials", {
          email: loginData.user.email,
          password: "",
          role: loginData.user.role,
          microsoft_token: JSON.stringify(loginData),
          redirect: false,
        });

        if (signInResult?.error) {
          throw new Error(signInResult.error);
        }

        if (!signInResult?.ok) {
          throw new Error("Authentication failed. Please try again.");
        }

        setStatus("success");
        
        // Redirect to dashboard after a brief delay to show success state
        setTimeout(() => {
          router.push(siteRoutes.dashboard.root);
        }, 500);

      } catch (err) {
        console.error("OAuth callback error:", err);
        setStatus("error");
        setErrorMessage(err instanceof Error ? err.message : "An unexpected error occurred");
        
        // Redirect to login after showing error
        setTimeout(() => {
          router.push(`/login?error=${encodeURIComponent(err instanceof Error ? err.message : "Authentication failed")}`);
        }, 3000);
      }
    };

    processCallback();
  }, [searchParams, router]);

  const parseJwtPayload = (token: string): Record<string, unknown> | null => {
    try {
      const payload = token.split(".")[1];
      if (!payload) return null;
      const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
      const decoded = atob(normalized);
      return JSON.parse(decoded) as Record<string, unknown>;
    } catch {
      return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
        {status === "loading" && (
          <div className="text-center">
            <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Completing Sign In
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your credentials...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Sign In Successful!
            </h2>
            <p className="text-gray-600">
              Redirecting to your dashboard...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Authentication Failed
            </h2>
            <p className="text-gray-600 mb-4">{errorMessage}</p>
            <p className="text-sm text-gray-500">
              Redirecting to login page...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
