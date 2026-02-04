"use client";

import { Badge } from "@/components/ui/badge";
import { formatUtcToFriendlyLocal } from "@/shared/lib/format-utc-to-local";

export type SyncMetadataItem = {
  last_synced_at?: string | null;
  last_error?: string | null;
  attempt_count?: number;
  uptodate?: boolean;
};

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

  const statusLabel = syncMeta.last_error
    ? "Error"
    : syncMeta.uptodate
      ? "Up to date"
      : "Not synced";
  const statusVariant = syncMeta.last_error
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
      {syncMeta.last_error ? (
        <p className="mt-1 text-[11px] text-destructive">
          {syncMeta.last_error}
        </p>
      ) : null}
    </div>
  );
}

