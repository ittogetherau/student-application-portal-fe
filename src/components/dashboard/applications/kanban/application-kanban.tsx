"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ApplicationTableRow, APPLICATION_STAGE } from "@/constants/types";
import applicationService from "@/service/application.service";
import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { arrayMove } from "@dnd-kit/sortable";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { KanbanColumns } from "./kanban-columns";

interface ApplicationKanbanProps {
  data: ApplicationTableRow[];
  isallowMovingInKanban: boolean;
}

function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

const STAGES: APPLICATION_STAGE[] = [
  APPLICATION_STAGE.DRAFT,
  APPLICATION_STAGE.SUBMITTED,
  APPLICATION_STAGE.IN_REVIEW,
  APPLICATION_STAGE.OFFER_LETTER,
  APPLICATION_STAGE.GS_ASSESSMENT,
  APPLICATION_STAGE.COE_ISSUED,
];

const STAGE_LABELS = {
  [APPLICATION_STAGE.DRAFT]: "Draft",
  [APPLICATION_STAGE.SUBMITTED]: "Submitted",
  [APPLICATION_STAGE.IN_REVIEW]: "In Review",
  [APPLICATION_STAGE.OFFER_LETTER]: "Offer Letter",
  [APPLICATION_STAGE.GS_ASSESSMENT]: "GS Assessment",
  [APPLICATION_STAGE.COE_ISSUED]: "COE Issued",
} satisfies Partial<Record<APPLICATION_STAGE, string>>;

const STAGE_COLORS = {
  [APPLICATION_STAGE.DRAFT]: "bg-gray-500",
  [APPLICATION_STAGE.SUBMITTED]: "bg-blue-500",
  [APPLICATION_STAGE.IN_REVIEW]: "bg-yellow-500",
  [APPLICATION_STAGE.OFFER_LETTER]: "bg-orange-500",
  [APPLICATION_STAGE.GS_ASSESSMENT]: "bg-cyan-500",
  [APPLICATION_STAGE.COE_ISSUED]: "bg-emerald-500",
} satisfies Partial<Record<APPLICATION_STAGE, string>>;

const STAGE_BACKGROUNDS = {
  [APPLICATION_STAGE.DRAFT]: "bg-gray-500/5",
  [APPLICATION_STAGE.SUBMITTED]: "bg-blue-500/5",
  [APPLICATION_STAGE.IN_REVIEW]: "bg-yellow-500/5",
  [APPLICATION_STAGE.OFFER_LETTER]: "bg-orange-500/5",
  [APPLICATION_STAGE.GS_ASSESSMENT]: "bg-cyan-500/5",
  [APPLICATION_STAGE.COE_ISSUED]: "bg-emerald-500/5",
} satisfies Partial<Record<APPLICATION_STAGE, string>>;

const getStageLabel = (stage: APPLICATION_STAGE) =>
  (STAGE_LABELS as Partial<Record<APPLICATION_STAGE, string>>)[stage] ??
  "Updated";

const getStageColor = (stage: APPLICATION_STAGE) =>
  (STAGE_COLORS as Partial<Record<APPLICATION_STAGE, string>>)[stage] ??
  "bg-slate-500";

const getStageBackground = (stage: APPLICATION_STAGE) =>
  (STAGE_BACKGROUNDS as Partial<Record<APPLICATION_STAGE, string>>)[stage] ??
  "";

export function ApplicationKanban({
  data,
  isallowMovingInKanban,
}: ApplicationKanbanProps) {
  const [applications, setApplications] =
    useState<ApplicationTableRow[]>(data);
  const [activeApplication, setActiveApplication] =
    useState<ApplicationTableRow | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    setApplications(data);
  }, [data]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: isTouchDevice() ? 10 : 5,
        delay: isTouchDevice() ? 100 : 0,
        tolerance: 5,
      },
    })
  );

  const onDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const activeId = active.id as string;

      if (active.data.current?.type === "Application") {
        const application = applications.find((app) => app.id === activeId);
        if (application) {
          setActiveApplication(application);
          document.body.classList.add("dragging-application");
        }
      }
    },
    [applications]
  );

  const onDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over || !isallowMovingInKanban) return;

      const activeId = active.id as string;
      if (active.data.current?.type !== "Application") return;

      const activeApplication = applications.find((app) => app.id === activeId);
      if (!activeApplication) return;

      const isOverColumn = over.data.current?.type === "StatusColumn";
      const overStage = isOverColumn
        ? (over.id as APPLICATION_STAGE)
        : (over.data.current?.stage as APPLICATION_STAGE | undefined);

      if (!overStage || activeApplication.stage === overStage) return;

      setApplications((prev) =>
        prev.map((app) =>
          app.id === activeId ? { ...app, stage: overStage } : app
        )
      );
    },
    [applications, isallowMovingInKanban]
  );

  const onDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      document.body.classList.remove("dragging-application");

      if (!over || !isallowMovingInKanban) {
        setActiveApplication(null);
        setApplications(data);
        return;
      }

      const activeId = active.id as string;
      const activeApp = applications.find((app) => app.id === activeId);

      if (!activeApp || active.data.current?.type !== "Application") {
        setActiveApplication(null);
        return;
      }

      const isOverColumn = over.data.current?.type === "StatusColumn";
      const overStage = isOverColumn
        ? (over.id as APPLICATION_STAGE)
        : (over.data.current?.stage as APPLICATION_STAGE | undefined);

      if (!overStage || activeApp.stage === overStage) {
        setActiveApplication(null);
        return;
      }

      if (activeApp.stage === overStage) {
        const sourceColumn = applications.filter(
          (app) => app.stage === overStage
        );
        const activeIndex = sourceColumn.findIndex(
          (app) => app.id === activeId
        );
        const overIndex = sourceColumn.findIndex(
          (app) => app.id === (over.id as string)
        );

        if (activeIndex !== overIndex && overIndex !== -1) {
          const reordered = arrayMove(sourceColumn, activeIndex, overIndex);
          setApplications((prev) => {
            const otherApps = prev.filter((app) => app.stage !== overStage);
            return [...otherApps, ...reordered];
          });
        }
        setActiveApplication(null);
        return;
      }

      try {
        const response = await applicationService.updateApplication(activeId, {
          stage: overStage,
        });

        if (response.success) {
          setApplications((prev) =>
            prev.map((app) =>
              app.id === activeId ? { ...app, stage: overStage } : app
            )
          );

          queryClient.invalidateQueries({
            queryKey: ["application-list"],
          });
          queryClient.invalidateQueries({
            queryKey: ["application-get", activeId],
          });

          const stageLabel = getStageLabel(overStage);
          toast.success(`Application moved to "${stageLabel}"`, {
            icon: "OK",
          });
        } else {
          throw new Error(response.message || "Failed to update application");
        }
      } catch (error) {
        setApplications(data);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to update application stage"
        );
      }

      setActiveApplication(null);
    },
    [applications, isallowMovingInKanban, data, queryClient]
  );

  const applicationsByStage = useMemo(() => {
    const grouped: Record<APPLICATION_STAGE, ApplicationTableRow[]> = {} as Record<
      APPLICATION_STAGE,
      ApplicationTableRow[]
    >;
    STAGES.forEach((stage) => {
      grouped[stage] = applications.filter((app) => app.stage === stage);
    });
    return grouped;
  }, [applications]);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      collisionDetection={closestCorners}
      modifiers={[restrictToWindowEdges]}
    >
      <div className="w-full overflow-x-auto pb-4 ">
        <div className="inline-flex gap-4 min-w-full ">
          {STAGES.map((stage) => (
            <KanbanColumns
              key={stage}
              stage={stage}
              applications={applicationsByStage[stage] || []}
              statusLabel={getStageLabel(stage)}
              statusColor={getStageColor(stage)}
              statusBackground={getStageBackground(stage)}
              isallowMovingInKanban={isallowMovingInKanban}
            />
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeApplication ? (
          <Card className="opacity-90 rotate-3 shadow-lg border-primary">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-sm mb-1">
                    {activeApplication.studentName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {activeApplication.course}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <Badge variant="outline" className="text-xs h-5">
                    {activeApplication.referenceNumber}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
