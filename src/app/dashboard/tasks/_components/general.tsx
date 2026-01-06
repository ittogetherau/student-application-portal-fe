"use client";

import { Badge } from "@/components/ui/badge";
import type { StaffThreadSummary } from "@/service/application-threads.service";
import { ThreadMessage } from "@/service/application-threads.service";
import { LucideIcon } from "lucide-react";

export const formatDateTime = (date?: string | null) =>
  date
    ? new Date(date).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

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

export const ThreadListItem = ({
  thread,
  isActive,
  onSelect,
}: {
  thread: StaffThreadSummary;
  isActive: boolean;
  onSelect: () => void;
}) => (
  <div
    className={`p-3 mb-2 cursor-pointer transition-colors border-l-2 ${
      isActive
        ? "border-l-primary bg-muted/60"
        : "border-l-transparent hover:bg-muted/40 hover:border-l-muted-foreground/20"
    }`}
    onClick={onSelect}
  >
    <div className="flex items-start justify-between gap-2 mb-2">
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{thread.subject}</p>
      </div>
      <Badge
        variant={priorityVariant(thread.priority)}
        className="text-[10px] shrink-0"
      >
        {thread.priority}
      </Badge>
    </div>
    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
      <span className="truncate">Deadline: {thread.deadline || "-"}</span>
      <Badge
        variant={statusVariant(thread.status)}
        className="text-[10px] ml-2 shrink-0"
      >
        {thread.status.replace("_", " ")}
      </Badge>
    </div>
    <p className="text-[10px] text-muted-foreground mt-1">
      Updated {formatDateTime(thread.status_updated_at)}
    </p>
  </div>
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
            {formatDateTime(message.created_at)}
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
                <img
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
