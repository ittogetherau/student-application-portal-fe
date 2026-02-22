import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import ResetPasswordForm from "@/features/auth/components/forms/reset-password-form";
import { siteRoutes } from "@/shared/constants/site-routes";

type ResetPasswordPageProps = {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
};

const ResetPasswordPage = async ({ searchParams }: ResetPasswordPageProps) => {
  const params = (await searchParams) ?? {};
  const tokenParam = params.token;
  const token = Array.isArray(tokenParam)
    ? tokenParam[0]
    : (tokenParam ?? null);

  return (
    <div className="size-full min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-2xl">
        <Link
          href={siteRoutes.auth.login}
          className="mb-6 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-5" />
          <span>Back to login</span>
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

            <h3 className="text-3xl mt-6 text-foreground">
              Set a new password
            </h3>
            <p className="text-sm text-muted-foreground">
              Enter a new password for your account.
            </p>
          </div>

          <Card className="w-full bg-card">
            <CardContent className="mt-4">
              <ResetPasswordForm token={token} />
            </CardContent>
            <CardFooter>
              <p className="text-muted-foreground text-xs text-center mx-auto">
                Reset links expire after 30 minutes.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
