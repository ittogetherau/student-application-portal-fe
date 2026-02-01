"use client";

import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type GuidedTooltipProps = {
  storageKey: string;
  text: string;
  children: React.ReactNode;
  enabled?: boolean;
  side?: React.ComponentProps<typeof TooltipContent>["side"];
  sideOffset?: number;
};

export function GuidedTooltip({
  storageKey,
  text,
  children,
  enabled = true,
  side = "bottom",
  sideOffset = 8,
}: GuidedTooltipProps) {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored === "1") {
        setDismissed(true);
        setOpen(false);
      } else {
        setOpen(true);
      }
    } catch {
      setOpen(true);
    }
  }, [enabled, storageKey]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!enabled) return;
    if (dismissed && nextOpen) return;
    setOpen(nextOpen);
    if (nextOpen) return;

    try {
      window.localStorage.setItem(storageKey, "1");
      setDismissed(true);
    } catch {
      // Ignore storage errors (private mode, etc).
    }
  };

  if (!enabled) return <>{children}</>;

  return (
    <Tooltip open={open} onOpenChange={handleOpenChange}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} sideOffset={sideOffset}>
        <span>{text}</span>
        <button
          type="button"
          className="ml-2 text-[10px] underline"
          onClick={() => handleOpenChange(false)}
        >
          Got it
        </button>
      </TooltipContent>
    </Tooltip>
  );
}

export default GuidedTooltip;
