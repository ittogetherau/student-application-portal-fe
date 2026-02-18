import {
  ApplicationTableRow,
  APPLICATION_STAGE,
  USER_ROLE,
} from "@/shared/constants/types";
import { type KeyboardEvent, useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import { getRoleStatusLabel } from "@/shared/config/application-stage.config";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ChevronDown } from "lucide-react";

import { ApplicationCard } from "./application-card";

export function KanbanColumns({
  stage,
  applications,
  role,
  statusBackground,
  isallowMovingInKanban,
  isCollapsed,
  onToggleCollapse,
}: {
  stage: APPLICATION_STAGE;
  applications: ApplicationTableRow[];
  role?: USER_ROLE | string;
  statusBackground: string;
  isallowMovingInKanban: boolean;
  isCollapsed: boolean;
  onToggleCollapse: (stage: APPLICATION_STAGE) => void;
}) {
  const applicationIds = useMemo(
    () => applications.map((app) => app.id),
    [applications],
  );
  const statusLabel =
    getRoleStatusLabel(stage, role) ??
    getRoleStatusLabel(stage, USER_ROLE.STAFF) ??
    stage;
  const onHeaderKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onToggleCollapse(stage);
  };

  const { setNodeRef, isOver } = useDroppable({
    id: stage,
    data: {
      type: "StatusColumn",
      stage,
    },
    disabled: !isallowMovingInKanban,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "shrink-0 rounded-lg transition-all duration-200",
        isCollapsed ? "w-14 p-2" : "w-[320px] p-3",
        statusBackground,
        isOver && isallowMovingInKanban && "ring-2 ring-primary ring-offset-2",
      )}
      data-stage={stage}
    >
      <div
        className={cn(
          "bg-background/50 rounded-lg border cursor-pointer",
          isCollapsed ? "h-[calc(100vh-220px)] p-2 mb-0" : "p-3 mb-3",
        )}
        onClick={() => onToggleCollapse(stage)}
        onKeyDown={onHeaderKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`${isCollapsed ? "Expand" : "Collapse"} ${statusLabel} column`}
        aria-expanded={!isCollapsed}
      >
        {isCollapsed ? (
          <div className="flex h-full flex-col items-center justify-between gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-background/70">
              <ChevronDown className="-rotate-90 h-4 w-4" />
            </span>
            <h3 className="text-xs font-medium [writing-mode:vertical-rl] rotate-180">
              {statusLabel}
            </h3>
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
              {applications.length}
            </Badge>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-sm">{statusLabel}</h3>
            <Badge variant="secondary" className="ml-auto text-xs h-5">
              {applications.length}
            </Badge>
            <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-background/70">
              <ChevronDown className="h-4 w-4 transition-transform duration-200" />
            </span>
          </div>
        )}
      </div>
      {!isCollapsed && (
        <SortableContext
          items={applicationIds}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2.5 max-h-[calc(100vh-300px)] overflow-y-auto pr-1 small-sidebar-width">
            {applications.map((app) => (
              <ApplicationCard
                key={app.id}
                app={app}
                isallowMovingInKanban={isallowMovingInKanban}
              />
            ))}
            {applications.length === 0 && (
              <div className="rounded-lg bg-background/30 p-8 text-center border border-dashed">
                <p className="text-xs text-muted-foreground">No applications</p>
              </div>
            )}
          </div>
        </SortableContext>
      )}
    </div>
  );
}
