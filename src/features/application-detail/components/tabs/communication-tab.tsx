"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useApplicationThreadsQuery } from "@/features/threads/hooks/application-threads.hook";
import { formatUtcToFriendlyLocal } from "@/shared/lib/format-utc-to-local";
import type { CommunicationThread } from "@/service/application-threads.service";
import { Filter, Loader2, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface CommunicationTabProps {
  applicationId: string;
}

type ThreadSortBy = "created_at" | "deadline";
type ThreadStatusFilter = "all" | "pending" | "under_review" | "completed";
type ThreadPriorityFilter = "all" | "high" | "medium" | "low";

const EMPTY_THREADS: CommunicationThread[] = [];

export default function CommunicationTab({
  applicationId,
}: CommunicationTabProps) {
  const [title, setTitle] = useState("");
  const [debouncedTitle, setDebouncedTitle] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [status, setStatus] = useState<ThreadStatusFilter>("all");
  const [priority, setPriority] = useState<ThreadPriorityFilter>("all");
  const [sortBy, setSortBy] = useState<ThreadSortBy>("created_at");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTitle(title);
    }, 400);

    return () => clearTimeout(timer);
  }, [title]);

  const filters = useMemo(
    () => ({
      title: debouncedTitle.trim() || undefined,
      deadline: deadlineDate.trim() || undefined,
      status: status === "all" ? undefined : status,
      priority: priority === "all" ? undefined : priority,
      sort_by: sortBy,
    }),
    [debouncedTitle, deadlineDate, priority, sortBy, status],
  );

  const { data, isLoading, error } = useApplicationThreadsQuery(
    applicationId,
    filters,
  );
  const threads = data?.data ?? EMPTY_THREADS;
  const communicationBasePath =
    siteRoutes.dashboard.application.id.communication(applicationId);

  const sortedThreads = useMemo(() => {
    const list = [...threads];

    if (sortBy === "deadline") {
      list.sort((a, b) => {
        const aDeadline = a.deadline ? Date.parse(a.deadline) : Number.NaN;
        const bDeadline = b.deadline ? Date.parse(b.deadline) : Number.NaN;

        const aHasDeadline = Number.isFinite(aDeadline);
        const bHasDeadline = Number.isFinite(bDeadline);

        if (aHasDeadline && bHasDeadline) return aDeadline - bDeadline;
        if (aHasDeadline) return -1;
        if (bHasDeadline) return 1;

        const aCreated = Date.parse(a.created_at);
        const bCreated = Date.parse(b.created_at);
        if (Number.isFinite(aCreated) && Number.isFinite(bCreated))
          return bCreated - aCreated;
        return 0;
      });

      return list;
    }

    list.sort((a, b) => {
      const aCreated = Date.parse(a.created_at);
      const bCreated = Date.parse(b.created_at);
      if (Number.isFinite(aCreated) && Number.isFinite(bCreated))
        return bCreated - aCreated;
      return 0;
    });

    return list;
  }, [sortBy, threads]);

  return (
    <Card>
      <CardHeader className="">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">Threads</CardTitle>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              placeholder="Search title..."
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="sm:flex-1"
            />

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Filters">
                  <Filter />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Deadline Date
                    </p>
                    <Input
                      type="date"
                      value={deadlineDate}
                      onChange={(event) => setDeadlineDate(event.target.value)}
                      className="h-9 text-xs w-full"
                    />
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Select
                      value={status}
                      onValueChange={(next) =>
                        setStatus(next as ThreadStatusFilter)
                      }
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

                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Priority</p>
                    <Select
                      value={priority}
                      onValueChange={(next) =>
                        setPriority(next as ThreadPriorityFilter)
                      }
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

                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Sort By</p>
                    <Select
                      value={sortBy}
                      onValueChange={(next) => setSortBy(next as ThreadSortBy)}
                    >
                      <SelectTrigger className="h-9 text-xs w-full">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="created_at">Created</SelectItem>
                        <SelectItem value="deadline">Deadline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-2">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-xs text-muted-foreground">
            Failed to load threads
          </div>
        )}

        {!isLoading && !error && sortedThreads.length === 0 && (
          <div className="text-center py-8 text-xs text-muted-foreground">
            No threads
          </div>
        )}

        <div className="grid gap-3 xl:grid-cols-2">
          {!isLoading &&
            !error &&
            sortedThreads.length > 0 &&
            sortedThreads.map((thread) => {
              const href = `${communicationBasePath}?${new URLSearchParams({
                view: "message",
                applicationId: String(applicationId),
                threadId: String(thread.id),
              }).toString()}`;

              return (
                <Link key={thread.id} href={href} className="block">
                  <div className="border rounded-md px-3 py-2 bg-muted/20 hover:bg-muted/40 transition cursor-pointer space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium text-sm line-clamp-1">
                        {thread.subject}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Badge
                          variant="secondary"
                          className="capitalize text-[10px] h-4 px-1"
                        >
                          {thread.priority}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="capitalize text-[10px] h-4 px-1"
                        >
                          {thread.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="text-[10px] text-muted-foreground line-clamp-1">
                      {thread.issue_type} · {thread.target_section}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{thread.messages?.length || 0}</span>
                        <span>·</span>
                        <span>
                          {formatUtcToFriendlyLocal(thread.created_at)}
                        </span>
                      </div>

                      {thread.deadline && (
                        <span className="text-[10px]">
                          {formatUtcToFriendlyLocal(thread.deadline)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
}
