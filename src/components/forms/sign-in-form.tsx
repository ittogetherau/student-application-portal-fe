"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { adminSignIn, publicSignIn } from "@/service/sign-in";
import type { UserRole } from "@/lib/auth";
import { signInSchema, type SignInValues } from "@/validation/sign-in";

type SignInFormVariant = "default" | "admin";

type SignInFormProps = {
  variant?: SignInFormVariant;
  title: string;
  description: string;
  placeholderEmail?: string;
  successMessage?: string;
  redirectTo?: string;
};

const SignInForm = ({
  variant = "default",
  title,
  description,
  placeholderEmail = "you@churchill.com",
  successMessage = "Sign-in request sent.",
  redirectTo = "/dashboard",
}: SignInFormProps) => {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    if (status === "success") {
      reset();
      const timer = setTimeout(() => {
        setStatus("idle");
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [status, reset]);

  const onSubmit = async (values: SignInValues) => {
    setStatus("loading");
    setError(null);

    try {
      if (variant === "admin") {
        await adminSignIn(values);
      } else {
        const fallbackRole: Exclude<UserRole, "admin"> = "agent";
        await publicSignIn(values, fallbackRole);
      }
      setStatus("success");
      toast.success(successMessage);
      router.push(redirectTo);
    } catch (err) {
      console.error(err);
      setStatus("error");
      setError("Unable to sign in. Try again.");
      toast.error("Unable to sign in. Try again.");
    }
  };

  const resetStatus = () => {
    if (status !== "idle") {
      setStatus("idle");
      setError(null);
    }
  };

  return (
    <Card className="w-full max-w-md border border-gray-200">
      <CardHeader className="text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
          Portal Access
        </p>
        <CardTitle className="text-4xl">{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder={placeholderEmail}
              {...register("email")}
              onFocus={resetStatus}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="********"
              {...register("password")}
              onFocus={resetStatus}
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <Button className="w-full" type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Signing in..." : "Sign in"}
          </Button>

          {status === "success" && (
            <p className="text-center text-sm text-emerald-600">
              {successMessage}
            </p>
          )}

          {status === "error" && error && (
            <p className="text-center text-sm text-red-600">{error}</p>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default SignInForm;

