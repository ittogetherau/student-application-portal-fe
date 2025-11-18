import Link from "next/link";

import SignInForm from "@/components/forms/sign-in-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AdminLoginPage = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-lg bg-gray-900">
            <span className="text-3xl font-semibold text-white">C</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Churchill University
          </h1>
          <p className="text-sm text-gray-500">Administrator Access</p>
        </div>

        <SignInForm
          variant="admin"
          title="Admin Login"
          description="Manage the Churchill portal with your admin credentials."
          placeholderEmail="admin@churchill.com"
        />

        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900">
              Looking for the portal login?
            </CardTitle>
            <CardDescription>
              Switch to the agent or staff experience instead.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="link" className="text-gray-900">
              <Link href="/login">Go to Agent &amp; Staff Sign-In -&gt;</Link>
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Churchill University. All rights
          reserved.
        </p>
      </div>
    </main>
  );
};

export default AdminLoginPage;
