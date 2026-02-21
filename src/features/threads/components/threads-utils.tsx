"use client";

import { Badge } from "@/components/ui/badge";
import { formatUtcToFriendlyLocal } from "@/shared/lib/format-utc-to-local";
import type {
  StaffThreadSummary,
  ThreadParticipant,
} from "@/service/application-threads.service";
import { ThreadMessage } from "@/service/application-threads.service";
import { LucideIcon } from "lucide-react";
import Image from "next/image";

//
export const statusVariant = (status: string) => {
  const map: Record<string, "secondary" | "default" | "outline"> = {
    completed: "secondary",
    under_review: "default",
  };
  return map[status] || "outline";
};

export const priorityVariant = (priority: string) => {
  const map: Record<string, "destructive" | "default" | "secondary"> = {
    high: "destructive",
    medium: "default",
  };
  return map[priority] || "secondary";
};

const formatParticipantLabel = (participant?: ThreadParticipant | null) => {
  const name = participant?.name?.trim();
  const email = participant?.email?.trim();

  if (name && email) return `${name} (${email})`;
  if (name) return name;
  if (email) return email;
  return "N/A";
};

export const ThreadListItem = ({
  thread,
  isActive,
  onSelect,
  showAssignedStaff = false,
}: {
  thread: StaffThreadSummary;
  isActive: boolean;
  onSelect: () => void;
  showAssignedStaff?: boolean;
}) => (
  <button
    type="button"
    className={`w-full p-2 mb-1 rounded-md text-left cursor-pointer transition-colors border-l-2 ${
      isActive
        ? "border-l-primary bg-muted/70"
        : "border-l-transparent hover:bg-muted/40 hover:border-l-muted-foreground/20"
    }`}
    onClick={onSelect}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold truncate">{thread.subject}</p>
        <div className="mt-1 space-y-0.5 text-[10px] text-muted-foreground">
          <p className="truncate">
            Agent: {formatParticipantLabel(thread.agent)}
          </p>
          {showAssignedStaff && (
            <p className="truncate">
              Staff: {formatParticipantLabel(thread.assigned_staff)}
            </p>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground mt-1 truncate">
          {thread.status_updated_at
            ? formatUtcToFriendlyLocal(thread.status_updated_at)
            : "No update time"}
        </p>
      </div>

      <div className="shrink-0 flex flex-col items-end gap-1">
        <Badge
          variant={priorityVariant(thread.priority)}
          className="text-[9px] px-1.5 py-0 h-4"
        >
          {thread.priority}
        </Badge>
        <Badge
          variant={statusVariant(thread.status)}
          className="text-[9px] px-1.5 py-0 h-4"
        >
          {thread.status.replace("_", " ")}
        </Badge>
      </div>
    </div>
  </button>
);

export const MessageBubble = ({
  message,
  isSelf,
}: {
  message: ThreadMessage;
  isSelf: boolean;
}) => {
  const authorLabel =
    message.author_name || message.author_email?.split("@")[0] || "User";

  return (
    <div className={`flex ${isSelf ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
          isSelf ? "bg-primary text-primary-foreground" : "bg-muted border"
        }`}
      >
        <div className="flex items-center gap-1.5 mb-1 text-[10px] opacity-70">
          <span className="font-semibold truncate">{authorLabel}</span>
          <span>-</span>
          <span className="whitespace-nowrap">
            {message.created_at
              ? formatUtcToFriendlyLocal(message.created_at)
              : ""}
          </span>
        </div>
        {message.message && (
          <p className="text-[13px] leading-relaxed break-words whitespace-pre-wrap">
            {message.message}
          </p>
        )}
        {message.attachments?.length ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.attachments.map((attachment, idx) => (
              <a
                key={attachment.id ?? `${attachment.url}-${idx}`}
                href={attachment.url}
                target="_blank"
                rel="noreferrer"
                className="block h-20 w-20 overflow-hidden rounded-md border bg-background/60"
              >
                <Image
                  width={350}
                  height={350}
                  src={attachment.url}
                  alt={attachment.file_name || `Attachment ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export const EmptyState = ({
  icon: Icon,
  text,
}: {
  icon: LucideIcon;
  text: string;
}) => (
  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
    <Icon className="h-12 w-12 mb-3 opacity-15" />
    <p className="text-sm">{text}</p>
  </div>
);
