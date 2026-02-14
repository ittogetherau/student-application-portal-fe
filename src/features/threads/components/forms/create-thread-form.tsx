"use client";

import { useEffect } from "react";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { FormTextarea } from "@/components/forms/form-textarea";
import { Button } from "@/components/ui/button";
import {
  ThreadCreateValues,
  threadCreateSchema,
} from "@/shared/validation/application.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import {
  useApplicationThreadsQuery,
  useCreateThreadMutation,
} from "../../hooks/application-threads.hook";

interface CreateThreadFormProps {
  applicationId: string;
  onSuccess?: () => void;
  currentRole?: string;
  defaultTitle?: string;
}

const ISSUE_TYPES = [
  "Document Unclear",
  "Information incorrect",
  "Document Missing",
  "Information Appears fake",
  "Other",
];

const TARGET_SECTIONS = [
  "Personal Information",
  "Passport",
  "Academic Documents",
  "English Test",
  "Other",
];

const PRIORITIES = ["low", "medium", "high"] as const;

const CreateThreadForm = ({
  applicationId,
  onSuccess,
  currentRole,
  defaultTitle,
}: CreateThreadFormProps) => {
  const isStaff = currentRole === "staff";
  const form = useForm<ThreadCreateValues>({
    resolver: zodResolver(threadCreateSchema),
    defaultValues: {
      subject: defaultTitle ?? "",
      issue_type: undefined,
      target_section: undefined,
      priority: undefined,
      deadline: "",
      message: "",
    },
  });

  const { mutateAsync, isPending } = useCreateThreadMutation(applicationId);

  useApplicationThreadsQuery(applicationId);

  useEffect(() => {
    form.reset({
      subject: defaultTitle ?? "",
      issue_type: undefined,
      target_section: undefined,
      priority: undefined,
      deadline: "",
      message: "",
    });
  }, [defaultTitle, form]);

  const onSubmit = async (values: ThreadCreateValues) => {
    const normalizedValues = {
      ...values,
      issue_type: isStaff ? values.issue_type || undefined : undefined,
      target_section: isStaff ? values.target_section || undefined : undefined,
      priority: isStaff ? values.priority || undefined : undefined,
      deadline: isStaff ? values.deadline || undefined : undefined,
    };

    await mutateAsync(normalizedValues);
    form.reset({
      subject: defaultTitle ?? "",
      issue_type: undefined,
      target_section: undefined,
      priority: undefined,
      deadline: "",
      message: "",
    });
    onSuccess?.();
  };

  return (
    <FormProvider {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormInput name="subject" label="Subject" placeholder="Enter subject" />

        {isStaff ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                name="issue_type"
                label="Issue Type"
                options={ISSUE_TYPES.map((value) => ({
                  value,
                  label: value,
                }))}
                placeholder="Select issue type"
              />

              <FormSelect
                name="target_section"
                label="Target Section"
                options={TARGET_SECTIONS.map((value) => ({
                  value,
                  label: value,
                }))}
                placeholder="Select section"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                name="priority"
                label="Priority"
                options={PRIORITIES.map((value) => ({
                  value,
                  label: value.charAt(0).toUpperCase() + value.slice(1),
                }))}
                placeholder="Select priority"
              />

              <FormInput
                name="deadline"
                label="Deadline"
                type="date"
                placeholder="Select deadline"
              />
            </div>
          </>
        ) : null}

        <FormTextarea
          name="message"
          label="Message"
          placeholder="Provide details for this thread"
          rows={4}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Starting..." : "Start Conversation"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default CreateThreadForm;
