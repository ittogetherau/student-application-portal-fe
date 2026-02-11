import type { LucideIcon } from "lucide-react";
import {
  ClipboardCheck,
  ListTodo,
  MessageSquare,
  ScanSearch,
  Signature,
  User,
} from "lucide-react";

export const DEFAULT_NOTIFICATION_TITLE_ICON = User;

export const NOTIFICATION_TITLE_ICON_MAP: Record<string, LucideIcon> = {
  "Application received": ClipboardCheck,
  "Application assigned": User,
  "Application under review": ScanSearch,
  "GS process in progress": ListTodo,
  "Offer letter signed": Signature,
  "Thread created": MessageSquare,
};

export const normalizeNotificationTitle = (title?: string | null) =>
  (title ?? "").trim().toLowerCase();

export const NOTIFICATION_TITLE_ICON_MAP_NORMALIZED: Record<string, LucideIcon> =
  Object.fromEntries(
  Object.entries(NOTIFICATION_TITLE_ICON_MAP).map(([title, Icon]) => [
    normalizeNotificationTitle(title),
    Icon,
  ]),
);
