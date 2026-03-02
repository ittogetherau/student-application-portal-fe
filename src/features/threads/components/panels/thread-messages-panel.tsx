"use client";

import UrlDrivenSheet from "@/components/shared/url-driven-sheet";
import { LoadingState } from "@/components/ui-kit/states";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ThreadMessageComposer from "@/features/threads/components/thread-message-composer";
import ThreadMessagesList from "@/features/threads/components/thread-messages-list";
import { USER_ROLE } from "@/shared/constants/types";
import { useRoleFlags } from "@/shared/hooks/use-role-flags";
import { ListRestart, Verified } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  useApplicationThreadQuery,
  useUpdateThreadPriorityMutation,
  useUpdateThreadStatusMutation,
} from "../../hooks/application-threads.hook";

const formatContactName = (name?: string | null, email?: string | null) => {
  if (name) return name;
  if (email) return email.split("@")[0];
  return "N/A";
};

const formatContactEmail = (email?: string | null) => email || "N/A";

const ThreadStatus = {
  pending: "pending",
  under_review: "under_review",
  completed: "completed",
} as const;

type ThreadStatusType = (typeof ThreadStatus)[keyof typeof ThreadStatus];
const ThreadPriority = {
  high: "high",
  medium: "medium",
  low: "low",
} as const;
type ThreadPriorityType = (typeof ThreadPriority)[keyof typeof ThreadPriority];

const ThreadMessagesPanel = () => {
  const searchParams = useSearchParams();
  const { role: userRole } = useRoleFlags();

  const applicationId = searchParams.get("applicationId");
  const threadId = searchParams.get("threadId");
  const isOpen = searchParams.get("view") === "message";

  const { data, isLoading, error } = useApplicationThreadQuery(
    isOpen ? applicationId : null,
    isOpen ? threadId : null,
  );
  const updateStatus = useUpdateThreadStatusMutation(applicationId, threadId);
  const updatePriority = useUpdateThreadPriorityMutation(
    applicationId,
    threadId,
  );

  const [status, setStatus] = useState<ThreadStatusType>(ThreadStatus.pending);
  const [priority, setPriority] = useState<ThreadPriorityType>(
    ThreadPriority.medium,
  );

  const isCompleted = status === ThreadStatus.completed;

  const endRef = useRef<HTMLDivElement>(null);

  const thread = data?.data ?? null;
  const messages = thread?.messages || [];
  const agentContact = thread?.agent;
  const staffContact = thread?.assigned_staff;

  useEffect(() => {
    if (isOpen) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isOpen, messages.length]);

  useEffect(() => {
    (() => {
      if (thread?.status) setStatus(thread.status as ThreadStatusType);
      if (thread?.priority) setPriority(thread.priority as ThreadPriorityType);
    })();
  }, [thread?.status, thread?.priority]);

  const handleStatusChange = async (value: ThreadStatusType) => {
    setStatus(value);
    try {
      await updateStatus.mutateAsync(value);
    } catch (err) {
      console.error("[ThreadMessagesPanel] update status failed", err);
      if (thread?.status) setStatus(thread.status as ThreadStatusType);
    }
  };

  const handlePriorityChange = async (value: ThreadPriorityType) => {
    setPriority(value);
    try {
      await updatePriority.mutateAsync(value);
    } catch (err) {
      console.error("[ThreadMessagesPanel] update priority failed", err);
      if (thread?.priority) setPriority(thread.priority as ThreadPriorityType);
    }
  };

  if (!isOpen || !applicationId || !threadId) {
    return (
      <UrlDrivenSheet clearKeysOnClose={["view", "applicationId", "threadId"]}>
        <div className="text-sm text-muted-foreground py-6 text-center">
          Open a thread to view messages.
        </div>
      </UrlDrivenSheet>
    );
  }

  if (isLoading) {
    return (
      <UrlDrivenSheet clearKeysOnClose={["view", "applicationId", "threadId"]}>
        <LoadingState />
      </UrlDrivenSheet>
    );
  }

  if (error || !thread) {
    return (
      <UrlDrivenSheet clearKeysOnClose={["view", "applicationId", "threadId"]}>
        <div className="text-sm text-muted-foreground py-6 text-center">
          Unable to load thread.
        </div>
      </UrlDrivenSheet>
    );
  }

  return (
    <UrlDrivenSheet
      clearKeysOnClose={["view", "applicationId", "threadId"]}
      title={thread.subject}
      header={
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {thread.issue_type} - {thread.target_section} - {status}
          </p>
          <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
            <div>
              <p className="text-[11px] uppercase text-muted-foreground">
                Agent
              </p>
              <p className="text-sm font-medium text-foreground">
                {formatContactName(agentContact?.name, agentContact?.email)}
              </p>
              <p className="break-all">
                {formatContactEmail(agentContact?.email)}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase text-muted-foreground">
                Staff
              </p>
              <p className="text-sm font-medium text-foreground">
                {formatContactName(staffContact?.name, staffContact?.email)}
              </p>
              <p className="break-all">
                {formatContactEmail(staffContact?.email)}
              </p>
            </div>
          </div>
        </div>
      }
      footer={
        <section className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            {userRole === USER_ROLE.STAFF ? (
              <div className="flex items-end gap-2">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Select
                    value={status}
                    onValueChange={(v) =>
                      handleStatusChange(v as ThreadStatusType)
                    }
                    disabled={updateStatus.isPending}
                  >
                    <SelectTrigger className="h-9 text-xs w-full capitalize">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="text-xs capitalize">
                      {Object.values(ThreadStatus).map((value) => (
                        <SelectItem
                          key={value}
                          value={value}
                          className="text-xs"
                        >
                          {value.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Priority</p>
                  <Select
                    value={priority}
                    onValueChange={(v) =>
                      handlePriorityChange(v as ThreadPriorityType)
                    }
                    disabled={updatePriority.isPending}
                  >
                    <SelectTrigger className="h-9 text-xs w-full capitalize">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent className="text-xs capitalize">
                      {Object.values(ThreadPriority).map((value) => (
                        <SelectItem
                          key={value}
                          value={value}
                          className="text-xs"
                        >
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={() =>
                    handleStatusChange(
                      isCompleted
                        ? ThreadStatus.pending
                        : ThreadStatus.completed,
                    )
                  }
                  variant={isCompleted ? "secondary" : "outline"}
                  disabled={updateStatus.isPending}
                >
                  {isCompleted ? <ListRestart /> : <Verified />}
                  {isCompleted ? "Reopen Thread" : "Mark As Resolved"}
                </Button>
              </div>
            ) : (
              <span />
            )}
          </div>

          <ThreadMessageComposer
            key={`${threadId}-${isOpen}`}
            applicationId={applicationId}
            threadId={threadId}
            disabled={isCompleted}
          />
        </section>
      }
    >
      <ThreadMessagesList
        messages={messages}
        endRef={endRef}
        currentUserRole={userRole}
        className="flex-none overflow-visible p-0 bg-transparent"
      />
    </UrlDrivenSheet>
  );
};

export default ThreadMessagesPanel;
