"use client";

import { FormInput } from "@/components/forms/form-input";
import { FormTextarea } from "@/components/forms/form-textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpdateSubAgentProfileMutation } from "@/features/agents/hooks/useSubAgents.hook";
import {
  subAgentProfileSchema,
  type SubAgentProfileValues,
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
  const updateProfileMutation = useUpdateSubAgentProfileMutation();

  const form = useForm<SubAgentProfileValues>({
    resolver: zodResolver(subAgentProfileSchema),
    defaultValues: {
      name: "",
      organization_name: "",
      phone: "",
      address: "",
    },
  });

  const isSaving = updateProfileMutation.isPending;

  const handleOpenChange = (next: boolean) => {
    if (next) {
      form.reset({
        name: (agent?.name ?? agent?.agency_name ?? "").trim(),
        organization_name: (agent?.agency_name ?? "").trim(),
        phone: (agent?.phone ?? "").trim(),
        address: (agent?.address ?? "").trim(),
      });
    }

    if (!next) {
      form.reset({
        name: "",
        organization_name: "",
        phone: "",
        address: "",
      });
    }

    onOpenChange(next);
  };

  const onSubmit = async (values: SubAgentProfileValues) => {
    if (!agent) {
      toast.error("No sub-agent selected.");
      return;
    }

    try {
      const response = await updateProfileMutation.mutateAsync({
        subAgentUserId: agent.user_id,
        payload: {
          name: values.name.trim(),
          organization_name: values.organization_name.trim(),
          phone: values.phone.trim(),
          address: values.address.trim(),
        },
      });

      toast.success(response.message || "Sub-agent profile updated.");
      handleOpenChange(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update sub-agent profile.";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Update Sub-Agent Profile</DialogTitle>
          <DialogDescription>
            Update sub-agent profile information.
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(onSubmit)}
            key={agent?.user_id ?? "no-agent"}
          >
            <FormInput
              name="name"
              label="Name"
              placeholder="Sub-agent name"
              disabled={isSaving}
            />

            <FormInput
              name="organization_name"
              label="Organization Name"
              placeholder="Organization or branch name"
              disabled={isSaving}
            />

            <FormInput
              name="phone"
              label="Phone"
              type="tel"
              placeholder="+61 400 000 000"
              disabled={isSaving}
            />

            <FormTextarea
              name="address"
              label="Address"
              placeholder="Street, city, state, postcode"
              rows={3}
              disabled={isSaving}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Update Profile"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
