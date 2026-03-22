"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import MicrosoftOAuthButton from "@/features/auth/components/microsoft-oauth-button";
import { siteRoutes } from "@/shared/constants/site-routes";
import { ArrowRight, FileText, Search, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import SignInLayout from "./sign-in-layout";

const Page = () => {
  return (
    <SignInLayout>
      <div className="px-4 space-y-6 max-w-xl w-full">
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

          <h3 className="text-3xl mt-6">
            Application for Admission Form and Portal
          </h3>
          <p className="text-sm text-muted-foreground">
            Welcome to Churchill Institute of Higher Education
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign in to continue</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={null}>
              <MicrosoftOAuthButton />
            </Suspense>

            <Link
              href={"/login/staff"}
              className="w-full mb-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl py-4 px-6 flex items-center justify-between transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/10 rounded-lg p-2">
                  <Users className="size-6" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Education Agent Login</div>
                  <div className="text-xs text-orange-100">
                    Churchill Institute Education Agent login.
                  </div>
                </div>
              </div>
              <ArrowRight className="size-5" />
            </Link>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted-foreground"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card text-muted-foreground">or</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={siteRoutes.track.root()}
                className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-orange-400 rounded-md px-3 py-2 flex items-center gap-2 transition-all duration-200"
              >
                <Search className="size-4 text-orange-500 shrink-0" />
                <span className="text-sm font-medium">
                  Track Your Application
                </span>
              </Link>
              <Link
                href={siteRoutes.student.root}
                className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-orange-400 rounded-md px-3 py-2 flex items-center gap-2 transition-all duration-200"
              >
                <FileText className="size-4 text-orange-500 shrink-0" />
                <span className="text-sm font-medium">
                  Create New Application
                </span>
              </Link>
            </div>
          </CardContent>

          <CardFooter>
            <p className="text-xs text-muted-foreground text-center mx-auto">
              Need help with login? Contact us at{" "}
              <a
                href="mailto:myit@churchill.edu.au"
                className="text-orange-600 hover:text-orange-700 underline"
              >
                myit@churchill.edu.au
              </a>
            </p>
          </CardFooter>
        </Card>

        <p className="text-sm text-muted-foreground mx-auto text-center">
          TEQSA Provider No PRV14305 | CRICOS: 04082E
        </p>
      </div>
    </SignInLayout>
  );
};

export default Page;
