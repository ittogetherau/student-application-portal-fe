"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, Search, Users } from "lucide-react";
import Image from "next/image";
import React, { Suspense } from "react";
import SignInLayout from "./_components/sign-in-layout";
import Link from "next/link";
import MicrosoftOAuthButton from "@/components/auth/microsoft-oauth-button";

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

          <h3 className="text-3xl mt-6">Application Portal</h3>
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
                  <div className="font-semibold">Education Partner Login</div>
                  <div className="text-xs text-orange-100">
                    Churchill Institute partners
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

            <Link
              href={"/track"}
              className="w-full bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-300 hover:border-orange-500 rounded-xl py-4 px-6 flex items-center justify-between transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 rounded-lg p-2">
                  <Search className="size-6 text-orange-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Track Application</div>
                  <div className="text-xs text-muted-foreground">
                    Check your application status
                  </div>
                </div>
              </div>
              <ArrowRight className="size-5 text-slate-400" />
            </Link>
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
