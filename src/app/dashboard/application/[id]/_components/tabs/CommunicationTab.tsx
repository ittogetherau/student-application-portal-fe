"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { siteRoutes } from "@/constants/site-routes";
import { useApplicationThreadsQuery } from "@/hooks/application-threads.hook";
import { formatParamUrl } from "@/lib/format-param-url";
import { Loader2, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

interface CommunicationTabProps {
  applicationId: string;
}

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export default function CommunicationTab({
  applicationId,
}: CommunicationTabProps) {
  const { data, isLoading, error } = useApplicationThreadsQuery(applicationId);
  const threads = data?.data || [];
  const [searchTerm, setSearchTerm] = useState("");

  const filteredThreads = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return threads;
    return threads.filter((thread) => {
      return (
        thread.subject.toLowerCase().includes(term) ||
        thread.issue_type?.toLowerCase().includes(term) ||
        thread.target_section?.toLowerCase().includes(term) ||
        thread.status?.toLowerCase().includes(term) ||
        thread.priority?.toLowerCase().includes(term)
      );
    });
  }, [searchTerm, threads]);

  return (
    <Card>
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-base">Threads</CardTitle>
        <div className="mt-2 max-w-sm">
          <Input
            placeholder="Search threads..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
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

        {!isLoading && !error && filteredThreads.length === 0 && (
          <div className="text-center py-8 text-xs text-muted-foreground">
            No threads
          </div>
        )}

        {!isLoading &&
          !error &&
          filteredThreads.length > 0 &&
          filteredThreads.map((thread) => (
            <div
              key={thread.id}
              className="border rounded p-2.5 bg-muted/20 space-y-1.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="font-medium text-sm line-clamp-1">
                  {thread.subject}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Badge
                    variant="secondary"
                    className="capitalize text-[10px] h-5 px-1.5"
                  >
                    {thread.priority}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="capitalize text-[10px] h-5 px-1.5"
                  >
                    {thread.status}
                  </Badge>
                </div>
              </div>

              <div className="text-[11px] text-muted-foreground">
                {thread.issue_type} · {thread.target_section}
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <MessageSquare className="h-3 w-3" />
                  <span>{thread.messages?.length || 0}</span>
                  <span>·</span>
                  <span>{formatDate(thread.created_at)}</span>
                </div>

                <Link
                  href={formatParamUrl(
                    {
                      view: "message",
                      applicationId,
                      threadId: thread.id,
                    },
                    `${siteRoutes.dashboard.application.root}/${applicationId}/`
                  )}
                >
                  <Button size="sm" variant="secondary" className="h-7 text-xs">
                    View
                  </Button>
                </Link>
              </div>
            </div>
          ))}
      </CardContent>
    </Card>
  );
}
