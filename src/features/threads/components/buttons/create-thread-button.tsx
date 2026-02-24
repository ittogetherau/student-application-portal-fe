"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CreateThreadForm from "@/features/threads/components/forms/create-thread-form";
import { cn } from "@/shared/lib/utils";
import { Plus, type LucideIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { ReactNode, useState } from "react";

type CreateThreadButtonProps = {
  applicationId: string;
  defaultTitle?: string;
  label?: ReactNode;
  icon?: LucideIcon | null;
  iconClassName?: string;
  dialogTitle?: ReactNode;
  showAllFields?: boolean | null;
  onSuccess?: () => void | Promise<void>;
} & Omit<
  React.ComponentProps<typeof Button>,
  "children" | "onClick" | "asChild"
> & {
    onClick?: React.ComponentProps<typeof Button>["onClick"];
  };

export default function CreateThreadButton({
  applicationId,
  defaultTitle,
  label = "Start Conversation",
  icon,
  iconClassName,
  dialogTitle = "Create Communication Thread",
  showAllFields = null,
  onSuccess,
  variant = "secondary",
  size = "sm",
  type = "button",
  className,
  onClick,
  ...buttonProps
}: CreateThreadButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: session } = useSession();
  const role = session?.user.role;
  const Icon = icon === undefined ? Plus : icon;

  const currentRole =
    showAllFields === true
      ? "staff"
      : showAllFields === false
        ? undefined
        : role;

  return (
    <>
      <Button
        {...buttonProps}
        type={type}
        variant={variant}
        size={size}
        className={cn("w-full sm:w-auto", className)}
        onClick={(e) => {
          onClick?.(e);
          if (e.defaultPrevented) return;
          setIsOpen(true);
        }}
      >
        {Icon ? <Icon className={iconClassName} /> : null}
        {label}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>
          <CreateThreadForm
            applicationId={applicationId}
            defaultTitle={defaultTitle}
            onSuccess={() => {
              setIsOpen(false);
              void onSuccess?.();
            }}
            currentRole={currentRole}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
