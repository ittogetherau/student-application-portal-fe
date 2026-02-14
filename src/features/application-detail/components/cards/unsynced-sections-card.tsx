"use client";

import { siteRoutes } from "@/shared/constants/site-routes";
import Link from "next/link";

type UnsyncedSectionsCardProps = {
  applicationId: string;
  sectionKeys: string[];
  sectionLabels: Record<string, string>;
};

export default function UnsyncedSectionsCard({
  applicationId,
  sectionKeys,
  sectionLabels,
}: UnsyncedSectionsCardProps) {
  if (sectionKeys.length === 0) return null;

  return (
    <div className="mt-3 rounded-md border border-destructive bg-destructive/20 p-3 text-sm text-destructive-foreground">
      <p className="font-medium">The following sections are not synced:</p>
      <p className="my-1.5">
        {sectionKeys.map((key) => sectionLabels[key] ?? key).join(", ")}
      </p>
      Please{" "}
      <Link
        className="text-primary-foreground underline"
        href={siteRoutes.dashboard.application.edit(applicationId)}
      >
        update the form
      </Link>{" "}
      if you can{"'"}t see the section.
    </div>
  );
}
