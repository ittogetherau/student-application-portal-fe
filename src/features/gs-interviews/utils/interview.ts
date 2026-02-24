import type { GsInterviewResponse } from "@/service/gs-meetings.service";

export const getInterviewStart = (item: GsInterviewResponse) =>
  item.scheduled_start || item.scheduled_at || "";

export const getInterviewEnd = (item: GsInterviewResponse) => {
  if (item.scheduled_end) return item.scheduled_end;
  if (!item.scheduled_at || !item.duration_minutes) return "";

  const start = new Date(item.scheduled_at);
  if (Number.isNaN(start.valueOf())) return "";
  start.setMinutes(start.getMinutes() + item.duration_minutes);
  return start.toISOString();
};

export const getInterviewJoinUrl = (item: GsInterviewResponse) =>
  item.join_url || item.meeting_link || "";

export const getInterviewTitle = (item: GsInterviewResponse) => {
  const anyItem = item as Record<string, unknown>;
  const studentName =
    (anyItem.student_name as string | undefined) ||
    (anyItem.studentName as string | undefined) ||
    (anyItem.applicant_name as string | undefined) ||
    (anyItem.applicantName as string | undefined) ||
    "";

  if (studentName) return `GS Interview: ${studentName}`;
  if (item.application_id) return `GS Interview (${item.application_id})`;
  return "GS Interview";
};
