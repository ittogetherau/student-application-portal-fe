export type AdvancedStandingDisplayStatus =
  | "Requested"
  | "Submitted"
  | "Approved"
  | "Rejected";

export function getAdvancedStandingDisplayStatus(params: {
  isRequested: boolean;
  isSubmitted: boolean;
  status: string;
}): AdvancedStandingDisplayStatus | null {
  const { isRequested, isSubmitted, status } = params;
  if (!isRequested) return null;
  if (status === "Approved") return "Approved";
  if (status === "Rejected") return "Rejected";
  if (isSubmitted) return "Submitted";
  return "Requested";
}

// One canonical color per status: Requested = amber, Submitted = sky, Approved = green, Rejected = red.
export const ADVANCED_STANDING_PILL_CLASSES: Record<
  AdvancedStandingDisplayStatus,
  string
> = {
  Requested: "bg-amber-200 text-amber-900 ring-1 ring-amber-300",
  Submitted: "bg-sky-200 text-sky-900 ring-1 ring-sky-300",
  Approved: "bg-green-200 text-green-900 ring-1 ring-green-300",
  Rejected: "bg-red-200 text-red-900 ring-1 ring-red-300",
};

export const ADVANCED_STANDING_BOX_CLASSES: Record<
  AdvancedStandingDisplayStatus,
  { container: string; title: string; body: string }
> = {
  Requested: {
    container: "bg-amber-50 border-amber-100",
    title: "text-amber-700",
    body: "text-amber-600",
  },
  Submitted: {
    container: "bg-sky-50 border-sky-100",
    title: "text-sky-700",
    body: "text-sky-600",
  },
  Approved: {
    container: "bg-green-50 border-green-100",
    title: "text-green-700",
    body: "text-green-600",
  },
  Rejected: {
    container: "bg-red-50 border-red-100",
    title: "text-red-700",
    body: "text-red-600",
  },
};
