"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { siteRoutes } from "@/constants/site-routes";
import {
  useAddThreadMessageMutation,
  useApplicationThreadsQuery,
  useStaffThreadsQuery,
  useUpdateThreadPriorityMutation,
  useUpdateThreadStatusMutation,
} from "@/hooks/application-threads.hook";
import type { StaffThreadSummary } from "@/service/application-threads.service";
import { CommunicationThread } from "@/service/application-threads.service";
import { Separator } from "@radix-ui/react-select";
import { MessageSquare, Send, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import ThreadAttachmentInput from "@/components/shared/thread-attachment-input";
import {
  EmptyState,
  formatDateTime,
  MessageBubble,
  ThreadListItem,
} from "./_components/general";

export default function TasksPage() {
  const { data: staffThreads, isLoading, error } = useStaffThreadsQuery();
  const staffThreadsList = useMemo(
    () => staffThreads?.data ?? [],
    [staffThreads]
  );

  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    string | null
  >(null);
  const [composer, setComposer] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);

  const applicationThreadsQuery = useApplicationThreadsQuery(
    selectedApplicationId
  );
  const applicationThreads = useMemo(
    () => applicationThreadsQuery.data?.data ?? [],
    [applicationThreadsQuery.data]
  );

  const addMessage = useAddThreadMessageMutation(
    selectedApplicationId,
    selectedThreadId
  );
  const updateStatus = useUpdateThreadStatusMutation(
    selectedApplicationId,
    selectedThreadId
  );
  const updatePriority = useUpdateThreadPriorityMutation(
    selectedApplicationId,
    selectedThreadId
  );
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedThreadId && staffThreadsList.length > 0) {
      setSelectedThreadId(staffThreadsList[0].id);
      setSelectedApplicationId(staffThreadsList[0].application_id);
    }
  }, [staffThreadsList, selectedThreadId]);

  useEffect(() => {
    setComposer("");
    setAttachments([]);
  }, [selectedThreadId]);

  const selectedThreadFromApp = useMemo(
    () => applicationThreads.find((t) => t.id === selectedThreadId) || null,
    [applicationThreads, selectedThreadId]
  );

  const selectedStaffThread = useMemo(
    () => staffThreadsList.find((t) => t.id === selectedThreadId) || null,
    [staffThreadsList, selectedThreadId]
  );

  const selectedThread: CommunicationThread | null = useMemo(() => {
    if (selectedThreadFromApp) return selectedThreadFromApp;
    if (selectedStaffThread) {
      return {
        ...selectedStaffThread,
        issue_type: "",
        target_section: "",
        messages: [],
      } as unknown as CommunicationThread;
    }
    return null;
  }, [selectedStaffThread, selectedThreadFromApp]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedThreadId, selectedThreadFromApp?.messages?.length]);

  const handleSelectThread = (thread: StaffThreadSummary) => {
    setSelectedThreadId(thread.id);
    setSelectedApplicationId(thread.application_id);
  };

  const handleSend = async () => {
    if (addMessage.isPending) return;
    const text = composer.trim();
    if (
      (!text && attachments.length === 0) ||
      !selectedThreadId ||
      !selectedApplicationId
    )
      return;
    if (attachments.length > 0 && !text) {
      toast.error("Please add a message when uploading attachments.");
      return;
    }
    const messageToSend = text;
    await addMessage.mutateAsync({ message: messageToSend, attachments });
    setComposer("");
    setAttachments([]);
  };

  const messages = selectedThreadFromApp?.messages ?? [];

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden bg-background">
      <div className="grid grid-cols-9 h-full">
        <aside className="col-span-2 border-r flex flex-col bg-muted/20 overflow-hidden">
          <div className="p-4 border-b bg-background/95 backdrop-blur">
            <h2 className="text-base font-semibold">Communication Threads</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {staffThreadsList.length}{" "}
              {staffThreadsList.length === 1 ? "thread" : "threads"}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {isLoading ? (
              <div className="text-sm text-muted-foreground p-3">
                Loading...
              </div>
            ) : error ? (
              <div className="text-sm text-destructive p-3">Load failed</div>
            ) : staffThreadsList.length === 0 ? (
              <EmptyState icon={MessageSquare} text="No threads" />
            ) : (
              <div className="space-y-1">
                {staffThreadsList.map((thread) => (
                  <ThreadListItem
                    key={thread.id}
                    thread={thread}
                    isActive={thread.id === selectedThreadId}
                    onSelect={() => handleSelectThread(thread)}
                  />
                ))}
              </div>
            )}
          </div>
        </aside>

        <section className="col-span-5 flex flex-col overflow-hidden">
          {selectedThread ? (
            <>
              <div className="p-4 border-b bg-background/95 backdrop-blur">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-base mb-1 truncate">
                      {selectedThread.subject}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                      <span>{selectedThread.issue_type || "Thread"}</span>
                      <span>·</span>
                      <span>
                        {selectedThread.target_section ||
                          selectedThread.application_id ||
                          "Section"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 bg-muted/10">
                {messages.length === 0 ? (
                  <EmptyState icon={MessageSquare} text="No messages" />
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <MessageBubble
                        key={msg.id}
                        message={msg}
                        isSelf={msg.author_role === "staff"}
                      />
                    ))}
                    <div ref={endRef} />
                  </div>
                )}
              </div>

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
                    disabled={addMessage.isPending || !selectedApplicationId}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={
                      (!composer.trim() && attachments.length === 0) ||
                      addMessage.isPending ||
                      !selectedApplicationId
                    }
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                {/* <ThreadAttachmentInput
                  attachments={attachments}
                  onChange={setAttachments}
                  disabled={!selectedApplicationId || addMessage.isPending}
                /> */}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState icon={Sparkles} text="Select thread" />
            </div>
          )}
        </section>

        <aside className="col-span-2 border-l bg-muted/20 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-semibold mb-3">Thread Details</h3>
            {selectedThread ? (
              <div className="space-y-4 text-xs">
                <div>
                  <p className="text-muted-foreground mb-1">Issue Type</p>
                  <p className="font-medium">
                    {selectedThread.issue_type || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Target Section</p>
                  <p className="font-medium break-words">
                    {selectedThread.target_section ||
                      selectedThread.application_id ||
                      "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Priority</p>
                  <Select
                    value={selectedThread.priority}
                    onValueChange={(v) => updatePriority.mutate(v)}
                    disabled={
                      updatePriority.isPending || !selectedApplicationId
                    }
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
                <div>
                  <p className="text-muted-foreground mb-1">Status</p>
                  <Select
                    value={selectedThread.status}
                    onValueChange={(v) => updateStatus.mutate(v)}
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
                <div>
                  <p className="text-muted-foreground mb-1">Last Updated</p>
                  <p className="font-medium text-xs break-words">
                    {formatDateTime(selectedThread.status_updated_at)}
                  </p>
                </div>

                <div className="pt-2 border-t">
                  <Link
                    href={`${siteRoutes.dashboard.application.root}/${selectedApplicationId}`}
                  >
                    <Button size="sm" variant="outline" className="w-full">
                      View Application
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Select a thread to view details
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
