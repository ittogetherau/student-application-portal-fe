import { AlertCircle, CheckCircle2, Info } from "lucide-react";

export type NotificationType = "info" | "success" | "warning" | "error";

export const normalizeNotificationType = (value?: string): NotificationType => {
  const lowered = value?.toLowerCase();
  if (lowered === "success") return "success";
  if (lowered === "warning") return "warning";
  if (lowered === "error") return "error";
  return "info";
};

export const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "success":
      return CheckCircle2;
    case "warning":
      return AlertCircle;
    case "error":
      return AlertCircle;
    default:
      return Info;
  }
};

export const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case "success":
      return "text-green-600 dark:text-green-400";
    case "warning":
      return "text-yellow-600 dark:text-yellow-400";
    case "error":
      return "text-red-600 dark:text-red-400";
    default:
      return "text-blue-600 dark:text-blue-400";
  }
};

export function NotificationTypeIcon({
  type,
  className,
}: {
  type: NotificationType;
  className?: string;
}) {
  switch (type) {
    case "success":
      return <CheckCircle2 className={className} />;
    case "warning":
      return <AlertCircle className={className} />;
    case "error":
      return <AlertCircle className={className} />;
    default:
      return <Info className={className} />;
  }
}
