"use client";

import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon: LucideIcon;
  text: string;
};

export default function EmptyState({ icon: Icon, text }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
      <Icon className="h-12 w-12 mb-3 opacity-15" />
      <p className="text-sm">{text}</p>
    </div>
  );
}

