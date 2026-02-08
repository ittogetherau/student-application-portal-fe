"use client";

import { ErrorState, LoadingState } from "@/components/ui-kit/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { siteRoutes } from "@/constants/site-routes";
import NotificationCard from "@/features/notifications/components/notification-card";
import {
  useMarkAllNotificationsReadMutation,
  useNotificationsQuery,
} from "@/features/notifications/hooks/use-notifications.hook";
import { Bell } from "lucide-react";
import Link from "next/link";

const NotificationsPopover = () => {
  const notificationsQuery = useNotificationsQuery({ limit: 20, offset: 0 });
  const markAllReadMutation = useMarkAllNotificationsReadMutation();

  const list = notificationsQuery.data?.data;
  const notifications = list?.notifications ?? [];
  const unreadCount = list?.unread ?? 0;
  const total = list?.total ?? 0;

  const markAllAsRead = () => markAllReadMutation.mutate();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground relative"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="default" className="h-5 px-1.5 text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
            disabled={
              unreadCount === 0 ||
              markAllReadMutation.isPending ||
              notificationsQuery.isLoading
            }
            onClick={markAllAsRead}
          >
            Mark all as read
          </Button>
        </div>

        {/* Notifications List */}
        <div className="max-h-[400px] overflow-y-auto">
          {notificationsQuery.isLoading ? (
            <LoadingState />
          ) : notificationsQuery.isError ? (
            <ErrorState />
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4">
              <Bell className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  className="group"
                />
              ))}
            </div>
          )}
        </div>

        {total > 0 && (
          <div className="border-t px-4 py-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground hover:text-foreground"
            >
              <Link href={siteRoutes.dashboard.notifications}>
                View all notifications
              </Link>
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPopover;
