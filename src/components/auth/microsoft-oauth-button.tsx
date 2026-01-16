"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

import authService from "@/service/auth.service";
import { cn } from "@/lib/utils";

interface MicrosoftOAuthButtonProps {
  className?: string;
  role?: string;
  label?: string;
  helperText?: string;
}

const MicrosoftOAuthButton = ({
  className,
  role = "staff",
  label = "Staff Login",
  helperText = "Sign in with Microsoft",
}: MicrosoftOAuthButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Handle OAuth errors returned to this page
    const error = searchParams.get("error");
    if (error) {
      const errorDesc = searchParams.get("error_description");
      toast.error(
        `Microsoft login error: ${errorDesc || error}`
      );
      // Clean up error params from URL
      const url = new URL(window.location.href);
      url.searchParams.delete("error");
      url.searchParams.delete("error_description");
      router.replace(url.pathname + url.search);
    }
  }, [searchParams, router]);

  const handleMicrosoftLogin = async () => {
    setIsLoading(true);
    try {
      // Use the auth callback route as the redirect URI
      const redirectUri =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : "";

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
        className
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
