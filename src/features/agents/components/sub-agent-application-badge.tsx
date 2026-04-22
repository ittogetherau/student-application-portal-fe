"use client";

import { Bot } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import type { SubAgentApplicationPreview } from "@/features/agents/utils/sub-agent-application-preview";

type SubAgentApplicationBadgeProps = {
  preview: SubAgentApplicationPreview;
  className?: string;
};

export default function SubAgentApplicationBadge({
  preview,
  className,
}: SubAgentApplicationBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 border-border/70 bg-muted/50 px-2.5 py-1 text-foreground/80 shadow-none",
        className,
      )}
      title={preview.email}
    >
      <Bot className="h-3 w-3 text-muted-foreground" />
      <span className="truncate max-w-[14rem]">{preview.name}</span>
    </Badge>
  );
}
