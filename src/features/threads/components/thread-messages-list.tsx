"use client";

import { MessageSquare } from "lucide-react";
import type { RefObject } from "react";

import type { ThreadMessage } from "@/service/application-threads.service";
import { cn } from "@/shared/lib/utils";

import EmptyState from "./empty-state";
import MessageBubble from "./message-bubble";

type ThreadMessagesListProps = {
  messages: ThreadMessage[];
  currentUserRole?: string | null;
  endRef?: RefObject<HTMLDivElement | null>;
  className?: string;
  emptyText?: string;
};

export default function ThreadMessagesList({
  messages,
  currentUserRole,
  endRef,
  className,
  emptyText = "No messages",
}: ThreadMessagesListProps) {
  return (
    <div className={cn("flex-1 overflow-y-auto p-4 bg-muted/10", className)}>
      {messages.length === 0 ? (
        <EmptyState icon={MessageSquare} text={emptyText} />
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isSelf={Boolean(currentUserRole && msg.author_role === currentUserRole)}
            />
          ))}
          <div ref={endRef} />
        </div>
      )}
    </div>
  );
}
