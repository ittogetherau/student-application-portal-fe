"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/forms/form-input";
import { FormSelect } from "@/components/ui/forms/form-select";
import { FormTextarea } from "@/components/ui/forms/form-textarea";
import {
  ThreadCreateValues,
  threadCreateSchema,
} from "@/validation/application.validation";
import {
  useCreateThreadMutation,
  useApplicationThreadsQuery,
} from "@/hooks/application-threads.hook";

interface CreateThreadFormProps {
  applicationId: string;
  onSuccess?: () => void;
}

const ISSUE_TYPES = [
  "Select",
  "Document Unclear",
  "Information incorrect",
  "Document Missing",
  "Information Appears fake",
  "Other",
];

const TARGET_SECTIONS = [
  "Select",
  "Personal Information",
  "Passport",
  "Academic Documents",
  "English Test",
  "Other",
];

const PRIORITIES: ThreadCreateValues["priority"][] = ["low", "medium", "high"];

export function CreateThreadForm({
  applicationId,
  onSuccess,
}: CreateThreadFormProps) {
  const form = useForm<ThreadCreateValues>({
    resolver: zodResolver(threadCreateSchema),
    defaultValues: {
      subject: "",
      issue_type: ISSUE_TYPES[0],
      target_section: TARGET_SECTIONS[0],
      priority: "low",
      deadline: undefined,
      message: "",
    },
  });

  const { mutateAsync, isPending } = useCreateThreadMutation(applicationId);

  useApplicationThreadsQuery(applicationId);

  const onSubmit = async (values: ThreadCreateValues) => {
    await mutateAsync(values);
    form.reset({
      subject: "",
      issue_type: ISSUE_TYPES[0],
      target_section: TARGET_SECTIONS[0],
      priority: "low",
      deadline: undefined,
      message: "",
    });
    onSuccess?.();
  };

  return (
    <FormProvider {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormInput name="subject" label="Subject" placeholder="Enter subject" />

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

        <FormTextarea
          name="message"
          label="Message"
          placeholder="Provide details for this thread"
          rows={4}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating..." : "Create Thread"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

export default CreateThreadForm;
