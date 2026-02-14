"use client";

import { cn } from "@/shared/lib/utils";
import type { ReactNode } from "react";

const BASE_STAGE_CARD_CLASS =
  "p-3 border-x-2 last:border-b-2 flex flex-col gap-0 border-b-2 last:rounded-bg-lg";

export const getStageCardClassName = (
  isCurrent: boolean,
  extraClassName?: string,
) => {
  const currentClassName = isCurrent ? "bg-primary/5 border-primary" : "";
  return cn(BASE_STAGE_CARD_CLASS, currentClassName, extraClassName);
};

type StageCardShellProps = {
  isCurrent: boolean;
  children: ReactNode;
  className?: string;
};

export default function StageCardShell({
  isCurrent,
  children,
  className,
}: StageCardShellProps) {
  return (
    <div className={getStageCardClassName(isCurrent, className)}>
      {children}
    </div>
  );
}
