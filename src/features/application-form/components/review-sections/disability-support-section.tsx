/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Field,
  FieldsGrid,
} from "@/features/application-form/components/sync-review/field";
import { Section } from "@/features/application-form/components/sync-review/section";
import { SyncActionButton } from "@/features/application-form/components/sync-review/sync-action-button";
import {
  SyncMetadataNote,
  type SyncMetadataItem,
} from "@/features/application-form/components/sync-review/sync-metadata-note";
import { useGalaxySyncDisabilityMutation } from "@/features/application-form/hooks/galaxy-sync.hook";
import { useQueryClient } from "@tanstack/react-query";
import { FileText, Shield } from "lucide-react";

export function DisabilitySupportSection({
  applicationId,
  data,
  showSync,
  isStaffOrAdmin,
  syncMeta,
}: {
  applicationId: string;
  data: any;
  showSync: boolean;
  isStaffOrAdmin: boolean;
  syncMeta?: SyncMetadataItem | null;
}) {
  const queryClient = useQueryClient();
  const syncDisability = useGalaxySyncDisabilityMutation(applicationId);
  if (!data) return null;
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
        syncDisability.mutate(undefined, { onSettled: invalidateApplication })
      }
      isPending={syncDisability.isPending}
      syncMeta={syncMeta}
    />
  );

  return (
    <Section
      value="disability-support"
      title="Disability Support"
      icon={Shield}
      action={action}
      footer={syncNote}
    >
      <FieldsGrid>
        <Field
          label="Has Disability"
          value={data.has_disability}
          icon={Shield}
        />
      </FieldsGrid>
      {data.has_disability ? (
        <FieldsGrid>
          <Field
            label="Details"
            value={data.disability_details}
            icon={FileText}
          />
          <Field
            label="Support Required"
            value={data.support_required}
            icon={FileText}
          />
          <Field
            label="Documentation"
            value={data.documentation_status}
            icon={FileText}
          />
        </FieldsGrid>
      ) : null}
    </Section>
  );
}
