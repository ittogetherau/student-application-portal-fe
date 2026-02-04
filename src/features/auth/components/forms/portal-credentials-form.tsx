"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserRole } from "@/shared/lib/auth";
import { siteRoutes } from "@/constants/site-routes";
import { publicSignIn } from "@/features/auth/components/utils/sign-in";
import {
  signInSchema,
  type SignInValues,
} from "@/features/auth/utils/validations/sign-in";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

type PortalCredentialsFormProps = {
  idPrefix: string;
  submitLabel: string;
  placeholderEmail: string;
  role: Exclude<UserRole, "admin">;
  children?: ReactNode;
};

const PortalCredentialsForm = ({
  idPrefix,
  submitLabel,
  placeholderEmail,
  role,
  children,
}: PortalCredentialsFormProps) => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  // const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

  const handleFormSubmit = async (values: SignInValues) => {
    let id;

    try {
      id = toast.loading(`Redirecting to dashboard.`);
      await publicSignIn(values, role);
      reset();
      const destination = siteRoutes.dashboard.root;
      toast.success("Login Successful", { id: id });

      router.push(destination);
    } catch {
      toast.error("Unable to sign in. Try again.", { id: id });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-4"
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-email`}>Email</Label>
        <Input
          id={`${idPrefix}-email`}
          type="email"
          placeholder={placeholderEmail}
          autoComplete="email"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-password`}>Password</Label>
        <Input
          id={`${idPrefix}-password`}
          type="password"
          placeholder="********"
          autoComplete="current-password"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full">
        {submitLabel}
      </Button>

      {children}
    </form>
  );
};

export default PortalCredentialsForm;
