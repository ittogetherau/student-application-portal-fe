"use client";

import ContainerLayout from "@/components/ui-kit/layout/container-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { siteRoutes } from "@/constants/site-routes";
import NotificationCard from "@/features/notifications/components/notification-card";
import {
  useMarkAllNotificationsReadMutation,
  useNotificationsQuery,
} from "@/features/notifications/hooks/use-notifications.hook";
import { Bell, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const PER_PAGE_OPTIONS = [1, 15, 25, 50, 100, 200] as const;

const isPerPageOption = (
  value: number,
): value is (typeof PER_PAGE_OPTIONS)[number] =>
  (PER_PAGE_OPTIONS as readonly number[]).includes(value);

export default function NotificationsPageClient() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [perPage, setPerPage] = useState<(typeof PER_PAGE_OPTIONS)[number]>(15);
  const [page, setPage] = useState(1);

  const markAllReadMutation = useMarkAllNotificationsReadMutation();

  const safePerPage = Math.min(Math.max(perPage, 1), 200);

  const notificationsQuery = useNotificationsQuery({
    unreadOnly,
    limit: safePerPage,
    offset: (page - 1) * safePerPage,
  });

  const list = notificationsQuery.data?.data;
  const notifications = list?.notifications ?? [];
  const total = list?.total ?? 0;
  const unreadCount = list?.unread ?? 0;

  const totalPages = useMemo(() => {
    const resolved = Math.ceil((total || 0) / safePerPage);
    return Math.max(1, resolved || 1);
  }, [safePerPage, total]);

  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = total === 0 ? 0 : (currentPage - 1) * safePerPage + 1;
  const endIndex = Math.min(currentPage * safePerPage, total);

  const goPrev = () => setPage((prev) => Math.max(prev - 1, 1));
  const goNext = () => setPage((prev) => Math.min(prev + 1, totalPages));

  const markAllAsRead = () => markAllReadMutation.mutate();

  return (
    <ContainerLayout className="p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {total > 0 ? (
              <>
                Showing {startIndex}-{endIndex} of {total}
              </>
            ) : (
              "No notifications"
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="hidden sm:inline-flex"
          >
            <Link href={siteRoutes.dashboard.root}>Back to dashboard</Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
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
      </div>

      <section className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            {unreadCount > 0 && (
              <Badge variant="default" className="h-5 px-1.5 text-xs">
                {unreadCount} unread
              </Badge>
            )}
          </CardTitle>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={unreadOnly}
                onCheckedChange={(next) => {
                  const value = next === true;
                  setUnreadOnly(value);
                  setPage(1);
                }}
              />
              Unread only
            </label>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Per page</span>
              <Select
                value={String(perPage)}
                onValueChange={(val) => {
                  const parsed = Number(val);
                  const next: (typeof PER_PAGE_OPTIONS)[number] =
                    isPerPageOption(parsed) ? parsed : 15;
                  setPerPage(next);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-28" size="sm">
                  <SelectValue placeholder="Per page" />
                </SelectTrigger>
                <SelectContent align="end">
                  {PER_PAGE_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={String(opt)}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      <section className="pt-0">
        <div className="max-h-[calc(100vh-18rem)] overflow-y-auto rounded-lg border">
          {notificationsQuery.isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 px-4">
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          ) : notificationsQuery.isError ? (
            <div className="flex flex-col items-center justify-center py-10 px-4">
              <p className="text-sm text-muted-foreground">
                Failed to load notifications
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4">
              <Bell className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">
                {unreadOnly ? "No unread notifications" : "No notifications"}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goPrev}
              disabled={currentPage <= 1 || notificationsQuery.isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goNext}
              disabled={
                currentPage >= totalPages || notificationsQuery.isLoading
              }
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </ContainerLayout>
  );
}
