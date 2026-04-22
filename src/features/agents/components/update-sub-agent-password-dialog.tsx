"use client";

import { FormInput } from "@/components/forms/form-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useResetSubAgentPasswordMutation } from "@/features/agents/hooks/useSubAgents.hook";
import {
  subAgentResetPasswordSchema,
  type SubAgentResetPasswordValues,
} from "@/features/agents/utils/sub-agent.validation";
import type { TeamMember } from "@/service/sub-agents.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

type UpdateSubAgentPasswordDialogProps = {
  agent: TeamMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function UpdateSubAgentPasswordDialog({
  agent,
  open,
  onOpenChange,
}: UpdateSubAgentPasswordDialogProps) {
  const resetPasswordMutation = useResetSubAgentPasswordMutation();

  const form = useForm<SubAgentResetPasswordValues>({
    resolver: zodResolver(subAgentResetPasswordSchema),
    defaultValues: {
      new_password: "",
    },
  });

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      form.reset({ new_password: "" });
    }

    onOpenChange(next);
  };

  const onSubmit = async (values: SubAgentResetPasswordValues) => {
    if (!agent) {
      toast.error("No sub-agent selected.");
      return;
    }

    try {
      const response = await resetPasswordMutation.mutateAsync({
        subAgentUserId: agent.user_id,
        payload: { new_password: values.new_password.trim() },
      });

      toast.success(response.message || "Sub-agent password updated.");
      handleOpenChange(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update sub-agent password.";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Update Sub-Agent Password</DialogTitle>
          <DialogDescription>
            Set a new password for this sub-agent account.
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(onSubmit)}
            key={agent?.user_id ?? "no-agent-password"}
          >
            <FormInput
              name="new_password"
              label="New Password"
              type="password"
              placeholder="Enter a new password"
              description="Minimum 8 characters, with at least one letter and one number."
              disabled={resetPasswordMutation.isPending}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={resetPasswordMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={resetPasswordMutation.isPending}>
                {resetPasswordMutation.isPending
                  ? "Updating..."
                  : "Update Password"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
