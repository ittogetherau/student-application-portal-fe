/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Badge } from "@/components/ui/badge";
import { CompactTable } from "@/features/application-form/components/sync-review/compact-table";
import {
  Group,
  Section,
} from "@/features/application-form/components/sync-review/section";
import { SyncActionButton } from "@/features/application-form/components/sync-review/sync-action-button";
import {
  SyncMetadataNote,
  type SyncMetadataItem,
} from "@/features/application-form/components/sync-review/sync-metadata-note";
import { useGalaxySyncDeclarationMutation } from "@/features/application-form/hooks/galaxy-sync.hook";
import { useQueryClient } from "@tanstack/react-query";
import { FileText } from "lucide-react";

export function SurveySection({
  applicationId,
  responses,
  showSync,
  isStaffOrAdmin,
  syncMeta,
}: {
  applicationId: string;
  responses: any[];
  showSync: boolean;
  isStaffOrAdmin: boolean;
  syncMeta?: SyncMetadataItem | null;
}) {
  const queryClient = useQueryClient();
  const syncDeclaration = useGalaxySyncDeclarationMutation(applicationId);
  if (!responses.length) return null;
  const invalidateApplication = () => {
    queryClient.invalidateQueries({
      queryKey: ["application-get", applicationId],
    });
    queryClient.invalidateQueries({ queryKey: ["application-list"] });
  };
  const syncNote = (
    <SyncMetadataNote
      syncMeta={syncMeta}
      showSync={showSync}
      isStaffOrAdmin={isStaffOrAdmin}
    />
  );
  const action = (
    <SyncActionButton
      showSync={showSync}
      isStaffOrAdmin={isStaffOrAdmin}
      onClick={() =>
        syncDeclaration.mutate(undefined, { onSettled: invalidateApplication })
      }
      isPending={syncDeclaration.isPending}
      syncMeta={syncMeta}
    />
  );

  return (
    <Section
      value="survey"
      title="Survey"
      icon={FileText}
      action={action}
      badge={
        <Badge variant="secondary" className="text-[11px]">
          {responses.length}
        </Badge>
      }
      footer={syncNote}
    >
      <Group>
        {responses.map((resp: any, index: number) => (
          <div key={index} className="col-span-full space-y-1">
            <Badge variant="outline" className="text-[11px]">
              Response {index + 1}
            </Badge>
            <CompactTable
              headers={["Field", "Value"]}
              rows={Object.entries(resp).map(([key, value]) => [
                key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
                String(value),
              ])}
            />
          </div>
        ))}
      </Group>
    </Section>
  );
}
