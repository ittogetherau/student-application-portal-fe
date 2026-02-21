"use client";

import ThreadAttachmentInput from "@/components/shared/thread-attachment-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { siteRoutes } from "@/shared/constants/site-routes";
import {
  EmptyState,
  MessageBubble,
  ThreadListItem,
} from "@/features/threads/components/threads-utils";
import {
  useAddThreadMessageMutation,
  useApplicationThreadsQuery,
  useStaffThreadsQuery,
  useUpdateThreadPriorityMutation,
  useUpdateThreadStatusMutation,
} from "@/features/threads/hooks/application-threads.hook";
import type {
  StaffThreadFilters,
  StaffThreadSummary,
} from "@/service/application-threads.service";
import { CommunicationThread } from "@/service/application-threads.service";
import { USER_ROLE } from "@/shared/constants/types";
import { formatUtcToFriendlyLocal } from "@/shared/lib/format-utc-to-local";
import {
  Dot,
  Eye,
  Filter,
  ListRestart,
  MessageSquare,
  Send,
  Sparkles,
  Verified,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";

const formatContactName = (name?: string | null, email?: string | null) => {
  if (name) return name;
  if (email) return email.split("@")[0];
  return "N/A";
};

const formatContactEmail = (email?: string | null) => email || "N/A";
const THREADS_PER_PAGE = 10;

type TasksPopoverFilterState = {
  agent: string;
  activeAgent: "all" | "active" | "inactive";
  status: string;
  priority: string;
};

const DEFAULT_POPOVER_FILTERS: TasksPopoverFilterState = {
  agent: "",
  activeAgent: "all",
  status: "all",
  priority: "all",
};

export default function TasksPageClient() {
  const { data: session } = useSession();
  const ROLE = session?.user.role;
  const showAssignedStaff = ROLE === USER_ROLE.STAFF;

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [draftFilters, setDraftFilters] = useState<TasksPopoverFilterState>(
    DEFAULT_POPOVER_FILTERS,
  );
  const [appliedFilters, setAppliedFilters] = useState<TasksPopoverFilterState>(
    DEFAULT_POPOVER_FILTERS,
  );
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const hasPendingFilterChanges = useMemo(
    () =>
      draftFilters.agent !== appliedFilters.agent ||
      draftFilters.activeAgent !== appliedFilters.activeAgent ||
      draftFilters.status !== appliedFilters.status ||
      draftFilters.priority !== appliedFilters.priority,
    [appliedFilters, draftFilters],
  );

  const hasActiveFilters = useMemo(
    () =>
      !!searchTerm.trim() ||
      !!appliedFilters.agent.trim() ||
      appliedFilters.activeAgent !== "all" ||
      appliedFilters.status !== "all" ||
      appliedFilters.priority !== "all",
    [appliedFilters, searchTerm],
  );

  const staffThreadFilters = useMemo<StaffThreadFilters>(
    () => ({
      title: debouncedSearchTerm.trim() || undefined,
      agent: appliedFilters.agent.trim() || undefined,
      status: appliedFilters.status !== "all" ? appliedFilters.status : undefined,
      priority:
        appliedFilters.priority !== "all" ? appliedFilters.priority : undefined,
      active_agent:
        appliedFilters.activeAgent === "all"
          ? undefined
          : appliedFilters.activeAgent === "active",
    }),
    [appliedFilters, debouncedSearchTerm],
  );

  const {
    data: staffThreads,
    isLoading,
    isFetching,
    error,
  } = useStaffThreadsQuery(staffThreadFilters);
  const staffThreadsList = useMemo(
    () => staffThreads?.data ?? [],
    [staffThreads],
  );

  const [selectedThreadId, setSelectedThreadId] = useQueryState("threadId");
  const [selectedApplicationId, setSelectedApplicationId] =
    useQueryState("applicationId");

  const [composer, setComposer] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);

  const applicationThreadsQuery = useApplicationThreadsQuery(
    selectedApplicationId,
  );
  const applicationThreads = useMemo(
    () => applicationThreadsQuery.data?.data ?? [],
    [applicationThreadsQuery.data],
  );

  const addMessage = useAddThreadMessageMutation(
    selectedApplicationId,
    selectedThreadId,
  );
  const updateStatus = useUpdateThreadStatusMutation(
    selectedApplicationId,
    selectedThreadId,
  );
  const updatePriority = useUpdateThreadPriorityMutation(
    selectedApplicationId,
    selectedThreadId,
  );
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (staffThreadsList.length === 0) {
      if (selectedThreadId || selectedApplicationId) {
        setSelectedThreadId(null);
        setSelectedApplicationId(null);
      }
      return;
    }

    if (!selectedThreadId) {
      setSelectedThreadId(staffThreadsList[0].id);
      setSelectedApplicationId(staffThreadsList[0].application_id);
      return;
    }

    const selectedStillVisible = staffThreadsList.some(
      (thread) => thread.id === selectedThreadId,
    );
    if (!selectedStillVisible) {
      setSelectedThreadId(staffThreadsList[0].id);
      setSelectedApplicationId(staffThreadsList[0].application_id);
      return;
    }

    if (selectedThreadId && !selectedApplicationId) {
      const matchingThread = staffThreadsList.find(
        (thread) => thread.id === selectedThreadId,
      );
      if (matchingThread) {
        setSelectedApplicationId(matchingThread.application_id);
      }
    }
  }, [
    staffThreadsList,
    selectedThreadId,
    selectedApplicationId,
    setSelectedApplicationId,
    setSelectedThreadId,
  ]);

  const selectedThreadFromApp = useMemo(
    () => applicationThreads.find((t) => t.id === selectedThreadId) || null,
    [applicationThreads, selectedThreadId],
  );
  const agentContact = selectedThreadFromApp?.agent;
  const staffContact = selectedThreadFromApp?.assigned_staff;

  const selectedStaffThread = useMemo(
    () => staffThreadsList.find((t) => t.id === selectedThreadId) || null,
    [staffThreadsList, selectedThreadId],
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

  const isThreadCompleted = selectedThread?.status === "completed";
  const canUpdateStatus = !!selectedThreadId && !!selectedApplicationId;

  const totalPages = Math.max(
    1,
    Math.ceil(staffThreadsList.length / THREADS_PER_PAGE),
  );
  const resolvedCurrentPage = Math.min(currentPage, totalPages);

  const paginatedStaffThreads = useMemo(() => {
    const startIndex = (resolvedCurrentPage - 1) * THREADS_PER_PAGE;
    return staffThreadsList.slice(startIndex, startIndex + THREADS_PER_PAGE);
  }, [resolvedCurrentPage, staffThreadsList]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedThreadId, selectedThreadFromApp?.messages?.length]);

  const handleSelectThread = (thread: StaffThreadSummary) => {
    setComposer("");
    setAttachments([]);
    setSelectedThreadId(thread.id);
    setSelectedApplicationId(thread.application_id);
  };

  const handleSend = async () => {
    if (addMessage.isPending || isThreadCompleted) return;
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

  const applyFilters = () => {
    setAppliedFilters(draftFilters);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setDraftFilters(DEFAULT_POPOVER_FILTERS);
    setAppliedFilters(DEFAULT_POPOVER_FILTERS);
    setCurrentPage(1);
  };

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden bg-background">
      <div className="grid grid-cols-9 h-full">
        <aside className="col-span-2 border-r flex flex-col bg-muted/20 overflow-hidden">
          <div className="p-4 border-b bg-background/95 backdrop-blur">
            <h2 className="text-base font-semibold">Communication Threads</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {staffThreadsList.length}{" "}
              {staffThreadsList.length === 1 ? "thread" : "threads"}
              {hasActiveFilters ? " (filtered)" : ""}
            </p>

            <div className="mt-3 flex flex-col gap-px sm:flex-row sm:items-center">
              <Input
                placeholder="Search threads..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="sm:flex-1"
              />
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon-sm">
                      <Filter />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-64">
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Agent</p>
                        <Input
                          value={draftFilters.agent}
                          onChange={(e) => {
                            const value = e.target.value;
                            setDraftFilters((prev) => ({
                              ...prev,
                              agent: value,
                            }));
                          }}
                          className="h-9 text-xs w-full"
                          placeholder="Search agent by name or email"
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Agent Account
                        </p>
                        <Select
                          value={draftFilters.activeAgent}
                          onValueChange={(value) => {
                            setDraftFilters((prev) => ({
                              ...prev,
                              activeAgent:
                                value as TasksPopoverFilterState["activeAgent"],
                            }));
                          }}
                        >
                          <SelectTrigger className="h-9 text-xs w-full">
                            <SelectValue placeholder="Agent Account" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All agents</SelectItem>
                            <SelectItem value="active">Active only</SelectItem>
                            <SelectItem value="inactive">
                              Inactive only
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Status</p>
                        <Select
                          value={draftFilters.status}
                          onValueChange={(value) => {
                            setDraftFilters((prev) => ({
                              ...prev,
                              status: value,
                            }));
                          }}
                        >
                          <SelectTrigger className="h-9 text-xs w-full">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="under_review">
                              Under Review
                            </SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Priority
                        </p>
                        <Select
                          value={draftFilters.priority}
                          onValueChange={(value) => {
                            setDraftFilters((prev) => ({
                              ...prev,
                              priority: value,
                            }));
                          }}
                        >
                          <SelectTrigger className="h-9 text-xs w-full">
                            <SelectValue placeholder="Priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All priority</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={applyFilters}
                          disabled={!hasPendingFilterChanges}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                {hasActiveFilters ? (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={clearFilters}
                    aria-label="Clear filters"
                  >
                    <X size={14} />
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {isLoading || isFetching ? (
              <div className="text-sm text-muted-foreground p-3">
                Loading...
              </div>
            ) : error ? (
              <div className="text-sm text-destructive p-3">Load failed</div>
            ) : staffThreadsList.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                text={hasActiveFilters ? "No matching threads" : "No threads"}
              />
            ) : (
              <div className="space-y-1">
                {paginatedStaffThreads.map((thread) => (
                  <ThreadListItem
                    key={thread.id}
                    thread={thread}
                    isActive={thread.id === selectedThreadId}
                    showAssignedStaff={showAssignedStaff}
                    onSelect={() => handleSelectThread(thread)}
                  />
                ))}
              </div>
            )}
          </div>

          {!isLoading && !error && staffThreadsList.length > 0 && (
            <div className="border-t p-2">
              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>{`Page ${resolvedCurrentPage} of ${totalPages}`}</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage(Math.max(1, resolvedCurrentPage - 1))
                    }
                    disabled={resolvedCurrentPage <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage(
                        Math.min(totalPages, resolvedCurrentPage + 1),
                      )
                    }
                    disabled={resolvedCurrentPage >= totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
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
                    disabled={
                      addMessage.isPending ||
                      !selectedApplicationId ||
                      isThreadCompleted
                    }
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={
                      (!composer.trim() && attachments.length === 0) ||
                      addMessage.isPending ||
                      !selectedApplicationId ||
                      isThreadCompleted
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
                    disabled={
                      addMessage.isPending ||
                      !selectedApplicationId ||
                      isThreadCompleted
                    }
                  />
                </div>
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

                {ROLE === USER_ROLE.STAFF ? (
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
                ) : (
                  <div>
                    <p className="text-muted-foreground mb-1">Priority</p>
                    <p className="font-medium text-xs break-words">
                      {selectedThread.priority}
                    </p>
                  </div>
                )}

                {ROLE === USER_ROLE.STAFF ? (
                  <div>
                    <p className="text-muted-foreground mb-1">Status</p>
                    <Select
                      value={selectedThread.status}
                      onValueChange={(v) => updateStatus.mutate(v)}
                      disabled={
                        updateStatus.isPending || !selectedApplicationId
                      }
                    >
                      <SelectTrigger className="h-8 text-xs w-full">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="under_review">
                          Under Review
                        </SelectItem>
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

                {ROLE === USER_ROLE.STAFF && (
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
                )}

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
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      disabled
                    >
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
      </div>
    </div>
  );
}
