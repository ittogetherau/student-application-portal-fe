import type { ThreadParticipant } from "@/service/application-threads.service";

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

export const formatParticipantLabel = (
  participant?: ThreadParticipant | null,
) => {
  const name = participant?.name?.trim();
  const email = participant?.email?.trim();

  if (name && email) return `${name} (${email})`;
  if (name) return name;
  if (email) return email;
  return "N/A";
};

