"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { Send } from "lucide-react";

import ThreadAttachmentInput from "@/components/shared/thread-attachment-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAddThreadMessageMutation } from "@/features/threads/hooks/application-threads.hook";

type ThreadMessageComposerProps = {
  applicationId: string;
  threadId: string;
  disabled?: boolean;
};

export default function ThreadMessageComposer({
  applicationId,
  threadId,
  disabled = false,
}: ThreadMessageComposerProps) {
  const addMessage = useAddThreadMessageMutation(applicationId, threadId);

  const [composer, setComposer] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);

  const composerDisabled = disabled || addMessage.isPending;

  const handleSend = async () => {
    if (composerDisabled) return;
    const text = composer.trim();
    if ((!text && attachments.length === 0) || !applicationId || !threadId)
      return;
    if (attachments.length > 0 && !text) {
      toast.error("Please add a message when uploading attachments.");
      return;
    }
    await addMessage.mutateAsync({ message: text, attachments });
    setComposer("");
    setAttachments([]);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="Message..."
          value={composer}
          onChange={(e) => setComposer(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={composerDisabled}
          className="flex-1"
        />
        <Button
          onClick={handleSend}
          disabled={
            (!composer.trim() && attachments.length === 0) || composerDisabled
          }
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      <ThreadAttachmentInput
        attachments={attachments}
        onChange={setAttachments}
        disabled={composerDisabled}
      />
    </div>
  );
}
