"use client";

import { AccordionContent, AccordionItem } from "@/components/ui/accordion";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "lucide-react";
import type { ElementType, ReactNode } from "react";

export function Section({
  value,
  title,
  icon: Icon,
  badge,
  action,
  footer,
  children,
}: {
  value: string;
  title: string;
  icon?: ElementType<{ className?: string }>;
  badge?: ReactNode;
  action?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <AccordionItem
      value={value}
      disabled={!children}
      className="rounded-md border border-b-0 bg-card"
    >
      <AccordionPrimitive.Header className="flex items-center gap-0">
        <AccordionPrimitive.Trigger className="focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md px-3 py-2 text-left text-sm font-medium transition-all outline-none hover:no-underline focus-visible:ring-[3px] [&[data-state=open]>svg]:rotate-180">
          <div className="flex items-center gap-2">
            {Icon ? (
              <div className="grid h-6 w-6 place-items-center rounded-md border bg-muted/30">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            ) : null}
            <span className="text-sm font-semibold">{title}</span>
            {badge ? <div className="ml-1">{badge}</div> : null}
          </div>
          <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
        </AccordionPrimitive.Trigger>
        {action ? <div className="pr-3">{action}</div> : null}
      </AccordionPrimitive.Header>
      <AccordionContent className="space-y-2 px-3 pb-2">
        {children}
        {footer}
      </AccordionContent>
    </AccordionItem>
  );
}

export function Group({ children }: { children: ReactNode }) {
  return <div className="col-span-full space-y-1">{children}</div>;
}

export function EmptyNote({ children }: { children: ReactNode }) {
  return (
    <div className="col-span-full rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
      {children}
    </div>
  );
}
