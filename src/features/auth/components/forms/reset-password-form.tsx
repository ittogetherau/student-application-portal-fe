"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

import { FormInput } from "@/components/forms/form-input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useResetPasswordMutation } from "@/hooks/useResetPassword.hook";
import { siteRoutes } from "@/shared/constants/site-routes";
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/features/auth/utils/validations/reset-password";

type ResetPasswordFormProps = {
  token?: string | null;
};

const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetPasswordMutation = useResetPasswordMutation();

  const tokenFromQuery = searchParams.get("token");
  const resolvedToken = (token ?? tokenFromQuery)?.trim() ?? "";
  const hasToken = resolvedToken.length > 0;

  const methods = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ResetPasswordValues) => {
    let toastId: string | undefined;

    try {
      if (!hasToken) {
        toast.error("Reset token is missing. Request a new link.");
        return;
      }

      toastId = toast.loading("Resetting password...");
      await resetPasswordMutation.mutateAsync({
        token: resolvedToken,
        new_password: values.password,
      });
      toast.success("Password updated. You can sign in now.", { id: toastId });
      methods.reset();
      router.push(siteRoutes.auth.login);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to reset password. Try again.";
      toast.error(message, { id: toastId });
    }
  };

  if (!hasToken) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTitle>Invalid reset link</AlertTitle>
          <AlertDescription>
            The reset token is missing. Request a new password reset email.
          </AlertDescription>
        </Alert>
        <Button asChild className="w-full">
          <Link href={siteRoutes.auth.forgotPassword}>Request new link</Link>
        </Button>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="space-y-6"
        noValidate
      >
        <FormInput
          name="password"
          label="New password"
          type="password"
          placeholder="Create a new password"
        />

        <FormInput
          name="confirmPassword"
          label="Confirm password"
          type="password"
          placeholder="Repeat your new password"
        />

        <Button
          type="submit"
          className="w-full"
          disabled={resetPasswordMutation.isPending}
        >
          {resetPasswordMutation.isPending ? "Resetting..." : "Reset password"}
        </Button>
      </form>
    </FormProvider>
  );
};

export default ResetPasswordForm;
