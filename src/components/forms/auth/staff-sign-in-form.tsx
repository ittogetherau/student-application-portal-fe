"use client";

import PortalCredentialsForm from "./portal-credentials-form";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import authService from "@/service/auth.service";
import { signIn } from "next-auth/react";
import { toast } from "react-hot-toast";
import { siteRoutes } from "@/constants/site-routes";
import type { LoginResponse } from "@/service/auth.service";

const StaffSignInForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle OAuth callback when user returns from Microsoft
  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");
    const userId = searchParams.get("user_id");
    const email = searchParams.get("email");
    const role = searchParams.get("role");
    const tokenType = searchParams.get("token_type");

    if (error) {
      toast.error(
        `Microsoft login error: ${error}${
          searchParams.get("error_description")
            ? ` - ${searchParams.get("error_description")}`
            : ""
        }`
      );
      // Clean up URL
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
        role,
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
    state: string | null
  ) => {
    setIsLoading(true);
    try {
      const result = await authService.microsoftCallback({
        code,
        ...(state && { state }),
      });

      if (result.success && result.data) {
        const loginData = result.data as LoginResponse;

        // Create NextAuth session with Microsoft tokens
        const signInResult = await signIn("credentials", {
          email: loginData.user.email,
          password: "", // Not used for OAuth
          role: loginData.user.role,
          microsoft_token: JSON.stringify(loginData), // Pass tokens as JSON string
          redirect: false,
        });

        if (signInResult?.error) {
          throw new Error(signInResult.error);
        }

        toast.success("Signed in with Microsoft");
        // Clean up URL parameters before redirecting
        const url = new URL(window.location.href);
        url.searchParams.delete("code");
        url.searchParams.delete("state");
        window.history.replaceState({}, "", url.pathname);
        const destination = siteRoutes.dashboard.root;
        router.push(destination);
      } else {
        throw new Error(
          result.message || "Failed to process Microsoft callback"
        );
      }
    } catch (error) {
      console.error("Microsoft callback error:", error);
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
    role,
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
        role ?? (typeof payload?.role === "string" ? payload.role : "staff");

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
      router.push(siteRoutes.dashboard.root);
    } catch (error) {
      console.error("Microsoft token callback error:", error);
      toast.error("Failed to complete Microsoft login. Please try again.");
      router.replace(window.location.pathname);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    setIsLoading(true);
    try {
      // Get current page URL for redirect_uri
      const redirectUri =
        typeof window !== "undefined"
          ? `${window.location.origin}${window.location.pathname}`
          : "";

      const result = await authService.microsoftLogin({
        role: "staff",
        ...(redirectUri && { redirect_uri: redirectUri }),
      });

      if (result.success && result.data) {
        const data = result.data as { auth_url: string };
        if (data.auth_url) {
          // Redirect to Microsoft login
          window.location.href = data.auth_url;
        } else {
          throw new Error("No auth URL received");
        }
      } else {
        throw new Error(result.message || "Failed to get Microsoft login URL");
      }
    } catch (error) {
      console.error("Microsoft login error:", error);
      toast.error("Failed to start Microsoft login. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <PortalCredentialsForm
      idPrefix="staff"
      submitLabel="Sign In as Staff"
      placeholderEmail="staff@example.com"
      role="staff"
    >
      <div className="space-y-3 border-t border-border pt-4">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleMicrosoftLogin}
          disabled={isLoading}
        >
          <Image
            src="/images/microsoft.svg"
            alt="Microsoft"
            width={20}
            height={20}
          />{" "}
          {isLoading ? "Processing..." : "Sign in with Microsoft (MSAL)"}
        </Button>
      </div>
    </PortalCredentialsForm>
  );
};

export default StaffSignInForm;
