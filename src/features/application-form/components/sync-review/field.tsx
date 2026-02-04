"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type Primitive = string | number | boolean | null | undefined;

const GRID =
  "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-1.5";

const VALUE_WIDTH = "max-w-[14rem]";

export const toText = (v: Primitive) => {
  if (v === null || v === undefined || v === "") return "";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return String(v);
};

export const formatMoney = (v: Primitive) => {
  const s = toText(v);
  if (!s) return "";
  const n = Number(s);
  if (!Number.isNaN(n)) return `$${n.toFixed(2)}`;
  return s;
};

function ValueText({ text, mono }: { text: string; mono?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setOverflow(el.scrollWidth > el.clientWidth);
  }, [text]);

  const content = (
    <div
      ref={ref}
      className={[
        "text-sm leading-5 text-foreground",
        "truncate",
        VALUE_WIDTH,
        mono ? "font-mono" : "",
      ].join(" ")}
    >
      {text}
    </div>
  );

  if (!overflow) return content;

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent className="max-w-sm break-words">{text}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function Field({
  icon: Icon,
  label,
  value,
  format,
  mono,
}: {
  icon?: LucideIcon;
  label: string;
  value: Primitive;
  format?: (v: Primitive) => string;
  mono?: boolean;
}) {
  const text = format ? format(value) : toText(value);
  if (!text) return null;

  return (
    <div className="flex items-start gap-2 px-2 py-1.5">
      {Icon ? (
        <div className="grid h-6 w-6 shrink-0 place-items-center rounded-md border bg-muted/30">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      ) : null}

      <div className="min-w-0">
        <div className="text-xs leading-4 text-muted-foreground">{label}</div>
        <ValueText text={text} mono={mono} />
      </div>
    </div>
  );
}

export function FieldsGrid({ children }: { children: ReactNode }) {
  return <div className={GRID}>{children}</div>;
}
