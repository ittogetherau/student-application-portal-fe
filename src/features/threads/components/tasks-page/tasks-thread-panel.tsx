"use client";

import ThreadAttachmentInput from "@/components/shared/thread-attachment-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EmptyState from "@/features/threads/components/empty-state";
import ThreadMessagesList from "@/features/threads/components/thread-messages-list";
import {
  useAddThreadMessageMutation,
  useApplicationThreadQuery,
} from "@/features/threads/hooks/application-threads.hook";
import { useRoleFlags } from "@/shared/hooks/use-role-flags";
import { Dot, Info, Send, Sparkles } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { toast } from "react-hot-toast";

type TasksThreadPanelProps = {
  selectedThreadId: string | null;
  selectedApplicationId: string | null;
  setDetailShown: Dispatch<SetStateAction<boolean>>;
};

export default function TasksThreadPanel({
  selectedThreadId,
  selectedApplicationId,
  setDetailShown,
}: TasksThreadPanelProps) {
  const { role } = useRoleFlags();

  const { data, isLoading, error } = useApplicationThreadQuery(
    selectedApplicationId,
    selectedThreadId,
  );

  const selectedThread = data?.data ?? null;

  const isThreadCompleted = selectedThread?.status === "completed";
  const addMessage = useAddThreadMessageMutation(
    selectedApplicationId,
    selectedThreadId,
  );

  const [composer, setComposer] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedThreadId, selectedThread?.messages?.length]);

  const handleSend = async () => {
    if (addMessage.isPending || isThreadCompleted) return;
    const text = composer.trim();
    if ((!text && attachments.length === 0) || !selectedThreadId) return;
    if (attachments.length > 0 && !text) {
      toast.error("Please add a message when uploading attachments.");
      return;
    }
    await addMessage.mutateAsync({ message: text, attachments });
    setComposer("");
    setAttachments([]);
  };

  if (!selectedThreadId || !selectedApplicationId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState icon={Sparkles} text="Select thread" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 border-b bg-background/95 backdrop-blur">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState icon={Sparkles} text="Load failed" />
      </div>
    );
  }

  if (!selectedThread) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState icon={Sparkles} text="Thread not found" />
      </div>
    );
  }

  const messages = selectedThread.messages ?? [];
  const composerDisabled =
    addMessage.isPending || !selectedApplicationId || isThreadCompleted;

  return (
    <>
      <div className="p-4 border-b bg-background/95 backdrop-blur">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-base mb-1 truncate">
              {selectedThread.subject}
            </h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground flex-wrap">
              <span>{selectedThread.issue_type || "Thread"}</span>
              <Dot size={16} />
              <span>
                {selectedThread.target_section ||
                  selectedThread.application_id ||
                  "Section"}
              </span>
            </div>
          </div>

          <Button
            onClick={() => setDetailShown((p) => !p)}
            variant={"secondary"}
            size={"icon-lg"}
          >
            <Info />
          </Button>
        </div>
      </div>

      <ThreadMessagesList
        messages={messages}
        endRef={endRef}
        currentUserRole={role}
      />

      <div className="p-4 border-t bg-background/95 backdrop-blur">
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

        <div className="mt-2">
          <ThreadAttachmentInput
            attachments={attachments}
            onChange={setAttachments}
            disabled={composerDisabled}
          />
        </div>
      </div>
    </>
  );
}
