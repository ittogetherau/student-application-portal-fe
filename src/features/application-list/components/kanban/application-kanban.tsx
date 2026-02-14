"use client";

import {
  APPLICATION_KANBAN_STAGES,
  getRoleStageLabel,
  getStageKanbanBackground,
  getStageKanbanColor,
  getStageLabel,
} from "@/shared/config/application-stage.config";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import applicationService from "@/service/application.service";
import {
  APPLICATION_STAGE,
  ApplicationTableRow,
  USER_ROLE,
} from "@/shared/constants/types";
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
import { useSession } from "next-auth/react";
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

const getKanbanStageLabel = (stage: APPLICATION_STAGE, role?: USER_ROLE | string) =>
  getRoleStageLabel(stage, role) ?? getStageLabel(stage);

export function ApplicationKanban({
  data,
  isallowMovingInKanban,
}: ApplicationKanbanProps) {
  const { data: session } = useSession();
  const [applications, setApplications] = useState<ApplicationTableRow[]>(data);
  const [activeApplication, setActiveApplication] =
    useState<ApplicationTableRow | null>(null);
  const queryClient = useQueryClient();
  const role = useMemo(() => {
    const value = session?.user.role;
    return Object.values(USER_ROLE).includes(value as USER_ROLE)
      ? (value as USER_ROLE)
      : undefined;
  }, [session?.user.role]);

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
    }),
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
    [applications],
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
          app.id === activeId ? { ...app, stage: overStage } : app,
        ),
      );
    },
    [applications, isallowMovingInKanban],
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
          (app) => app.stage === overStage,
        );
        const activeIndex = sourceColumn.findIndex(
          (app) => app.id === activeId,
        );
        const overIndex = sourceColumn.findIndex(
          (app) => app.id === (over.id as string),
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
              app.id === activeId ? { ...app, stage: overStage } : app,
            ),
          );

          queryClient.invalidateQueries({
            queryKey: ["application-list"],
          });
          queryClient.invalidateQueries({
            queryKey: ["application-get", activeId],
          });

          const stageLabel = getStageLabel(overStage, role);
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
            : "Failed to update application stage",
        );
      }

      setActiveApplication(null);
    },
    [applications, isallowMovingInKanban, data, queryClient, role],
  );

  const applicationsByStage = useMemo(() => {
    const grouped: Record<APPLICATION_STAGE, ApplicationTableRow[]> =
      {} as Record<APPLICATION_STAGE, ApplicationTableRow[]>;
    APPLICATION_KANBAN_STAGES.forEach((stage) => {
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
          {APPLICATION_KANBAN_STAGES.map((stage) => (
            <KanbanColumns
              key={stage}
              stage={stage}
              applications={applicationsByStage[stage] || []}
              statusLabel={getKanbanStageLabel(stage, role)}
              statusColor={getStageKanbanColor(stage)}
              statusBackground={getStageKanbanBackground(stage)}
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
