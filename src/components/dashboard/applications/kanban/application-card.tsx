import { StaffAssignmentSelect } from "@/app/dashboard/application/[id]/_components/StaffAssignmentSelect";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { siteRoutes } from "@/constants/site-routes";
import { ApplicationTableRow, USER_ROLE } from "@/constants/types";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Eye, GripVertical } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export function ApplicationCard({
  app,
  isallowMovingInKanban,
}: {
  app: ApplicationTableRow;
  isallowMovingInKanban: boolean;
}) {
  const { data: session } = useSession();
  const role = session?.user.role as USER_ROLE | undefined;
  const isStaffAdmin = session?.user.staff_admin;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: app.id,
    disabled: !isallowMovingInKanban,
    data: {
      type: "Application",
      application: app,
      status: app.stage,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="w-full">
      <Card
        className={cn(
          "hover:shadow-md transition-shadow cursor-pointer border-border/40 w-full",
          isDragging && "ring-2 ring-primary",
        )}
      >
        <CardContent className="p-2.5 sm:p-3">
          <div className="space-y-2">
            <div className="min-w-0">
              <p
                className="font-medium text-xs sm:text-sm mb-0.5 truncate"
                title={app.studentName}
              >
                {app.studentName}
              </p>
              {app.studentEmail ? (
                <p
                  className="text-[10px] sm:text-xs text-muted-foreground truncate"
                  title={app.studentEmail}
                >
                  {app.studentEmail}
                </p>
              ) : null}
              {app.studentId ? (
                <p
                  className="text-[10px] sm:text-xs text-muted-foreground truncate"
                  title={app.studentId}
                >
                  ID: {app.studentId}
                </p>
              ) : null}
              <p
                className="text-[10px] sm:text-xs text-muted-foreground truncate"
                title={app.course}
              >
                {app.course}
              </p>
              {(app.courseCode || app.intake) && (
                <p
                  className="text-[10px] sm:text-xs text-muted-foreground truncate"
                  title={`${app.courseCode || "N/A"} · ${app.intake || "N/A"}`}
                >
                  {app.courseCode || "N/A"} · {app.intake || "N/A"}
                </p>
              )}
            </div>

            {role === USER_ROLE.STAFF ? (
              <div className="text-[10px] sm:text-xs text-muted-foreground truncate">
                {app.agentAgencyName || app.agentName || app.agentEmail ? (
                  <>
                    <span className="font-medium text-foreground/80">
                      Agent:
                    </span>{" "}
                    {app.agentAgencyName || app.agentName || "N/A"}
                    {app.agentEmail ? ` · ${app.agentEmail}` : ""}
                  </>
                ) : (
                  <span>Agent: N/A</span>
                )}
              </div>
            ) : null}

            {isStaffAdmin ? (
              <div onClick={(event) => event.stopPropagation()}>
                <StaffAssignmentSelect
                  applicationId={app.id}
                  assignedStaffId={app.assignedStaffId ?? undefined}
                  assignedStaffEmail={app.assignedStaffName || undefined}
                />
              </div>
            ) : app.assignedStaffName ? (
              <p
                className="text-[10px] sm:text-xs text-muted-foreground truncate"
                title={app.assignedStaffName}
              >
                Staff: {app.assignedStaffName}
              </p>
            ) : null}

            <div className="flex items-center gap-1.5 sm:gap-2 pt-0.5">
              {isallowMovingInKanban && (
                <div
                  {...attributes}
                  {...listeners}
                  className="cursor-grab active:cursor-grabbing touch-manipulation p-0.5 sm:p-1 hover:bg-muted rounded shrink-0"
                  aria-label="Drag to move application"
                >
                  <GripVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                </div>
              )}
              <Link
                href={`${siteRoutes.dashboard.application.root}/${app.id}`}
                className="flex-1 w-full"
              >
                <Button
                  variant="outline"
                  className="w-full text-xs flex"
                  size="sm"
                >
                  <Eye className="h-3 w-3 shrink-0" />
                  <span className="truncate">View</span>
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
