"use client";

import { Badge } from "@/components/ui/badge";
import { formatUtcToFriendlyLocal } from "@/shared/lib/format-utc-to-local";

export type SyncMetadataItem = {
  last_synced_at?: string | null;
  last_error?: unknown;
  attempt_count?: number;
  uptodate?: boolean;
};

export function formatSyncError(error: unknown): string | null {
  if (error === null || error === undefined) return null;
  if (typeof error === "string") return error || null;
  if (typeof error === "number" || typeof error === "boolean") {
    return String(error);
  }
  if (Array.isArray(error)) {
    const parts = error
      .map((item) => formatSyncError(item))
      .filter((item): item is string => Boolean(item));
    return parts.length ? parts.join(" | ") : null;
  }
  if (typeof error === "object") {
    const record = error as Record<string, unknown>;
    const message = formatSyncError(record.message);
    if (message) return message;
    try {
      return JSON.stringify(error);
    } catch {
      return "Unknown sync error";
    }
  }
  return "Unknown sync error";
}

export function SyncMetadataNote({
  syncMeta,
  showSync,
  isStaffOrAdmin,
}: {
  syncMeta?: SyncMetadataItem | null;
  showSync: boolean;
  isStaffOrAdmin: boolean;
}) {
  if (!showSync || !isStaffOrAdmin || !syncMeta) return null;
  const errorText = formatSyncError(syncMeta.last_error);

  const statusLabel = errorText
    ? "Error"
    : syncMeta.uptodate
      ? "Up to date"
      : "Not synced";
  const statusVariant = errorText
    ? "destructive"
    : syncMeta.uptodate
      ? "secondary"
      : "outline";

  return (
    <div className="text-xs text-muted-foreground">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={statusVariant} className="text-[10px]">
          {statusLabel}
        </Badge>
        {syncMeta.last_synced_at ? (
          <span>
            Last synced: {formatUtcToFriendlyLocal(syncMeta.last_synced_at)}
          </span>
        ) : null}
      </div>
      {errorText ? (
        <p className="mt-1 text-[11px] text-destructive">{errorText}</p>
      ) : null}
    </div>
  );
}

