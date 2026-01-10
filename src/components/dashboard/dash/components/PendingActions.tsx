"use client";

import { FileText, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface PendingAction {
  id: number;
  type: "document" | "request";
  title: string;
  student: string;
  applicationId: string;
  university: string;
  deadline: string;
  priority: "high" | "medium" | "low";
  universityComment: string;
}

interface PendingActionsProps {
  pendingActions: PendingAction[];
}

export function PendingActions({
  pendingActions,
}: PendingActionsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Pending Actions</CardTitle>
          <Badge variant="destructive">{pendingActions.length} items</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pendingActions.map((action) => (
            <div
              key={action.id}
              className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950 transition-all cursor-pointer"
            >
              <div
                className={`p-2 rounded-lg ${
                  action.type === "document"
                    ? "bg-blue-100 dark:bg-blue-900"
                    : "bg-purple-100 dark:bg-purple-900"
                }`}
              >
                {action.type === "document" ? (
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                ) : (
                  <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{action.title}</p>
                      <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
                        {action.applicationId}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {action.student} • {action.university}
                    </p>
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950 border-l-2 border-blue-400 rounded">
                      <p className="text-xs text-foreground italic">
                        <span className="font-medium text-blue-700 dark:text-blue-400">
                          University:
                        </span>{" "}
                        {action.universityComment}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      variant={
                        action.priority === "high"
                          ? "destructive"
                          : action.priority === "medium"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {action.deadline}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
