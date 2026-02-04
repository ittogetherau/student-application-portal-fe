import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GSFormClient } from "./gs-form-client";

type GSFormPageProps = {
  params: Promise<{ trackingId: string }>;
  searchParams: Promise<{ token?: string; id?: string }>;
};

export default async function GSFormPage({
  params,
  searchParams,
}: GSFormPageProps) {
  const { trackingId } = await params;
  const { token, id } = await searchParams;

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="border-b bg-background">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold">GS Declaration Form</h1>
            <p className="text-xs text-muted-foreground">
              Tracking ID: {trackingId}
            </p>
          </div>
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link href="/track">
              <ArrowLeft className="h-4 w-4" />
              Back to Tracking
            </Link>
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <Card className="mb-6">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
            <div>
              <p className="text-sm font-medium">Applicant</p>
              <p className="text-xs text-muted-foreground">Avery Patel</p>
            </div>
            <div>
              <p className="text-sm font-medium">Course</p>
              <p className="text-xs text-muted-foreground">
                Diploma of Business - Feb 2026
              </p>
            </div>
          </CardContent>
        </Card>

        <GSFormClient
          trackingId={trackingId}
          token={token}
          applicationId={id}
        />
      </div>
    </main>
  );
}
