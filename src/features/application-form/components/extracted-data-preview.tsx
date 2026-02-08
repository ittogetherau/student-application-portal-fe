"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import { Check, ClipboardCheck } from "lucide-react";

interface ExtractedDataPreviewProps {
  data: Record<string, any>;
  title?: string;
  className?: string;
}

const formatKey = (key: string) => {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const ExtractedDataPreview = ({
  data,
  title = "Extracted Information",
  className,
}: ExtractedDataPreviewProps) => {
  if (!data || Object.keys(data).length === 0) return null;

  // Process fields to flatten one level of nesting
  const displayFields: [string, any][] = [];

  Object.entries(data).forEach(([key, value]) => {
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      key.startsWith("_")
    )
      return;

    if (typeof value === "object" && !Array.isArray(value)) {
      // Flatten one level for objects like component_scores
      Object.entries(value).forEach(([subKey, subValue]) => {
        if (subValue !== null && subValue !== undefined && subValue !== "") {
          displayFields.push([`${key}_${subKey}`, subValue]);
        }
      });
    } else {
      displayFields.push([key, value]);
    }
  });

  if (displayFields.length === 0) return null;

  return (
    <div
      className={cn(
        "space-y-3 rounded-xl border bg-card p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-500",
        className,
      )}
    >
      <div className="flex items-center gap-2 text-emerald-600 font-semibold border-b pb-2 mb-3">
        <ClipboardCheck className="h-5 w-5" />
        <h4 className="text-sm">{title}</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
        {displayFields.map(([key, value]) => (
          <div key={key} className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
              {formatKey(key)}
            </span>
            <div className="flex items-center gap-2 group">
              <span className="text-sm font-medium">{String(value)}</span>
              <Badge
                variant="secondary"
                className="h-4 px-1 py-0 text-[10px] bg-emerald-50 text-emerald-700 border-emerald-100 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Check className="h-2 w-2 mr-0.5" />
                Populated
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
