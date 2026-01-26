"use client";

import Link from "next/link";
import { CheckCircle2, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type GSAssessmentTabProps = {
  trackingCode?: string | null;
};

export default function GSAssessmentTab({
  trackingCode,
}: GSAssessmentTabProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Final Staff Assessment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <p className="font-medium">Checklist</p>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              All documents verified
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Declarations reviewed
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Interview notes captured
            </li>
          </ul>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button className="gap-2" disabled>
            <CheckCircle2 className="h-4 w-4" />
            Approve
          </Button>
          <Button variant="outline" className="gap-2" disabled>
            <CheckCircle2 className="h-4 w-4" />
            Request Review
          </Button>
          {trackingCode && (
            <Button asChild variant="outline" className="gap-2">
              <Link href={`/track/gs-form/${trackingCode}`}>
                <FileText className="h-4 w-4" />
                View Declaration
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
