"use client";

import {
  getNotificationColor,
  normalizeNotificationType,
  NotificationTypeIcon,
} from "@/features/notifications/components/notification-ui";
import { useMarkNotificationReadMutation } from "@/features/notifications/hooks/use-notifications.hook";
import type { NotificationItem } from "@/features/notifications/service/notifications.service";
import { cn } from "@/shared/lib/utils";

type props = {
  notification: NotificationItem;
  className?: string;
};

export default function NotificationCard({ notification, className }: props) {
  const markReadMutation = useMarkNotificationReadMutation();

  console.log(notification);

  const type = normalizeNotificationType(notification.type);
  const iconColor = getNotificationColor(type);
  const isRead = notification.is_read;

  return (
    <div
      className={cn(
        "px-4 py-3 hover:bg-accent transition-colors cursor-pointer",
        !isRead && "bg-accent/50",
        className,
      )}
      onClick={() => {
        if (isRead || markReadMutation.isPending) return;
        markReadMutation.mutate(notification.id);
      }}
    >
      <div className="flex gap-3">
        <div className={cn("shrink-0 mt-0.5", iconColor)}>
          <NotificationTypeIcon type={type} className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p
              className={cn("text-sm font-medium", !isRead && "font-semibold")}
            >
              {notification.title}
            </p>
            {!isRead && (
              <div className="shrink-0 h-2 w-2 rounded-full bg-primary mt-1.5" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-1.5">
            {new Date(notification.created_at).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
