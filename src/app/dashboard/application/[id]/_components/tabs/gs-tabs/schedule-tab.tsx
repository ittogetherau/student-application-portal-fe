"use client";

import { useState } from "react";
import { Calendar, Loader2, SkipForward, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import gsMeetingsService from "@/service/gs-meetings.service";

interface GSScheduleTabProps {
  applicationId?: string;
  isStaff?: boolean;
  isStageCompleted?: boolean;
  onStageComplete?: () => Promise<void>;
}

// Helper to get default date (7 days from now) in datetime-local format
const getDefaultScheduledDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  date.setHours(10, 30, 0, 0);
  // Format: YYYY-MM-DDTHH:MM
  return date.toISOString().slice(0, 16);
};

export default function GSScheduleTab({
  applicationId,
  isStaff = false,
  isStageCompleted = false,
  onStageComplete,
}: GSScheduleTabProps) {
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState(getDefaultScheduledDate);
  const [meetingTitle, setMeetingTitle] = useState("GS Assessment Interview");
  const { data: session } = useSession();

  const handleScheduleInterview = async () => {
    if (isStageCompleted || !applicationId) return;

    setIsScheduling(true);
    try {
      // Schedule a meeting using the selected date/time
      const scheduledStart = new Date(scheduledDateTime);

      const scheduledEnd = new Date(scheduledStart);
      scheduledEnd.setMinutes(scheduledEnd.getMinutes() + 30); // 30 minute duration

      try {
        const meetingPayload: Record<string, unknown> = {
          application_id: applicationId,
          title: meetingTitle,
          scheduled_start: scheduledStart.toISOString(),
          scheduled_end: scheduledEnd.toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };

        // Pass staff_id if user is staff
        if (isStaff && session?.user?.id) {
          meetingPayload.staff_id = session.user.id;
        }

        const meetingResponse = await gsMeetingsService.scheduleMeeting(
          meetingPayload as Parameters<
            typeof gsMeetingsService.scheduleMeeting
          >[0],
        );

        if (!meetingResponse.success) {
          console.warn("Meeting scheduling failed:", meetingResponse.message);
        }
      } catch (meetingError) {
        // Log but don't block stage completion if meeting fails
        console.warn("Meeting scheduling failed:", meetingError);
      }

      // Call parent's stage completion handler
      await onStageComplete?.();
      toast.success("Interview scheduled. Proceeding to Interview stage.");
    } catch {
      // Error toast is shown by the hook
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Interview Scheduling</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Meeting window</p>
                <p className="text-xs text-muted-foreground">
                  Schedule a video interview with the student.
                </p>
              </div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium">Meeting title</label>
              <Input
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                disabled={isStageCompleted || isScheduling}
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium">Date and time</label>
              <Input
                type="datetime-local"
                value={scheduledDateTime}
                onChange={(e) => setScheduledDateTime(e.target.value)}
                disabled={isStageCompleted || isScheduling}
                className="text-sm"
              />
            </div>
          </div>
          {isStaff && !isStageCompleted && (
            <Button
              className="gap-2"
              onClick={handleScheduleInterview}
              disabled={isScheduling}
            >
              {isScheduling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Calendar className="h-4 w-4" />
              )}
              Schedule Interview
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Skip Button - staff only, stage not completed */}
      {isStaff && !isStageCompleted && (
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={handleScheduleInterview}
          disabled={isScheduling}
        >
          {isScheduling ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SkipForward className="h-4 w-4" />
          )}
          Skip to Assessment
        </Button>
      )}

      {/* Stage completed message */}
      {isStageCompleted && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-sm font-medium">
            Schedule stage completed. Proceed to Interview.
          </span>
        </div>
      )}
    </div>
  );
}
