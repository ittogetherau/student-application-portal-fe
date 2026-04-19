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
import { useUpdateSubAgentCredentialsMutation } from "@/features/agents/hooks/useSubAgents.hook";
import {
  subAgentCredentialsSchema,
  type SubAgentCredentialsValues,
} from "@/features/agents/utils/sub-agent.validation";
import type { TeamMember } from "@/service/sub-agents.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

type UpdateSubAgentCredentialsDialogProps = {
  agent: TeamMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function UpdateSubAgentCredentialsDialog({
  agent,
  open,
  onOpenChange,
}: UpdateSubAgentCredentialsDialogProps) {
  const updateMutation = useUpdateSubAgentCredentialsMutation();

  const form = useForm<SubAgentCredentialsValues>({
    resolver: zodResolver(subAgentCredentialsSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleOpenChange = (next: boolean) => {
    if (next) {
      form.reset({
        email: agent?.email ?? "",
        password: "",
      });
    }

    if (!next) {
      form.reset({
        email: "",
        password: "",
      });
    }

    onOpenChange(next);
  };

  const onSubmit = async (values: SubAgentCredentialsValues) => {
    if (!agent) {
      toast.error("No sub-agent selected.");
      return;
    }

    const trimmedPassword = values.password?.trim() ?? "";

    try {
      const response = await updateMutation.mutateAsync({
        subAgentUserId: agent.user_id,
        payload: {
          email: values.email.trim(),
          ...(trimmedPassword ? { password: trimmedPassword } : {}),
        },
      });

      toast.success(response.message || "Sub-agent credentials updated.");
      handleOpenChange(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update sub-agent credentials.";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Change Sub-Agent Credentials</DialogTitle>
          <DialogDescription>
            Update login email and optionally set a new password for this
            sub-agent account.
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(onSubmit)}
            key={agent?.user_id ?? "no-agent"}
          >
            <FormInput
              name="email"
              label="Email"
              type="email"
              placeholder="sub-agent@organization.com"
              disabled={updateMutation.isPending}
            />

            <FormInput
              name="password"
              label="New Password"
              type="password"
              placeholder="Leave blank to keep current password"
              description="Leave blank if you only want to update email."
              disabled={updateMutation.isPending}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Credentials"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
