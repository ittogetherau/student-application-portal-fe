"use client";

import { useState } from "react";
import { Calendar, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getTodayDateInputValue } from "@/shared/validation/date-input";
import { useScheduleGsMeetingMutation } from "@/features/gs/hooks/gs-meetings.hook";
import { useRoleFlags } from "@/shared/hooks/use-role-flags";

interface GSScheduleTabProps {
  applicationId?: string;
  isStageCompleted?: boolean;
  onStageComplete?: () => Promise<void>;
}

const getDefaultScheduledDateParts = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  date.setHours(10, 30, 0, 0);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`,
  };
};

const getLocalDateFromParts = (datePart: string, timePart: string) => {
  const [year, month, day] = datePart.split("-").map((value) => Number(value));
  const [hours, minutes] = timePart.split(":").map((value) => Number(value));

  return new Date(year, month - 1, day, hours, minutes, 0, 0);
};

const toIsoWithLocalOffset = (date: Date) => {
  const pad = (value: number) => String(Math.trunc(value)).padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  const offsetMinutesTotal = -date.getTimezoneOffset();
  const sign = offsetMinutesTotal >= 0 ? "+" : "-";
  const offsetAbs = Math.abs(offsetMinutesTotal);
  const offsetHours = pad(Math.floor(offsetAbs / 60));
  const offsetMinutes = pad(offsetAbs % 60);

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offsetHours}:${offsetMinutes}`;
};

export default function GSScheduleTab({
  applicationId,
  isStageCompleted = false,
  onStageComplete,
}: GSScheduleTabProps) {
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(
    () => getDefaultScheduledDateParts().date,
  );
  const [scheduledTime, setScheduledTime] = useState(
    () => getDefaultScheduledDateParts().time,
  );
  const [meetingTitle, setMeetingTitle] = useState("GS Assessment Interview");
  const { data: session } = useSession();
  const { isStaffOrAdmin: isStaff } = useRoleFlags();
  const todayForInput = getTodayDateInputValue();
  const scheduleMeeting = useScheduleGsMeetingMutation(applicationId);

  const handleScheduleInterview = async () => {
    if (isStageCompleted || !applicationId || scheduleMeeting.isPending) return;

    setIsScheduling(true);
    try {
      const datePart = scheduledDate.trim();
      const timePart = scheduledTime.trim();
      if (datePart === "" || timePart === "") {
        toast.error("Please select both a date and time for the interview.");
        return;
      }

      const scheduledStart = getLocalDateFromParts(datePart, timePart);
      if (Number.isNaN(scheduledStart.getTime())) {
        toast.error("Please select a valid date and time for the interview.");
        return;
      }

      if (scheduledStart.getTime() < Date.now()) {
        toast.error("Interview date/time cannot be in the past.");
        return;
      }

      const scheduledEnd = new Date(scheduledStart);
      scheduledEnd.setMinutes(scheduledEnd.getMinutes() + 30); // 30 minute duration

      try {
        const meetingPayload: Record<string, unknown> = {
          application_id: applicationId,
          title: meetingTitle,
          scheduled_start: toIsoWithLocalOffset(scheduledStart),
          scheduled_end: toIsoWithLocalOffset(scheduledEnd),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };

        // Pass staff_id if user is staff
        if (isStaff && session?.user?.id) {
          meetingPayload.staff_id = session.user.id;
        }

        const meetingResponse = await scheduleMeeting.mutateAsync(
          meetingPayload as Parameters<
            typeof scheduleMeeting.mutateAsync
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

  //  {}

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Interview Scheduling</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isStaff ? (
            <>
              {isStageCompleted ? (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    Schedule stage completed.
                  </span>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        Awaiting interview scheduling
                      </p>
                      <p className="text-xs text-muted-foreground">
                        A Churchill representative will schedule your interview.
                        You&apos;ll be notified by email once it&apos;s
                        scheduled and when there are updates.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
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
                  <label className="text-xs font-medium">Date</label>
                  <Input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    disabled={isStageCompleted || isScheduling}
                    min={todayForInput}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Time</label>
                  <Input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    disabled={isStageCompleted || isScheduling}
                    className="text-sm"
                  />
                </div>
              </div>
              {!isStageCompleted && (
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
            </>
          )}
        </CardContent>
      </Card>

      {/* Skip Button - staff only, stage not completed */}
      {/* {isStaff && !isStageCompleted && (
        <Button variant="outline" className="w-full gap-2">
          <SkipForward className="h-4 w-4" />
          Proceed to Assessment
        </Button>
      )} */}

      {/* Stage completed message */}
    </div>
  );
}
