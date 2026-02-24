"use client";

import { Badge } from "@/components/ui/badge";
import { formatUtcToFriendlyLocal } from "@/shared/lib/format-utc-to-local";
import type { StaffThreadSummary } from "@/service/application-threads.service";
import {
  formatParticipantLabel,
  priorityVariant,
  statusVariant,
} from "@/features/threads/utils/threads-utils";

type ThreadListItemProps = {
  thread: StaffThreadSummary;
  isActive: boolean;
  onSelect: () => void;
  showAssignedStaff?: boolean;
};

export default function ThreadListItem({
  thread,
  isActive,
  onSelect,
  showAssignedStaff = false,
}: ThreadListItemProps) {
  return (
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
          <p className="text-xs font-semibold line-clamp-2">{thread.subject}</p>
          <div className="mt-1 space-y-0.5 text-[10px] text-muted-foreground">
            <p className="truncate">
              Agent: {formatParticipantLabel(thread.agent)}
            </p>
            {showAssignedStaff ? (
              <p className="truncate">
                Staff: {formatParticipantLabel(thread.assigned_staff)}
              </p>
            ) : null}
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
}

