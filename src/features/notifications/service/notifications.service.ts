import { ApiService } from "@/service/base.service";
import { buildQueryString, resolveServiceCall } from "@/service/service-helpers";
import type { ServiceResponse } from "@/shared/types/service";

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
};

export type ListNotificationsParams = {
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
};

export type ListNotificationsResponse = {
  notifications: NotificationItem[];
  total: number;
  unread: number;
};

export type MarkNotificationReadResponse = {
  success: boolean;
  notification_id: string;
};

class NotificationsService extends ApiService {
  private readonly basePath = "notifications";

  list(
    params: ListNotificationsParams = {},
  ): Promise<ServiceResponse<ListNotificationsResponse>> {
    const query = buildQueryString({
      unread_only: params.unreadOnly ?? false,
      limit: params.limit ?? 50,
      offset: params.offset ?? 0,
    });

    return resolveServiceCall<ListNotificationsResponse>(
      () => this.get(`${this.basePath}${query}`, true),
      "Notifications fetched successfully.",
      "Failed to fetch notifications",
      { notifications: [], total: 0, unread: 0 },
    );
  }

  markRead(
    notificationId: string,
  ): Promise<ServiceResponse<MarkNotificationReadResponse>> {
    if (!notificationId) {
      return Promise.resolve({
        success: false,
        data: null,
        message: "Notification id is required",
      });
    }

    return resolveServiceCall<MarkNotificationReadResponse>(
      () => this.post(`${this.basePath}/${notificationId}/read`, {}, true),
      "Notification marked as read.",
      "Failed to mark notification as read",
    );
  }

  markAllRead(): Promise<ServiceResponse<string>> {
    return resolveServiceCall<string>(
      () => this.post(`${this.basePath}/read-all`, {}, true),
      "All notifications marked as read.",
      "Failed to mark all notifications as read",
      "",
    );
  }
}

const notificationsService = new NotificationsService();
export default notificationsService;

