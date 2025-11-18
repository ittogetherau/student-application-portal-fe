"use client";

import { useCallback, type MouseEventHandler } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

import { Button, type ButtonProps } from "@/components/ui/button";
import { clearBrowserAuthSession } from "@/lib/auth";

export const useLogout = (redirectPath = "/dashboard") => {
  const router = useRouter();

  return useCallback(() => {
    clearBrowserAuthSession();
    toast.success("Signed out");
    router.push(redirectPath);
  }, [redirectPath, router]);
};

type LogoutButtonProps = ButtonProps & {
  redirectPath?: string;
};

const LogoutButton = ({
  redirectPath = "/dashboard",
  className,
  variant = "outline",
  size = "sm",
  children = "Logout",
  onClick,
  ...buttonProps
}: LogoutButtonProps) => {
  const logout = useLogout(redirectPath);

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    logout();
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={className}
      {...buttonProps}
    >
      {children}
    </Button>
  );
};

export default LogoutButton;
