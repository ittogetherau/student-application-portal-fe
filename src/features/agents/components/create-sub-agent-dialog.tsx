"use client";

import { FormInput } from "@/components/forms/form-input";
import { FormTextarea } from "@/components/forms/form-textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateSubAgentMutation } from "@/features/agents/hooks/useSubAgents.hook";
import {
  subAgentCreateSchema,
  type SubAgentCreateValues,
} from "@/features/agents/utils/sub-agent.validation";
import type { SubAgentCreateResponse } from "@/service/sub-agents.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Mail, Phone, Plus, ShieldPlus } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

type CreateSubAgentDialogProps = {
  onCreated?: (params: {
    values: SubAgentCreateValues;
    result?: SubAgentCreateResponse;
  }) => void;
};

const stepItems = [
  { id: 1, title: "Identity", icon: Mail },
  { id: 2, title: "Organization", icon: Building2 },
] as const;

const getStepFields = (step: number) => {
  if (step === 1) {
    return ["email", "password"] as const;
  }
  return ["organization_name", "phone", "address"] as const;
};

export default function CreateSubAgentDialog({
  onCreated,
}: CreateSubAgentDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const createMutation = useCreateSubAgentMutation();

  const form = useForm<SubAgentCreateValues>({
    resolver: zodResolver(subAgentCreateSchema),
    defaultValues: {
      email: "",
      password: "",
      organization_name: "",
      phone: "",
      address: "",
    },
  });

  const resetFlow = () => {
    setStep(1);
    form.reset();
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      resetFlow();
    }
  };

  const onSubmit = async (values: SubAgentCreateValues) => {
    try {
      const response = await createMutation.mutateAsync(values);
      toast.success(response.message || "Sub-agent created successfully.");
      onCreated?.({ values, result: response.data });
      setOpen(false);
      resetFlow();
    } catch (error: any) {
      toast.error(error.message || "Failed to create sub-agent.");
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      const isValid = await form.trigger(["email", "password"]);
      if (isValid) {
        setStep(2);
      }
    } else {
      await form.handleSubmit(onSubmit, (error) => {
        const firstError = Object.values(error)[0];
        if (firstError?.message) {
          toast.error(String(firstError.message));
        }
      })(e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          New Sub-Agent
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldPlus className="h-5 w-5" />
            Create Sub-Agent
          </DialogTitle>
          <DialogDescription>
            Add a sub-agent under your organization and assign them a dedicated
            login.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-2">
            {stepItems.map((item) => {
              const isActive = step === item.id;
              const isDone = step > item.id;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  className={[
                    "rounded-lg border px-3 py-2 text-sm",
                    isActive
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{item.title}</span>
                    {isDone ? (
                      <span className="ml-auto text-xs text-emerald-600">
                        Done
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          <FormProvider {...form}>
            <form className="space-y-4" onSubmit={handleFormSubmit}>
              <div className={step === 1 ? "grid gap-4" : "hidden"}>
                <FormInput
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="sub-agent@organization.com"
                />

                <FormInput
                  name="password"
                  label="Password"
                  type="password"
                  placeholder="Create a secure password"
                  description="Minimum 8 characters, with at least one letter and one number."
                />
              </div>

              <div className={step === 2 ? "grid gap-4" : "hidden"}>
                <FormInput
                  name="organization_name"
                  label="Organization Name"
                  placeholder="Organization or branch name"
                />

                <FormInput
                  name="phone"
                  label="Phone"
                  type="tel"
                  placeholder="+61 400 000 000"
                />

                <FormTextarea
                  name="address"
                  label="Address"
                  placeholder="Street, city, state, postcode"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-2">
                {step === 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                  >
                    Cancel
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                )}

                {step === 1 ? (
                  <Button type="submit">Continue</Button>
                ) : (
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending
                      ? "Creating..."
                      : "Create Sub-Agent"}
                  </Button>
                )}
              </div>
            </form>
          </FormProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}
