import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

import ForgotPasswordForm from "@/features/auth/components/forms/forgot-password-form";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { siteRoutes } from "@/shared/constants/site-routes";

const ForgotPasswordPage = () => {
  return (
    <div className="size-full min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-2xl">
        <Link
          href={siteRoutes.auth.login}
          className="mb-6 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-5" />
          <span>Back to login options</span>
        </Link>

        <div className="flex flex-col items-center justify-center gap-6">
          <div className="mx-auto text-center flex flex-col gap-2">
            <div className="max-w-64 mx-auto ">
              <Image
                src="/images/logo.svg"
                alt="Churchill Institute of Higher Education"
                width={48}
                height={48}
                className="object-contain w-full h-full"
                priority
              />
            </div>

            <h3 className="text-3xl mt-6 text-foreground">Reset Password</h3>
            <p className="text-sm text-muted-foreground">
              Enter your email to receive a reset link (expires in 30 minutes).
            </p>
          </div>

          <Card className="w-full bg-card">
            <CardContent className="mt-4">
              <ForgotPasswordForm />
            </CardContent>
            <CardFooter>
              <p className="text-muted-foreground text-xs text-center mx-auto">
                For security purposes, we show the same success response even if
                the email doesn’t exist.
              </p>
            </CardFooter>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Didn’t receive an email? Check spam/junk or{" "}
              <a
                href="mailto:myit@churchill.edu.au"
                className="text-primary hover:text-primary/90 underline"
              >
                contact IT Support
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
