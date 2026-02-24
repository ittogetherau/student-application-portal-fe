"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useApplicationThreadsQuery,
  useUpdateThreadPriorityMutation,
  useUpdateThreadStatusMutation,
} from "@/features/threads/hooks/application-threads.hook";
import { siteRoutes } from "@/shared/constants/site-routes";
import { USER_ROLE } from "@/shared/constants/types";
import { useRoleFlags } from "@/shared/hooks/use-role-flags";
import { formatUtcToFriendlyLocal } from "@/shared/lib/format-utc-to-local";
import { Eye, ListRestart, Verified } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

const formatContactName = (name?: string | null, email?: string | null) => {
  if (name) return name;
  if (email) return email.split("@")[0];
  return "N/A";
};

const formatContactEmail = (email?: string | null) => email || "N/A";

type TasksDetailsSidebarProps = {
  selectedApplicationId: string | null;
  selectedThreadId: string | null;
};

export default function TasksDetailsSidebar({
  selectedApplicationId,
  selectedThreadId,
}: TasksDetailsSidebarProps) {
  const { role } = useRoleFlags();
  const { data, isLoading, error } = useApplicationThreadsQuery(
    selectedApplicationId,
  );

  const selectedThread = useMemo(() => {
    if (!selectedThreadId) return null;
    return data?.data?.find((t) => t.id === selectedThreadId) ?? null;
  }, [data?.data, selectedThreadId]);

  const updateStatus = useUpdateThreadStatusMutation(
    selectedApplicationId,
    selectedThreadId,
  );
  const updatePriority = useUpdateThreadPriorityMutation(
    selectedApplicationId,
    selectedThreadId,
  );

  const canUpdateStatus = !!selectedThreadId && !!selectedApplicationId;
  const isThreadCompleted = selectedThread?.status === "completed";
  const agentContact = selectedThread?.agent;
  const staffContact = selectedThread?.assigned_staff;

  return (
    <aside className="col-span-2 border-l bg-muted/20 overflow-y-auto">
      <div className="p-4">
        <h3 className="text-sm font-semibold mb-3">Thread Details</h3>
        {isLoading ? (
          <div className="text-xs text-muted-foreground">Loading...</div>
        ) : error ? (
          <div className="text-xs text-destructive">Load failed</div>
        ) : selectedThread ? (
          <div className="space-y-4 text-xs">
            <div>
              <p className="text-muted-foreground mb-1">Agent</p>
              <p className="font-medium">
                {formatContactName(agentContact?.name, agentContact?.email)}
              </p>
              <p className="text-muted-foreground break-all">
                {formatContactEmail(agentContact?.email)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Staff</p>
              <p className="font-medium">
                {formatContactName(staffContact?.name, staffContact?.email)}
              </p>
              <p className="text-muted-foreground break-all">
                {formatContactEmail(staffContact?.email)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Issue Type</p>
              <p className="font-medium">{selectedThread.issue_type || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Target Section</p>
              <p className="font-medium break-words">
                {selectedThread.target_section ||
                  selectedThread.application_id ||
                  "—"}
              </p>
            </div>

            {role === USER_ROLE.STAFF ? (
              <div>
                <p className="text-muted-foreground mb-1">Priority</p>
                <Select
                  value={selectedThread.priority}
                  onValueChange={(priority) => updatePriority.mutate(priority)}
                  disabled={updatePriority.isPending || !selectedApplicationId}
                >
                  <SelectTrigger className="h-8 text-xs w-full">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div>
                <p className="text-muted-foreground mb-1">Priority</p>
                <p className="font-medium text-xs break-words">
                  {selectedThread.priority}
                </p>
              </div>
            )}

            {role === USER_ROLE.STAFF ? (
              <div>
                <p className="text-muted-foreground mb-1">Status</p>
                <Select
                  value={selectedThread.status}
                  onValueChange={(status) => updateStatus.mutate(status)}
                  disabled={updateStatus.isPending || !selectedApplicationId}
                >
                  <SelectTrigger className="h-8 text-xs w-full">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div>
                <p className="text-muted-foreground mb-1">Status</p>
                <p className="font-medium text-xs break-words">
                  {selectedThread.status}
                </p>
              </div>
            )}

            {role === USER_ROLE.STAFF ? (
              <div>
                <Button
                  onClick={() =>
                    updateStatus.mutate(
                      isThreadCompleted ? "pending" : "completed",
                    )
                  }
                  size="sm"
                  variant={isThreadCompleted ? "secondary" : "outline"}
                  disabled={!canUpdateStatus || updateStatus.isPending}
                  className="w-full"
                >
                  {isThreadCompleted ? (
                    <ListRestart className="h-4 w-4 mr-2" />
                  ) : (
                    <Verified className="h-4 w-4 mr-2" />
                  )}
                  {isThreadCompleted ? "Reopen Thread" : "Mark As Resolved"}
                </Button>
              </div>
            ) : null}

            <div>
              <p className="text-muted-foreground mb-1">Last Updated</p>
              <p className="font-medium text-xs break-words">
                {formatUtcToFriendlyLocal(selectedThread.status_updated_at)}
              </p>
            </div>

            <div className="pt-2 border-t">
              {selectedApplicationId ? (
                <Link
                  href={siteRoutes.dashboard.application.id.details(
                    selectedApplicationId,
                  )}
                >
                  <Button size="sm" variant="outline" className="w-full">
                    <Eye /> View Application
                  </Button>
                </Link>
              ) : (
                <Button size="sm" variant="outline" className="w-full" disabled>
                  <Eye /> View Application
                </Button>
              )}
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Select a thread to view details
          </p>
        )}
      </div>
    </aside>
  );
}
