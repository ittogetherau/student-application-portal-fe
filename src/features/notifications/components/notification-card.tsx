"use client";

import {
  getNotificationColor,
  normalizeNotificationType,
} from "@/features/notifications/components/notification-ui";
import {
  DEFAULT_NOTIFICATION_TITLE_ICON,
  normalizeNotificationTitle,
  NOTIFICATION_TITLE_ICON_MAP,
  NOTIFICATION_TITLE_ICON_MAP_NORMALIZED,
} from "@/features/notifications/components/notification-title-icon-map";
import { useMarkNotificationReadMutation } from "@/features/notifications/hooks/use-notifications.hook";
import type { NotificationItem } from "@/features/notifications/service/notifications.service";
import { siteRoutes } from "@/shared/constants/site-routes";
import { cn } from "@/shared/lib/utils";
import { useRouter } from "next/navigation";
import { formatUtcToFriendlyLocal } from "@/shared/lib/format-utc-to-local";

type props = {
  notification: NotificationItem;
  className?: string;
};

const GS_NOTIFICATION_TITLES = new Set([
  normalizeNotificationTitle("GS process in progress"),
  normalizeNotificationTitle("Offer letter signed"),
]);

const COMMUNICATION_NOTIFICATION_TITLES = new Set([
  normalizeNotificationTitle("Thread created"),
]);

function resolveNotificationDestination(
  notification: NotificationItem,
): string {
  const applicationId = notification.related_id;
  if (!applicationId) return siteRoutes.dashboard.notifications;

  const normalizedTitle = normalizeNotificationTitle(notification.title);
  if (GS_NOTIFICATION_TITLES.has(normalizedTitle)) {
    return siteRoutes.dashboard.application.id.gs(applicationId);
  }
  if (COMMUNICATION_NOTIFICATION_TITLES.has(normalizedTitle)) {
    return siteRoutes.dashboard.application.id.communication(applicationId);
  }

  const searchableText =
    `${notification.title} ${notification.type}`.toLowerCase();

  if (searchableText.includes("gs")) {
    return siteRoutes.dashboard.application.id.gs(applicationId);
  }
  if (searchableText.includes("coe")) {
    return siteRoutes.dashboard.application.id.coe(applicationId);
  }
  if (
    searchableText.includes("thread") ||
    searchableText.includes("communication") ||
    searchableText.includes("message")
  ) {
    return siteRoutes.dashboard.application.id.communication(applicationId);
  }
  if (searchableText.includes("timeline")) {
    return siteRoutes.dashboard.application.id.timeline(applicationId);
  }

  return siteRoutes.dashboard.application.id.details(applicationId);
}

export default function NotificationCard({ notification, className }: props) {
  const router = useRouter();
  const markReadMutation = useMarkNotificationReadMutation();

  const type = normalizeNotificationType(notification.type);
  const iconColor = getNotificationColor(type);
  const isRead = notification.is_read;
  const normalizedTitle = normalizeNotificationTitle(notification.title);
  const TitleIcon =
    NOTIFICATION_TITLE_ICON_MAP[notification.title] ??
    NOTIFICATION_TITLE_ICON_MAP_NORMALIZED[normalizedTitle] ??
    DEFAULT_NOTIFICATION_TITLE_ICON;

  return (
    <div
      className={cn(
        "px-4 py-3 hover:bg-accent transition-colors cursor-pointer",
        !isRead && "bg-accent/50",
        className,
      )}
      onClick={async () => {
        const destination = resolveNotificationDestination(notification);

        if (!isRead && !markReadMutation.isPending) {
          try {
            await markReadMutation.mutateAsync(notification.id);
          } catch {
            // Navigate even if marking as read fails.
          }
        }

        router.push(destination);
      }}
    >
      <div className="flex gap-3">
        <div className={cn("shrink-0 mt-0.5", iconColor)}>
          <TitleIcon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center justify-between gap-2 w-full ">
              <p
                className={cn(
                  "text-sm font-medium",
                  !isRead && "font-semibold",
                )}
              >
                {notification.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">
                {formatUtcToFriendlyLocal(notification.created_at)}
              </p>
            </div>

            {!isRead && (
              <div className="shrink-0 h-2 w-2 rounded-full bg-primary mt-1.5" />
            )}
          </div>
          <p
            dangerouslySetInnerHTML={{
              __html: notification?.message
                ?.split("\n")
                ?.toSpliced(1, 2)
                ?.join("<br />"),
            }}
            className="text-xs text-muted-foreground mt-1"
          />
        </div>
      </div>
    </div>
  );
}
