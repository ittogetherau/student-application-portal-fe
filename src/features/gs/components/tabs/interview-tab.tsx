"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Video,
  Loader2,
  SkipForward,
} from "lucide-react";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import gsMeetingsService, {
  type GsMeetingResponse,
} from "@/service/gs-meetings.service";

const getMeetingDateValue = (meeting: GsMeetingResponse) => {
  if (
    typeof meeting.scheduled_at === "string" &&
    meeting.scheduled_at.trim() !== ""
  ) {
    return meeting.scheduled_at;
  }

  const scheduledStart = meeting["scheduled_start"];
  if (typeof scheduledStart === "string" && scheduledStart.trim() !== "") {
    return scheduledStart;
  }

  return "";
};

const getMeetingTimestamp = (meeting: GsMeetingResponse) => {
  const rawDate = getMeetingDateValue(meeting);
  if (!rawDate) return Number.POSITIVE_INFINITY;

  const parsed = new Date(rawDate);
  return Number.isNaN(parsed.getTime())
    ? Number.POSITIVE_INFINITY
    : parsed.getTime();
};

const formatMeetingDateTime = (meeting: GsMeetingResponse) => {
  const rawDate = getMeetingDateValue(meeting);
  if (rawDate === "") return "Date not available";

  const parsedDate = new Date(rawDate);
  if (Number.isNaN(parsedDate.getTime())) return rawDate;

  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone:
        typeof meeting.timezone === "string" && meeting.timezone.trim() !== ""
          ? meeting.timezone
          : undefined,
    }).format(parsedDate);
  } catch {
    return parsedDate.toLocaleString();
  }
};

interface GSInterviewTabProps {
  applicationId?: string;
  isStageCompleted?: boolean;
  onStageComplete?: () => Promise<void>;
}

export default function GSInterviewTab({
  applicationId,
  isStageCompleted = false,
  onStageComplete,
}: GSInterviewTabProps) {
  const { data: session } = useSession();
  const isStaff =
    session?.user.role === "staff" || Boolean(session?.user.staff_admin);

  const [isProceeding, setIsProceeding] = useState(false);
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(false);
  const [meetingError, setMeetingError] = useState<string | null>(null);
  const [meetings, setMeetings] = useState<GsMeetingResponse[]>([]);

  useEffect(() => {
    let isCancelled = false;

    const loadMeetings = async () => {
      if (!applicationId) {
        setMeetings([]);
        setMeetingError(null);
        return;
      }

      setIsLoadingMeetings(true);
      setMeetingError(null);

      try {
        const response =
          await gsMeetingsService.listMeetingsForApplication(applicationId);

        if (isCancelled) return;

        if (!response.success) {
          setMeetings([]);
          setMeetingError(response.message || "Failed to fetch meetings.");
          return;
        }

        const meetingList = Array.isArray(response.data) ? response.data : [];
        const sortedMeetings = [...meetingList].sort(
          (a, b) => getMeetingTimestamp(a) - getMeetingTimestamp(b),
        );
        setMeetings(sortedMeetings);
      } catch {
        if (!isCancelled) {
          setMeetings([]);
          setMeetingError("Failed to fetch meetings.");
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingMeetings(false);
        }
      }
    };

    void loadMeetings();

    return () => {
      isCancelled = true;
    };
  }, [applicationId]);

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
          <CardTitle className="text-base">Application Meetings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoadingMeetings ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading meetings...
            </div>
          ) : meetingError ? (
            <p className="text-sm text-destructive">{meetingError}</p>
          ) : meetings.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No meetings found for this application.
            </p>
          ) : (
            <div className="space-y-3">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <p className="text-sm font-medium truncate">
                        {formatMeetingDateTime(meeting)}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground capitalize">
                      {meeting.status ?? "scheduled"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {typeof meeting.meeting_link === "string" &&
                      meeting.meeting_link.trim() !== "" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() =>
                            window.open(
                              meeting.meeting_link,
                              "_blank",
                              "noopener,noreferrer",
                            )
                          }
                        >
                          <ExternalLink className="h-4 w-4" />
                          Open Meeting
                        </Button>
                      )}

                    {isStaff &&
                      typeof meeting.recording_url === "string" &&
                      meeting.recording_url.trim() !== "" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() =>
                            window.open(
                              meeting.recording_url,
                              "_blank",
                              "noopener,noreferrer",
                            )
                          }
                        >
                          <Video className="h-4 w-4" />
                          Open Recording
                        </Button>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
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
