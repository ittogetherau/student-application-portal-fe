"use client";

import UrlDrivenSheet from "@/components/shared/url-driven-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { USER_ROLE } from "@/constants/types";
import {
  useAddThreadMessageMutation,
  useApplicationThreadsQuery,
  useUpdateThreadPriorityMutation,
  useUpdateThreadStatusMutation,
} from "@/hooks/application-threads.hook";
import { ListRestart, SendHorizonal, Verified } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { LoadingState } from "../states";

const formatDateTime = (dateString?: string | null) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const ThreadStatus = {
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
  const { data: session } = useSession();

  const applicationId = searchParams.get("applicationId") ?? "";
  const threadId = searchParams.get("threadId") ?? "";
  const isOpen = searchParams.get("view") === "message";

  const { data, isLoading, error } = useApplicationThreadsQuery(applicationId);
  const addMessage = useAddThreadMessageMutation(applicationId, threadId);
  const updateStatus = useUpdateThreadStatusMutation(applicationId, threadId);
  const updatePriority = useUpdateThreadPriorityMutation(
    applicationId,
    threadId
  );

  const [status, setStatus] = useState<ThreadStatusType>(ThreadStatus.pending);
  const [priority, setPriority] = useState<ThreadPriorityType>(
    ThreadPriority.medium
  );
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);

  const isCompleted = status === ThreadStatus.completed;

  const endRef = useRef<HTMLDivElement>(null);

  const thread = data?.data?.find((t) => t.id === threadId);
  const messages = thread?.messages || [];
  const userEmail = session?.user?.email;
  const userRole = session?.user?.role;

  useEffect(() => {
    if (isOpen) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isOpen, messages.length]);

  useEffect(() => {
    (() => {
      if (thread?.status) setStatus(thread.status as ThreadStatusType);
      if (thread?.priority) setPriority(thread.priority as ThreadPriorityType);
    })();
  }, [thread?.status, thread?.priority]);

  useEffect(() => {
    (() => {
      setAttachments([]);
      setMessage("");
    })();
  }, [threadId, isOpen]);

  const handleSend = async () => {
    if (isCompleted || addMessage.isPending) return;
    const text = message.trim();
    if ((!text && attachments.length === 0) || !applicationId || !threadId)
      return;
    if (attachments.length > 0 && !text) {
      toast.error("Please add a message when uploading attachments.");
      return;
    }
    const messageToSend = text;
    await addMessage.mutateAsync({ message: messageToSend, attachments });
    setMessage("");
    setAttachments([]);
  };

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
        <p className="text-xs text-muted-foreground">
          {thread.issue_type} - {thread.target_section} - {thread.status}
        </p>
      }
      footer={
        <section className="space-y-2">
          {userRole === USER_ROLE.STAFF && (
            <div className="flex flex-wrap gap-3">
              <div className="flex flex-col gap-1">
                <div className="text-[11px] font-medium text-muted-foreground">
                  <span>Status</span>
                </div>
                <Select
                  value={status}
                  onValueChange={(v) =>
                    handleStatusChange(v as ThreadStatusType)
                  }
                  disabled={updateStatus.isPending}
                >
                  <SelectTrigger className="w-32 h-6 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    {Object.values(ThreadStatus).map((value) => (
                      <SelectItem key={value} value={value} className="text-xs">
                        {value.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <div className="text-[11px] font-medium text-muted-foreground">
                  <span>Priority</span>
                </div>
                <Select
                  value={priority}
                  onValueChange={(v) =>
                    handlePriorityChange(v as ThreadPriorityType)
                  }
                  disabled={updatePriority.isPending}
                >
                  <SelectTrigger className="w-32 h-6 text-xs">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    {Object.values(ThreadPriority).map((value) => (
                      <SelectItem key={value} value={value} className="text-xs">
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Input
              disabled={isCompleted || addMessage.isPending}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message"
              onKeyDown={(e) => {
                if (isCompleted) return;
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="text-sm flex-1"
            />
          </div>
          {/* <ThreadAttachmentInput  attachments={attachments}  onChange={setAttachments}  disabled={isCompleted || addMessage.isPending}/> */}

          <div className="flex items-center justify-between gap-2">
            {userRole === USER_ROLE.STAFF ? (
              <Button
                onClick={() =>
                  handleStatusChange(
                    isCompleted ? ThreadStatus.pending : ThreadStatus.completed
                  )
                }
                size="sm"
                variant={isCompleted ? "secondary" : "outline"}
              >
                {isCompleted ? <ListRestart /> : <Verified />}
                {isCompleted ? "Reopen Thread" : "Mark As Resolved"}
              </Button>
            ) : (
              <span></span>
            )}

            <Button
              onClick={handleSend}
              disabled={isCompleted || addMessage.isPending}
              size="sm"
            >
              Send Message
              <SendHorizonal className="h-3.5 w-3.5" />
            </Button>
          </div>
        </section>
      }
    >
      <div className="flex flex-col-reverse gap-2">
        <div ref={endRef} />
        {messages.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-6">
            No messages
          </div>
        ) : (
          messages.toReversed().map((msg) => {
            const isUser = msg.author_email === userEmail;
            return (
              <div
                key={msg.id}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div className="max-w-xl">
                  <div
                    className={`rounded border px-2.5 py-1.5 ${
                      isUser
                        ? "bg-muted/40 border-muted"
                        : "bg-primary/5 border-primary/20"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-0.5">
                      <span className="font-medium">
                        {msg.author_name || msg.author_email.split("@")[0]}
                      </span>
                      <span>-</span>
                      <span>{formatDateTime(msg.created_at)}</span>
                    </div>
                    {msg.message && (
                      <p className="text-sm leading-snug break-words">
                        {msg.message}
                      </p>
                    )}
                    {msg.attachments?.length ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {msg.attachments.map((attachment, idx) => (
                          <a
                            key={attachment.id ?? `${attachment.url}-${idx}`}
                            href={attachment.url}
                            target="_blank"
                            rel="noreferrer"
                            className="block h-20 w-20 overflow-hidden rounded border bg-background"
                          >
                            <Image
                              width={40}
                              height={40}
                              src={attachment.url}
                              alt={
                                attachment.file_name || `Attachment ${idx + 1}`
                              }
                              className="h-full w-full object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </UrlDrivenSheet>
  );
};

export default ThreadMessagesPanel;
