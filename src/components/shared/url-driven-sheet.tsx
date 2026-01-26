"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

type RenderCtx = {
  view: string | null;
  clearFromUrl: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
};

interface UrlDrivenSheetProps {
  viewValue?: string;

  title?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode | ((ctx: RenderCtx) => React.ReactNode);
  children?: React.ReactNode | ((ctx: RenderCtx) => React.ReactNode);

  side?: "right" | "left" | "top" | "bottom";
  contentClassName?: string;

  clearKeysOnClose?: string[];
}

const UrlDrivenSheet = ({
  viewValue = "message",
  title = "Message Panel",
  header,
  footer,
  children,
  side = "right",
  contentClassName = "w-full sm:max-w-md p-0",
  clearKeysOnClose,
}: UrlDrivenSheetProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const view = searchParams.get("view");
  const shouldOpen = useMemo(() => view === viewValue, [view, viewValue]);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(shouldOpen);
  }, [shouldOpen]);

  const clearFromUrl = () => {
    const next = new URLSearchParams(searchParams.toString());
    const keys = clearKeysOnClose ?? ["view"];
    keys.forEach((k) => next.delete(k));
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const onOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) clearFromUrl();
    else setOpen(true);
  };

  const ctx: RenderCtx = useMemo(
    () => ({ view, clearFromUrl, open, setOpen }),
    [view, open]
  );

  const renderChildren =
    typeof children === "function" ? children(ctx) : children;

  const renderFooter = typeof footer === "function" ? footer(ctx) : footer;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={side} className={contentClassName}>
        <div className="flex h-full flex-col">
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            {header ? <div className="pt-2">{header}</div> : null}
          </SheetHeader>

          <div className="flex-1 min-h-0 overflow-y-auto px-6">
            {renderChildren ?? (
              <div className="text-sm">
                <span className="text-muted-foreground">view:</span>{" "}
                <span className="font-medium">{view ?? "—"}</span>
              </div>
            )}
            <div className="h-4" />
          </div>

          {/* Footer (fixed) */}
          <div className="border-t p-4">
            <SheetFooter className="p-0">
              {renderFooter ?? (
                <SheetClose asChild>
                  <Button variant="outline" onClick={clearFromUrl}>
                    Close
                  </Button>
                </SheetClose>
              )}
            </SheetFooter>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default UrlDrivenSheet;
