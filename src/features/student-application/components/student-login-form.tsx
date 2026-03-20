"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import publicStudentApplicationService from "@/service/public-student-application.service";
import { siteRoutes } from "@/shared/constants/site-routes";
import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { toast } from "react-hot-toast";

const StudentLoginForm = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRequestedAccess, setHasRequestedAccess] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return;

    setIsSubmitting(true);

    try {
      const response =
        await publicStudentApplicationService.requestAccess(normalizedEmail);

      if (!response.success) {
        throw new Error(response.message || "Failed to request application access.");
      }

      setHasRequestedAccess(true);
      setEmail(normalizedEmail);
      toast.success("If an application link is available, it will be sent to the email provided.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to request application access.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center">
        <Card className="w-full">
          <CardHeader className="space-y-4 text-center">
            <Link href={siteRoutes.home} className="mx-auto block w-fit">
              <Image
                src="/images/logo.svg"
                alt="Churchill Institute of Higher Education"
                width={160}
                height={64}
                className="h-auto w-40"
                priority
              />
            </Link>
            <div className="space-y-2">
              <CardTitle className="text-3xl">Manage Application</CardTitle>
              <CardDescription>
                Enter your email to request access to your student application.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="student-email">Email</Label>
                <Input
                  id="student-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>

              {hasRequestedAccess ? (
                <div className="rounded-md border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                  If an application exists for this email, a secure link will be
                  sent shortly. Check your inbox and spam folder.
                </div>
              ) : null}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending Link..." : "Request Access"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentLoginForm;
