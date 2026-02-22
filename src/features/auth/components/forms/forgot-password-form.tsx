"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

import { FormInput } from "@/components/forms/form-input";
import { Button } from "@/components/ui/button";
import { useForgotPasswordMutation } from "@/hooks/useForgotPassword.hook";
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "@/features/auth/utils/validations/forgot-password";

const SUCCESS_MESSAGE =
  "If an account exists for that email, we’ll send a password reset link. The link expires in 30 minutes.";

const ForgotPasswordForm = () => {
  const forgotPasswordMutation = useForgotPasswordMutation();

  const methods = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    let toastId: string | undefined;

    try {
      toastId = toast.loading("Sending reset email...");
      await forgotPasswordMutation.mutateAsync(values);
      toast.success("Check your inbox for a reset link.", { id: toastId });
      methods.reset({ email: values.email });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to send reset email. Try again.";
      toast.error(message, { id: toastId });
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="space-y-6"
        noValidate
      >
        <FormInput
          name="email"
          label="Email"
          type="email"
          placeholder="user@example.com"
        />

        <Button
          type="submit"
          className="w-full"
          disabled={forgotPasswordMutation.isPending}
        >
          {forgotPasswordMutation.isPending ? "Sending..." : "Send reset link"}
        </Button>

        {forgotPasswordMutation.isSuccess && (
          <p className="text-center text-sm text-emerald-600">
            {SUCCESS_MESSAGE}
          </p>
        )}
      </form>
    </FormProvider>
  );
};

export default ForgotPasswordForm;
