"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Copy,
  ExternalLink,
  Link2,
  Loader2,
  SkipForward,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import gsMeetingsService, {
  type GsMeetingResponse,
} from "@/service/gs-meetings.service";
import {
  useGsMeetingQuery,
  useGsMeetingsForApplicationQuery,
} from "@/features/gs/hooks/gs-meetings.hook";
import { formatUtcToFriendlyLocal } from "@/shared/lib/format-utc-to-local";

const resolveMeetingTimezone = (meeting: GsMeetingResponse) => {
  const candidates = [
    meeting.timezone,
    meeting["time_zone"],
    meeting["timeZone"],
  ].filter(
    (value): value is string =>
      typeof value === "string" && value.trim() !== "",
  );

  for (const timezone of candidates) {
    try {
      new Intl.DateTimeFormat(undefined, { timeZone: timezone });
      return timezone;
    } catch {
      // ignore invalid timezones
    }
  }

  return undefined;
};

const resolvePublicRecordingUrl = (rawUrl: string) => {
  if (!rawUrl) return rawUrl;

  try {
    return new URL(rawUrl).toString();
  } catch {
    // ignore invalid absolute URLs
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (typeof apiBaseUrl === "string" && apiBaseUrl.trim() !== "") {
    try {
      return new URL(rawUrl, apiBaseUrl).toString();
    } catch {
      // ignore invalid URLs
    }
  }

  if (typeof window !== "undefined") {
    try {
      return new URL(rawUrl, window.location.origin).toString();
    } catch {
      // ignore invalid URLs
    }
  }

  return rawUrl;
};

const getMeetingStartValue = (meeting: GsMeetingResponse) => {
  if (
    typeof meeting.scheduled_start === "string" &&
    meeting.scheduled_start.trim() !== ""
  ) {
    return meeting.scheduled_start;
  }

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

const getMeetingEndValue = (meeting: GsMeetingResponse) => {
  if (
    typeof meeting.scheduled_end === "string" &&
    meeting.scheduled_end.trim() !== ""
  ) {
    return meeting.scheduled_end;
  }

  const scheduledEnd = meeting["scheduled_end"];
  if (typeof scheduledEnd === "string" && scheduledEnd.trim() !== "") {
    return scheduledEnd;
  }

  return "";
};

const getMeetingTimestamp = (meeting: GsMeetingResponse) => {
  const rawStart = getMeetingStartValue(meeting);
  if (!rawStart) return Number.POSITIVE_INFINITY;

  const parsed = new Date(rawStart);
  return Number.isNaN(parsed.getTime())
    ? Number.POSITIVE_INFINITY
    : parsed.getTime();
};

const formatMeetingRange = (meeting: GsMeetingResponse) => {
  const rawStart = getMeetingStartValue(meeting);
  const rawEnd = getMeetingEndValue(meeting);

  if (!rawStart) return "Date not available";

  const formattedStart = formatUtcToFriendlyLocal(rawStart, { showTime: true });
  if (!formattedStart) return "Date not available";

  if (!rawEnd) return formattedStart;
  const formattedEnd = formatUtcToFriendlyLocal(rawEnd, { showTime: true });
  if (!formattedEnd) return formattedStart;

  const startParts = formattedStart.split(", ");
  const endParts = formattedEnd.split(", ");
  if (
    startParts.length === 2 &&
    endParts.length === 2 &&
    startParts[0] === endParts[0]
  ) {
    return `${startParts[0]}, ${startParts[1]} - ${endParts[1]}`;
  }

  return `${formattedStart} - ${formattedEnd}`;
};

const getMeetingJoinUrl = (meeting: GsMeetingResponse) => {
  const candidates = [
    meeting.join_url,
    meeting.meeting_link,
    meeting["joinUrl"],
    meeting["meetingLink"],
    meeting["join_url"],
    meeting["meeting_link"],
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim() !== "") {
      return candidate.trim();
    }
  }

  return undefined;
};

const getMeetingStatusLabel = (meeting: GsMeetingResponse) => {
  if (meeting.is_cancelled) return "cancelled";
  if (typeof meeting.status === "string" && meeting.status.trim() !== "") {
    return meeting.status;
  }
  return "scheduled";
};

const getMeetingNotes = (meeting: GsMeetingResponse) => {
  const candidates = [
    meeting.meeting_notes,
    meeting.notes,
    meeting["meeting_notes"],
  ];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim() !== "")
      return candidate.trim();
  }
  return undefined;
};

interface GSInterviewTabProps {
  applicationId?: string;
  isStageCompleted?: boolean;
  onStageComplete?: () => Promise<void>;
}

type RecordingLinkState = {
  status: "idle" | "loading" | "ready" | "unavailable" | "error";
  publicUrl?: string;
  expiresAt?: string;
  error?: string;
};

const MeetingCard = ({
  meetingSummary,
  isStaff,
  recordingState,
  onCopyPublicUrl,
  onWatchRecording,
  onRetryRecording,
}: {
  meetingSummary: GsMeetingResponse;
  isStaff: boolean;
  recordingState?: RecordingLinkState;
  onCopyPublicUrl: (meetingId: string) => void;
  onWatchRecording: (meetingId: string) => void;
  onRetryRecording: (meetingId: string) => void;
}) => {
  const meetingQuery = useGsMeetingQuery(meetingSummary.id);
  const meeting = meetingQuery.data?.data ?? meetingSummary;

  const joinUrl = getMeetingJoinUrl(meeting);
  const status = getMeetingStatusLabel(meeting);
  const notes = getMeetingNotes(meeting);
  const timezone = resolveMeetingTimezone(meeting);

  return (
    <div className="rounded-lg border p-3 space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-sm font-medium truncate">
            {formatMeetingRange(meeting)}
          </p>
        </div>
        <p className="text-xs text-muted-foreground capitalize">{status}</p>
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        {typeof meeting.organizer_email === "string" &&
          meeting.organizer_email.trim() !== "" && (
            <p className="truncate">Organizer: {meeting.organizer_email}</p>
          )}
        {timezone && <p className="truncate">Timezone: {timezone}</p>}
        {notes && <p className="line-clamp-2">Notes: {notes}</p>}
        {meetingQuery.isFetching && (
          <p className="text-xs text-muted-foreground">Loading details...</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {joinUrl && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              window.open(joinUrl, "_blank", "noopener,noreferrer");
            }}
          >
            <ExternalLink className="h-4 w-4" />
            Open Meeting
          </Button>
        )}

        {isStaff && recordingState?.status === "ready" ? (
          <>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              type="button"
              onClick={() => onWatchRecording(meetingSummary.id)}
            >
              <Link2 className="h-4 w-4" />
              Watch Recording
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              type="button"
              onClick={() => onCopyPublicUrl(meetingSummary.id)}
            >
              <Copy className="h-4 w-4" />
              Copy Link
            </Button>
          </>
        ) : null}

        {isStaff && recordingState?.status === "loading" ? (
          <Button variant="outline" size="sm" className="gap-2" disabled>
            <Loader2 className="h-4 w-4 animate-spin" />
            Fetching recording...
          </Button>
        ) : null}

        {isStaff && recordingState?.status === "idle" ? (
          <Button variant="outline" size="sm" className="gap-2" disabled>
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking recording...
          </Button>
        ) : null}

        {isStaff && recordingState?.status === "error" ? (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            type="button"
            onClick={() => onRetryRecording(meetingSummary.id)}
          >
            Retry Recording
          </Button>
        ) : null}
      </div>

      {isStaff && recordingState?.status === "unavailable" ? (
        <p className="text-xs text-muted-foreground">
          Recording not available.
        </p>
      ) : null}
      {isStaff && recordingState?.status === "error" && recordingState.error ? (
        <p className="text-xs text-destructive">{recordingState.error}</p>
      ) : null}
    </div>
  );
};

export default function GSInterviewTab({
  applicationId,
  isStageCompleted = false,
  onStageComplete,
}: GSInterviewTabProps) {
  const { data: session } = useSession();
  const isStaff =
    session?.user.role === "staff" || Boolean(session?.user.staff_admin);

  const [isProceeding, setIsProceeding] = useState(false);
  const [recordingLinks, setRecordingLinks] = useState<
    Record<string, RecordingLinkState>
  >({});
  const [recordingDialogOpen, setRecordingDialogOpen] = useState(false);
  const [activeRecordingUrl, setActiveRecordingUrl] = useState<string | null>(
    null,
  );
  const [activeRecordingExpiresAt, setActiveRecordingExpiresAt] = useState<
    string | null
  >(null);

  const meetingsQuery = useGsMeetingsForApplicationQuery(applicationId);
  const meetings = useMemo(() => {
    const list = meetingsQuery.data?.data ?? [];
    return [...list].sort(
      (a, b) => getMeetingTimestamp(a) - getMeetingTimestamp(b),
    );
  }, [meetingsQuery.data?.data]);

  const meetingsKey = useMemo(
    () => meetings.map((meeting) => meeting.id).join("|"),
    [meetings],
  );

  const recordingLinksRef = useRef(recordingLinks);
  useEffect(() => {
    recordingLinksRef.current = recordingLinks;
  }, [recordingLinks]);

  const prefetchKeyRef = useRef<string | null>(null);

  const fetchRecordingLinkForMeeting = async (
    meeting: GsMeetingResponse,
    signal?: { cancelled: boolean },
  ) => {
    setRecordingLinks((prev) => {
      const existing = prev[meeting.id];
      if (existing?.status === "ready" || existing?.status === "loading") {
        return prev;
      }
      return { ...prev, [meeting.id]: { status: "loading" } };
    });

    try {
      const recordingsResponse = await gsMeetingsService.fetchRecordings(
        meeting.id,
      );
      if (signal?.cancelled) return;

      if (!recordingsResponse.success) {
        throw new Error(recordingsResponse.message);
      }

      if ((recordingsResponse.data ?? []).length === 0) {
        setRecordingLinks((prev) => ({
          ...prev,
          [meeting.id]: { status: "unavailable" },
        }));
        return;
      }

      const linkResponse = await gsMeetingsService.generatePublicLink(
        meeting.id,
        { expires_in_days: 30 },
      );
      if (signal?.cancelled) return;

      if (!linkResponse.success) {
        throw new Error(linkResponse.message);
      }

      const rawPublicUrl =
        linkResponse.data?.public_url ?? linkResponse.data?.url;
      if (!rawPublicUrl) {
        setRecordingLinks((prev) => ({
          ...prev,
          [meeting.id]: {
            status: "error",
            error: "Public recording URL not returned by API.",
          },
        }));
        return;
      }

      setRecordingLinks((prev) => ({
        ...prev,
        [meeting.id]: {
          status: "ready",
          publicUrl: resolvePublicRecordingUrl(rawPublicUrl),
          expiresAt: linkResponse.data?.expires_at,
        },
      }));
    } catch (error) {
      if (signal?.cancelled) return;
      const message =
        error instanceof Error ? error.message : "Failed to fetch recording.";
      setRecordingLinks((prev) => ({
        ...prev,
        [meeting.id]: { status: "error", error: message },
      }));
    }
  };

  useEffect(() => {
    if (!isStaff) return;
    if (meetingsQuery.isLoading || meetingsQuery.isFetching) return;
    if (meetings.length === 0) return;

    setRecordingLinks((prev) => {
      let changed = false;
      const next: Record<string, RecordingLinkState> = { ...prev };
      for (const meeting of meetings) {
        if (!next[meeting.id]) {
          next[meeting.id] = { status: "idle" };
          changed = true;
        }
      }
      return changed ? next : prev;
    });

    if (prefetchKeyRef.current === meetingsKey) return;
    prefetchKeyRef.current = meetingsKey;

    const signal = { cancelled: false };

    const run = async () => {
      const concurrency = Math.min(3, meetings.length);
      const queue = [...meetings];

      const workers = Array.from({ length: concurrency }, async () => {
        while (!signal.cancelled && queue.length > 0) {
          const meeting = queue.shift();
          if (!meeting) return;

          const existing = recordingLinksRef.current[meeting.id];
          if (existing?.status === "ready" || existing?.status === "loading") {
            continue;
          }

          await fetchRecordingLinkForMeeting(meeting, signal);
        }
      });

      await Promise.all(workers);
    };

    run();

    return () => {
      signal.cancelled = true;
    };
  }, [
    isStaff,
    meetingsQuery.isLoading,
    meetingsQuery.isFetching,
    meetingsKey,
    meetings,
  ]);

  const handleCopyPublicUrl = async (meetingId: string) => {
    const url = recordingLinks[meetingId]?.publicUrl;
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Public link copied.");
    } catch {
      toast.error("Failed to copy public link.");
    }
  };

  const handleWatchRecording = (meetingId: string) => {
    const state = recordingLinks[meetingId];
    if (!state?.publicUrl) return;
    setActiveRecordingUrl(state.publicUrl);
    setActiveRecordingExpiresAt(state.expiresAt ?? null);
    setRecordingDialogOpen(true);
  };

  const handleRetryRecording = async (meetingId: string) => {
    const meeting = meetings.find((m) => m.id === meetingId);
    if (!meeting) return;
    setRecordingLinks((prev) => ({
      ...prev,
      [meetingId]: { status: "idle" },
    }));
    await fetchRecordingLinkForMeeting(meeting);
  };

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
          {meetingsQuery.isLoading || meetingsQuery.isFetching ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading meetings...
            </div>
          ) : meetingsQuery.error ? (
            <p className="text-sm text-destructive">
              {meetingsQuery.error.message || "Failed to fetch meetings."}
            </p>
          ) : meetings.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No meetings found for this application.
            </p>
          ) : (
            <div className="space-y-3">
              {/* <pre>{JSON.stringify(meetings, null, 2)}</pre> */}
              {meetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meetingSummary={meeting}
                  isStaff={isStaff}
                  recordingState={recordingLinks[meeting.id]}
                  onCopyPublicUrl={handleCopyPublicUrl}
                  onWatchRecording={handleWatchRecording}
                  onRetryRecording={handleRetryRecording}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={recordingDialogOpen}
        onOpenChange={(open) => {
          setRecordingDialogOpen(open);
          if (!open) {
            setActiveRecordingUrl(null);
            setActiveRecordingExpiresAt(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Meeting Recording</DialogTitle>
          </DialogHeader>
          {activeRecordingUrl ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  type="button"
                  onClick={() =>
                    window.open(
                      activeRecordingUrl,
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                >
                  <Link2 className="h-4 w-4" />
                  Open Public Link
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(activeRecordingUrl);
                      toast.success("Public link copied.");
                    } catch {
                      toast.error("Failed to copy public link.");
                    }
                  }}
                >
                  <Copy className="h-4 w-4" />
                  Copy Link
                </Button>
                {activeRecordingExpiresAt ? (
                  <p className="text-xs text-muted-foreground self-center">
                    Expires:{" "}
                    {formatUtcToFriendlyLocal(activeRecordingExpiresAt)}
                  </p>
                ) : null}
              </div>

              <video
                src={activeRecordingUrl}
                controls
                autoPlay
                playsInline
                className="w-full rounded-md bg-black"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading recording...
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Continue Button - staff only, stage not completed */}
      {isStaff && !isStageCompleted && (
        <div className="flex items-center justify-end">
          <Button
            variant="default"
            className=" gap-2"
            onClick={handleProceedToAssessment}
            disabled={isProceeding}
          >
            Proceed to Assessment
            {isProceeding ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {!isProceeding ? <SkipForward className="h-4 w-4" /> : null}
          </Button>
        </div>
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
