import StaffSignInForm from "@/components/forms/auth/staff-sign-in-form";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const page = () => {
  return (
    <div className="size-full min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-2xl">
        <Link
          href="/login"
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

            <h3 className="text-3xl mt-6 text-foreground">
              Education Partner Login
            </h3>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access the portal{" "}
            </p>
          </div>

          <Card className="w-full bg-card">
            <CardContent className="mt-4">
              <StaffSignInForm />
            </CardContent>
            <CardFooter>
              <p className="text-muted-foreground text-xs text-center mx-auto">
                For security purposes, please do not share your login
                credentials
              </p>
            </CardFooter>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Having trouble logging in?{" "}
              <a
                href="mailto:myit@churchill.edu.au"
                className="text-primary hover:text-primary/90 underline"
              >
                Contact IT Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
