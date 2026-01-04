"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useAddThreadMessageMutation,
  useApplicationThreadsQuery,
} from "@/hooks/application-threads.hook";
import { SendHorizonal } from "lucide-react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LoadingState } from "../states";
import UrlDrivenSheet from "../../../../../../components/shared/url-driven-sheet";

const formatDateTime = (dateString?: string | null) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ThreadMessagesPanel = () => {
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const applicationId = searchParams.get("applicationId") ?? "";
  const threadId = searchParams.get("threadId") ?? "";
  const isOpen = searchParams.get("view") === "message";

  const { data, isLoading, error } = useApplicationThreadsQuery(applicationId);
  const addMessage = useAddThreadMessageMutation(applicationId, threadId);

  const [message, setMessage] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const thread = data?.data?.find((t) => t.id === threadId);
  const messages = thread?.messages || [];
  const userEmail = session?.user?.email;

  useEffect(() => {
    if (isOpen) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isOpen, messages.length]);

  const handleSend = async () => {
    const text = message.trim();
    if (!text || !applicationId || !threadId) return;
    await addMessage.mutateAsync(text);
    setMessage("");
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
      header={
        <>
          <p className="text-base font-medium">{thread.subject}</p>
          <p className="text-xs text-muted-foreground">
            {thread.issue_type} · {thread.target_section}
          </p>
        </>
      }
      footer={
        <div className="flex items-center gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="text-sm"
          />
          <Button
            onClick={handleSend}
            disabled={addMessage.isPending}
            size="sm"
          >
            <SendHorizonal className="h-3.5 w-3.5" />
          </Button>
        </div>
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
                      <span>·</span>
                      <span>{formatDateTime(msg.created_at)}</span>
                    </div>
                    <p className="text-sm leading-snug break-words">
                      {msg.message}
                    </p>
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
