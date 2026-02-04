"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Video,
  Loader2,
  SkipForward,
} from "lucide-react";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GSInterviewTabProps {
  isStageCompleted?: boolean;
  onStageComplete?: () => Promise<void>;
}

export default function GSInterviewTab({
  isStageCompleted = false,
  onStageComplete,
}: GSInterviewTabProps) {
  const { data: session } = useSession();
  const isStaff =
    session?.user.role === "staff" || Boolean(session?.user.staff_admin);

  const [isProceeding, setIsProceeding] = useState(false);

  const handleProceedToAssessment = async () => {
    if (isStageCompleted || isProceeding) return;

    setIsProceeding(true);
    try {
      await onStageComplete?.();
    } catch {
      // Error toast is shown by the parent hook
    } finally {
      setIsProceeding(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Interview Status</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <Clock
            className={`h-5 w-5 ${isStaff ? "text-amber-600" : "text-muted-foreground"}`}
          />
          <div>
            <p className="text-sm font-medium">
              {isStaff
                ? "Awaiting completion"
                : isStageCompleted
                  ? "Interview completed"
                  : "Awaiting interview scheduling"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isStaff ? (
                <>Interview scheduled for Feb 10, 2026.</>
              ) : isStageCompleted ? (
                <>
                  Your interview has been completed. You&apos;ll be notified by
                  email when there are updates or next steps.
                </>
              ) : (
                <>
                  A Churchill representative will schedule your interview.
                  You&apos;ll be notified by email once it&apos;s scheduled and
                  when there are updates.
                </>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {isStaff && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Interview Recording</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center">
              <Video className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Recording placeholder</p>
                <p className="text-xs text-muted-foreground">
                  Upload or link the interview recording here.
                </p>
              </div>
              <Button variant="outline" size="sm" className="gap-2" disabled>
                <ExternalLink className="h-4 w-4" />
                Open Recording
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Continue Button - staff only, stage not completed */}
      {isStaff && !isStageCompleted && (
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={handleProceedToAssessment}
          disabled={isProceeding}
        >
          {isProceeding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SkipForward className="h-4 w-4" />
          )}
          Proceed to Assessment
        </Button>
      )}

      {/* Stage completed message */}
      {isStaff && isStageCompleted && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-sm font-medium">
            Interview stage completed. Proceed to Assessment.
          </span>
        </div>
      )}
    </div>
  );
}
