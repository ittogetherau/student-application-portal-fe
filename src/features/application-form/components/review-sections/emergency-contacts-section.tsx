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
import { useGalaxySyncEmergencyContactMutation } from "@/features/application-form/hooks/galaxy-sync.hook";
import { useQueryClient } from "@tanstack/react-query";
import { Contact2 } from "lucide-react";

export function EmergencyContactsSection({
  applicationId,
  contacts,
  showSync,
  isStaffOrAdmin,
  syncMeta,
}: {
  applicationId: string;
  contacts: any[];
  showSync: boolean;
  isStaffOrAdmin: boolean;
  syncMeta?: SyncMetadataItem | null;
}) {
  const queryClient = useQueryClient();
  const syncEmergencyContact =
    useGalaxySyncEmergencyContactMutation(applicationId);
  if (!contacts.length) return null;
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
        syncEmergencyContact.mutate(undefined, {
          onSettled: invalidateApplication,
        })
      }
      isPending={syncEmergencyContact.isPending}
      syncMeta={syncMeta}
    />
  );

  return (
    <Section
      value="emergency-contacts"
      title="Emergency Contacts"
      icon={Contact2}
      action={action}
      badge={
        <Badge variant="secondary" className="text-[11px]">
          {contacts.length}
        </Badge>
      }
      footer={syncNote}
    >
      <Group>
        <CompactTable
          headers={["Name", "Relationship", "Phone", "Email", "Primary"]}
          rows={contacts.map((contact: any) => [
            contact.name,
            contact.relationship,
            contact.phone,
            contact.email,
            contact.is_primary ? (
              <Badge key="primary" variant="secondary" className="text-[11px]">
                Primary
              </Badge>
            ) : (
              ""
            ),
          ])}
        />
      </Group>
    </Section>
  );
}
