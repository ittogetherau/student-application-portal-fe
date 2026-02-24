"use client";

import Image from "next/image";

import { formatUtcToFriendlyLocal } from "@/shared/lib/format-utc-to-local";
import type { ThreadMessage } from "@/service/application-threads.service";

type MessageBubbleProps = {
  message: ThreadMessage;
  isSelf: boolean;
};

export default function MessageBubble({ message, isSelf }: MessageBubbleProps) {
  const authorLabel =
    message.author_name || message.author_email?.split("@")[0] || "User";

  return (
    <div className={`flex ${isSelf ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[75%] flex flex-col ${
          isSelf ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`w-full rounded-2xl px-4 py-2.5 ${
            isSelf ? "bg-primary text-primary-foreground" : "bg-muted border"
          }`}
        >
          <div className="flex items-center gap-1.5 mb-1 text-[10px] opacity-70">
            <span className="font-semibold truncate">{authorLabel}</span>
            <span>-</span>
            <span className="whitespace-nowrap">
              {message.created_at
                ? formatUtcToFriendlyLocal(message.created_at)
                : ""}
            </span>
          </div>
          {message.message ? (
            <p className="text-[13px] leTading-relaxed break-words whitespace-pre-wrap">
              {message.message}
            </p>
          ) : null}
        </div>

        {message.attachments?.length ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.attachments.map((attachment, idx) => (
              <a
                key={attachment.id ?? `${attachment.url}-${idx}`}
                href={attachment.url}
                target="_blank"
                rel="noreferrer"
                className="block h-20 w-20 overflow-hidden rounded-md border bg-primary"
              >
                <Image
                  width={350}
                  height={350}
                  src={attachment.url}
                  alt={attachment.file_name || `Attachment ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
