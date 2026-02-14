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
import { useGalaxySyncUsiMutation } from "@/features/application-form/hooks/galaxy-sync.hook";
import { formatUtcToFriendlyLocal } from "@/shared/lib/format-utc-to-local";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarDays, CheckCircle2, Shield } from "lucide-react";

export function UsiSection({
  applicationId,
  usi,
  verified,
  verifiedAt,
  showSync,
  isStaffOrAdmin,
  syncMeta,
}: {
  applicationId: string;
  usi: string | null;
  verified: boolean;
  verifiedAt: string | null;
  showSync: boolean;
  isStaffOrAdmin: boolean;
  syncMeta?: SyncMetadataItem | null;
}) {
  const queryClient = useQueryClient();
  const syncUsi = useGalaxySyncUsiMutation(applicationId);
  if (!usi) return null;
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
        syncUsi.mutate(undefined, { onSettled: invalidateApplication })
      }
      isPending={syncUsi.isPending}
      syncMeta={syncMeta}
    />
  );

  return (
    <Section
      value="usi"
      title="USI"
      icon={Shield}
      action={action}
      footer={syncNote}
    >
      <FieldsGrid>
        <Field label="USI Number" value={usi} icon={Shield} mono />
        <Field label="Verified" value={verified} icon={CheckCircle2} />
        <Field
          label="Verified At"
          value={verifiedAt ? formatUtcToFriendlyLocal(verifiedAt) : null}
          icon={CalendarDays}
        />
      </FieldsGrid>
    </Section>
  );
}
