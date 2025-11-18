"use client";

import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

import { Button, type ButtonProps } from "@/components/ui/button";
import { clearBrowserAuthSession } from "@/lib/auth";

type LogoutButtonProps = {
  redirectPath?: string;
} & ButtonProps;

const LogoutButton = ({
  redirectPath = "/dashboard",
  className,
  variant = "outline",
  size = "sm",
  children = "Logout",
  ...buttonProps
}: LogoutButtonProps) => {
  const router = useRouter();

  const handleLogout = () => {
    clearBrowserAuthSession();
    toast.success("Signed out");
    router.push(redirectPath);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      className={className}
      {...buttonProps}
    >
      {children}
    </Button>
  );
};

export default LogoutButton;
