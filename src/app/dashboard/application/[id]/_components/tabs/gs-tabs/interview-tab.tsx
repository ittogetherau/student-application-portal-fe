"use client";

import { useState } from "react";
import {
  Clock,
  ExternalLink,
  Video,
  Loader2,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GSInterviewTabProps {
  applicationId?: string;
  isStaff?: boolean;
  isStageCompleted?: boolean;
  onStageComplete?: () => Promise<void>;
}

export default function GSInterviewTab({
  applicationId,
  isStaff = false,
  isStageCompleted = false,
  onStageComplete,
}: GSInterviewTabProps) {
  const [isSkipping, setIsSkipping] = useState(false);

  const handleSkipStage = async () => {
    if (isStageCompleted || isSkipping) return;

    setIsSkipping(true);
    try {
      // Call parent's stage completion handler
      await onStageComplete?.();
    } catch {
      // Error toast is shown by the parent hook
    } finally {
      setIsSkipping(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Interview Status</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-amber-600" />
          <div>
            <p className="text-sm font-medium">Awaiting completion</p>
            <p className="text-xs text-muted-foreground">
              Interview scheduled for Feb 10, 2026.
            </p>
          </div>
        </CardContent>
      </Card>
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

      {/* Continue Button - staff only, stage not completed */}
      {isStaff && !isStageCompleted && (
        <Button
          className="w-full gap-2"
          onClick={handleSkipStage}
          disabled={isSkipping}
        >
          Proceed to Assessment
          {isSkipping ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
        </Button>
      )}

      {/* Stage completed message */}
      {isStageCompleted && (
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
