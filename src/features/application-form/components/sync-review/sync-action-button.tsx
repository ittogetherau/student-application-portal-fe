"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2, OctagonAlert, RefreshCw } from "lucide-react";
import type { SyncMetadataItem } from "./sync-metadata-note";

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
  const hasError = !!syncMeta.last_error;
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

  // Show an alert icon when out-of-date OR errored.
  const showAlertIcon = !isUpToDate || hasError;
  const alertText = hasError
    ? syncMeta.last_error
    : "Out of date in Galaxy. Please sync to Galaxy.";

  return (
    <section className="flex items-center">
      {!showAlertIcon ? null : (
        <div className="animate-scale-pulse">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-destructive"
              >
                <OctagonAlert />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-wrap">
              {alertText}
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      {!showSyncButton ? null : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 gap-1 px-2 text-xs"
          onClick={onClick}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          Sync to Galaxy
        </Button>
      )}
    </section>
  );
}
