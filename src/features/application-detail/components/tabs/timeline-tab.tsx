"use client";

import { useApplicationTimelineQuery } from "@/shared/hooks/use-applications";
import { formatUtcToFriendlyLocal } from "@/shared/lib/format-utc-to-local";
import { Clock, Loader2 } from "lucide-react";

interface props {
  id: string;
}

const formatTimelineMessage = (message: string) => {
  const requestedPattern =
    /advanced_standing_requested:\s*['"]?(?:none|false)?['"]?\s*->\s*['"]?true['"]?/i;
  const submittedPattern =
    /advanced_standing_submitted:\s*['"]?(?:none|false)?['"]?\s*->\s*['"]?true['"]?/i;
  const approvedPattern =
    /advanced_standing_status:\s*['"]?(?:none|pending|submitted)?['"]?\s*->\s*['"]?approved['"]?/i;
  const rejectedPattern =
    /advanced_standing_status:\s*['"]?(?:none|pending|submitted)?['"]?\s*->\s*['"]?rejected['"]?/i;

  if (approvedPattern.test(message)) {
    return "Staff approved Advanced Standing for credit.";
  }

  if (rejectedPattern.test(message)) {
    return "Staff rejected Advanced Standing for credit.";
  }

  if (submittedPattern.test(message)) {
    return "Student submitted the Advanced Standing Form.";
  }

  if (requestedPattern.test(message)) {
    return "Staff requested the Advanced Standing Form from the student.";
  }

  if (message.includes("enrollment_data changed:")) {
    return message.replace(
      "enrollment_data changed:",
      "Application details updated:",
    );
  }

  return message;
};

const TimelineTab = ({ id }: props) => {
  const {
    data: response,
    isLoading,
    isError,
  } = useApplicationTimelineQuery(id);
  const data = response?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        Failed to load timeline
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        No timeline events yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((el, index) => (
        <div className="flex gap-2" key={el.id}>
          <div className="flex flex-col items-center">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Clock className="h-3 w-3 text-primary" />
            </div>
            {index < data.length - 1 && (
              <div className="w-px flex-1 bg-border mt-1 min-h-[20px]" />
            )}
          </div>
          <div className="flex-1 pb-3">
            <p className="text-sm font-medium leading-tight">
              {formatTimelineMessage(el.message)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              {formatUtcToFriendlyLocal(el.created_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TimelineTab;
