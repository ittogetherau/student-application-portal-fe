"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2, OctagonAlert, RefreshCw } from "lucide-react";
import { formatSyncError, type SyncMetadataItem } from "./sync-metadata-note";
import { cn } from "@/shared/lib/utils";

export function SyncActionButton({
  showSync,
  isStaffOrAdmin,
  onClick,
  isPending,
  syncMeta,
}: {
  showSync: boolean;
  isStaffOrAdmin: boolean;
  onClick: () => void;
  isPending: boolean;
  syncMeta?: SyncMetadataItem | null;
}) {
  if (!showSync || !isStaffOrAdmin) return null;
  if (!syncMeta) return null;
  const isUpToDate = syncMeta.uptodate === true;
  const errorText = formatSyncError(syncMeta.last_error);
  const hasError = !!errorText;
  const hasSyncedAt = !!syncMeta.last_synced_at;
  const hasEverAttempted = (syncMeta.attempt_count ?? 0) > 0;
  const hasEverSynced = hasSyncedAt || hasEverAttempted;

  // Hide controls when everything is clean (synced + up-to-date + no error).
  if (isUpToDate && hasSyncedAt && !hasError) return null;

  // Special case: initial state with no attempts, no last_synced_at, no error
  // should not show anything.
  if (!hasEverSynced && !hasError) return null;

  // Only show a sync button when it's been synced/attempted before (or errored) and is out-of-date.
  const showSyncButton = !isUpToDate && (hasEverSynced || hasError);

  // Sync alert state: out-of-date or errored.
  const syncAlert = !isUpToDate || hasError;
  const alertText = errorText ?? "Not synced with galaxy.";

  if (!showSyncButton) return null;

  const syncButton = (
    <Button
      type="button"
      variant={"outline"}
      size="sm"
      className={cn(
        "h-7 gap-2 px-2 text-xs",
        syncAlert && "!border-destructive",
      )}
      onClick={onClick}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : syncAlert ? (
        <OctagonAlert className="h-3.5 w-3.5 text-destructive animate-scale-pulse" />
      ) : (
        <RefreshCw className="h-3.5 w-3.5" />
      )}
      Sync to Galaxy
    </Button>
  );

  return (
    <section className="flex items-center">
      {!syncAlert ? (
        syncButton
      ) : (
        <div>
          <Tooltip>
            <TooltipTrigger asChild>{syncButton}</TooltipTrigger>
            <TooltipContent
              className="max-w-xs text-wrap"
              variant="destructive"
            >
              {alertText}
            </TooltipContent>
          </Tooltip>
        </div>
      )}
    </section>
  );
}
