import {
  type Primitive,
  formatMoney,
} from "@/features/application-form/components/sync-review/field";
import { formatUtcToFriendlyLocal } from "@/shared/lib/format-utc-to-local";
import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  CheckCircle2,
  Contact2,
  FileText,
  Languages,
  MapPin,
  Shield,
  User2,
} from "lucide-react";

const isPrimitive = (value: unknown): value is Primitive =>
  typeof value === "string" ||
  typeof value === "number" ||
  typeof value === "boolean" ||
  value === null ||
  value === undefined;

export const formatReviewLabel = (key: string) =>
  key.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export const toReviewPrimitive = (value: unknown): Primitive => {
  if (isPrimitive(value)) return value;

  if (Array.isArray(value)) {
    if (value.length === 0) return null;

    if (value.every(isPrimitive)) {
      return value
        .map((item) => {
          if (item === null || item === undefined || item === "") return null;
          if (typeof item === "boolean") return item ? "Yes" : "No";
          return String(item);
        })
        .filter(Boolean)
        .join(", ");
    }

    return `${value.length} item${value.length === 1 ? "" : "s"}`;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "object" && value !== null) {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  return null;
};

const formatReviewDate = (value: Primitive) => {
  const text =
    typeof value === "string"
      ? value
      : value === null || value === undefined
        ? ""
        : String(value);

  return formatUtcToFriendlyLocal(text) || text;
};

type ReviewFieldOverride = {
  icon?: LucideIcon;
  label?: string;
  format?: (value: Primitive) => string;
  mono?: boolean;
};

type ReviewFieldOptions = {
  defaultIcon?: LucideIcon;
  overrides?: Record<string, ReviewFieldOverride>;
};

const isDateKey = (key: string) =>
  key.endsWith("_at") ||
  key.includes("date") ||
  key.includes("expiry") ||
  key.includes("dob");

const isMoneyKey = (key: string) =>
  key.includes("fee") ||
  key.includes("amount") ||
  key.includes("cost") ||
  key.includes("total");

const isLocationKey = (key: string) =>
  key.includes("address") ||
  key.includes("street") ||
  key.includes("suburb") ||
  key.includes("state") ||
  key.includes("country") ||
  key.includes("postcode");

const isIdentityKey = (key: string) =>
  key.includes("passport") ||
  key.includes("visa") ||
  key.includes("citizenship") ||
  key.includes("nationality");

const isLanguageKey = (key: string) =>
  key.includes("language") || key.includes("english");

const isContactKey = (key: string) =>
  key.includes("email") || key.includes("phone");

const isPersonKey = (key: string) =>
  key.includes("name") ||
  key.includes("title") ||
  key.includes("gender");

const isStatusKey = (key: string) =>
  key.includes("status") ||
  key.startsWith("has_") ||
  key.startsWith("is_") ||
  key.startsWith("request_") ||
  key.includes("verified") ||
  key.includes("required") ||
  key.includes("support");

const isMonospaceKey = (key: string) =>
  key.includes("number") ||
  key.includes("phone") ||
  key.includes("postcode") ||
  key.endsWith("_id") ||
  key.endsWith("_code");

const getReviewFieldIcon = (
  key: string,
  defaultIcon?: LucideIcon,
): LucideIcon => {
  if (isDateKey(key)) return CalendarDays;
  if (isLocationKey(key)) return MapPin;
  if (isIdentityKey(key)) return Shield;
  if (isLanguageKey(key)) return Languages;
  if (isContactKey(key)) return Contact2;
  if (isPersonKey(key)) return User2;
  if (isStatusKey(key)) return CheckCircle2;
  return defaultIcon ?? FileText;
};

export const getUnhandledReviewEntries = (
  record: Record<string, unknown> | null | undefined,
  handledKeys: readonly string[],
  options?: ReviewFieldOptions,
) => {
  if (!record) return [];

  const handled = new Set(handledKeys);
  const overrides = options?.overrides ?? {};

  return Object.entries(record)
    .filter(([key]) => !handled.has(key))
    .map(([key, value]) => {
      const override = overrides[key];

      return {
        key,
        label: override?.label ?? formatReviewLabel(key),
        value: toReviewPrimitive(value),
        icon: override?.icon ?? getReviewFieldIcon(key, options?.defaultIcon),
        format:
          override?.format ??
          (isDateKey(key)
            ? formatReviewDate
            : isMoneyKey(key)
              ? formatMoney
              : undefined),
        mono: override?.mono ?? isMonospaceKey(key),
      };
    })
    .filter(
      ({ value }) =>
        value !== null && value !== undefined && !(typeof value === "string" && value === ""),
    );
};

export const normalizeReviewObjects = (value: unknown): Record<string, unknown>[] => {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null && !Array.isArray(item),
    );
  }

  if (typeof value === "object" && value !== null) {
    return [value as Record<string, unknown>];
  }

  return [];
};
