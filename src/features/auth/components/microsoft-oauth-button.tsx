"use client";

import { ArrowRight } from "lucide-react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { siteRoutes } from "@/shared/constants/site-routes";
import { cn } from "@/shared/lib/utils";
import type { LoginResponse } from "@/service/auth.service";
import authService from "@/service/auth.service";

interface MicrosoftOAuthButtonProps {
  className?: string;
  role?: string;
  redirectTo?: string;
  label?: string;
  helperText?: string;
}

const MicrosoftOAuthButton = ({
  className,
  role = "staff",
  redirectTo = siteRoutes.dashboard.root,
  label = "Staff Login",
  helperText = "Sign in with Microsoft",
}: MicrosoftOAuthButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");
    const userId = searchParams.get("user_id");
    const email = searchParams.get("email");
    const returnedRole = searchParams.get("role");
    const tokenType = searchParams.get("token_type");

    if (error) {
      toast.error(
        `Microsoft login error: ${error}${
          searchParams.get("error_description")
            ? ` - ${searchParams.get("error_description")}`
            : ""
        }`,
      );
      const url = new URL(window.location.href);
      url.searchParams.delete("error");
      url.searchParams.delete("error_description");
      router.replace(url.pathname + url.search);
      return;
    }

    if (accessToken && refreshToken && !isLoading) {
      handleMicrosoftTokenCallback({
        accessToken,
        refreshToken,
        userId,
        email,
        role: returnedRole,
        tokenType,
      });
      return;
    }

    if (code && !isLoading) {
      handleMicrosoftCallback(code, state);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleMicrosoftCallback = async (
    code: string,
    state: string | null,
  ) => {
    setIsLoading(true);
    try {
      const result = await authService.microsoftCallback({
        code,
        ...(state && { state }),
      });

      if (result.success && result.data) {
        const loginData = result.data as LoginResponse;

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

        toast.success("Signed in with Microsoft");
        const url = new URL(window.location.href);
        url.searchParams.delete("code");
        url.searchParams.delete("state");
        window.history.replaceState({}, "", url.pathname);
        router.push(redirectTo);
      } else {
        throw new Error(
          result.message || "Failed to process Microsoft callback",
        );
      }
    } catch (callbackError) {
      console.error("Microsoft callback error:", callbackError);
      toast.error("Failed to complete Microsoft login. Please try again.");
      router.replace(window.location.pathname);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleMicrosoftTokenCallback = async ({
    accessToken,
    refreshToken,
    userId,
    email,
    role: callbackRole,
    tokenType,
  }: {
    accessToken: string;
    refreshToken: string;
    userId: string | null;
    email: string | null;
    role: string | null;
    tokenType: string | null;
  }) => {
    setIsLoading(true);
    try {
      const payload = parseJwtPayload(accessToken);
      const resolvedUserId =
        userId ?? (typeof payload?.sub === "string" ? payload.sub : "");
      const resolvedEmail =
        email ?? (typeof payload?.email === "string" ? payload.email : "");
      const resolvedRole =
        callbackRole ??
        (typeof payload?.role === "string" ? payload.role : role);

      if (!resolvedUserId || !resolvedEmail) {
        throw new Error("Missing user details from Microsoft callback.");
      }

      const loginData: LoginResponse = {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: tokenType ?? "bearer",
        user: {
          id: resolvedUserId,
          email: resolvedEmail,
          role: resolvedRole,
          status:
            typeof payload?.status === "string" ? payload.status : "active",
          rto_profile_id:
            typeof payload?.rto_profile_id === "string"
              ? payload.rto_profile_id
              : null,
          staff_admin:
            typeof payload?.staff_admin === "boolean"
              ? payload.staff_admin
              : undefined,
        },
      };

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

      toast.success("Signed in with Microsoft");
      const url = new URL(window.location.href);
      [
        "access_token",
        "refresh_token",
        "user_id",
        "email",
        "role",
        "token_type",
      ].forEach((param) => url.searchParams.delete(param));
      window.history.replaceState({}, "", url.pathname);
      router.push(redirectTo);
    } catch (callbackError) {
      console.error("Microsoft token callback error:", callbackError);
      toast.error("Failed to complete Microsoft login. Please try again.");
      router.replace(window.location.pathname);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    setIsLoading(true);
    try {
      const redirectUri =
        typeof window !== "undefined" ? window.location.origin : "";

      const result = await authService.microsoftLogin({
        role,
        ...(redirectUri && { redirect_uri: redirectUri }),
      });

      if (result.success && result.data) {
        const data = result.data as { auth_url: string };
        if (data.auth_url) {
          window.location.href = data.auth_url;
        } else {
          throw new Error("No auth URL received");
        }
      } else {
        throw new Error(result.message || "Failed to get Microsoft login URL");
      }
    } catch (loginError) {
      console.error("Microsoft login error:", loginError);
      toast.error("Failed to start Microsoft login. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleMicrosoftLogin}
      className={cn(
        "w-full mb-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl py-4 px-6 flex items-center justify-between transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed",
        className,
      )}
      disabled={isLoading}
      type="button"
    >
      <div className="flex items-center gap-3">
        <div className="bg-white rounded-lg p-2">
          <Image
            width={40}
            height={40}
            src={"/images/microsoft.svg"}
            alt="Microsoft"
            className="size-6"
          />
        </div>
        <div className="text-left">
          <div className="font-semibold">{label}</div>
          <div className="text-xs text-blue-100">{helperText}</div>
        </div>
      </div>
      <ArrowRight className="size-5" />
    </button>
  );
};

export default MicrosoftOAuthButton;
