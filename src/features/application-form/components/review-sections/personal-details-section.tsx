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
import { useGalaxySyncPersonalDetailsMutation } from "@/features/application-form/hooks/galaxy-sync.hook";
import { formatUtcToFriendlyLocal } from "@/shared/lib/format-utc-to-local";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Contact2, MapPin, Shield, User2 } from "lucide-react";

export function PersonalDetailsSection({
  applicationId,
  personalDetails,
  showSync,
  isStaffOrAdmin,
  syncMeta,
}: {
  applicationId: string;
  personalDetails: any;
  showSync: boolean;
  isStaffOrAdmin: boolean;
  syncMeta?: SyncMetadataItem | null;
}) {
  const queryClient = useQueryClient();
  const syncPersonalDetails =
    useGalaxySyncPersonalDetailsMutation(applicationId);
  if (!personalDetails) return null;
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
        syncPersonalDetails.mutate(undefined, {
          onSettled: invalidateApplication,
        })
      }
      isPending={syncPersonalDetails.isPending}
      syncMeta={syncMeta}
    />
  );

  return (
    <Section
      value="personal"
      title="Personal"
      icon={User2}
      action={action}
      footer={syncNote}
    >
      <FieldsGrid>
        <Field
          label="Given Name"
          value={personalDetails.given_name}
          icon={User2}
        />
        <Field
          label="Middle Name"
          value={personalDetails.middle_name}
          icon={User2}
        />
        <Field
          label="Family Name"
          value={personalDetails.family_name}
          icon={User2}
        />
        <Field label="Email" value={personalDetails.email} icon={Contact2} />
        <Field
          label="Phone"
          value={personalDetails.phone}
          icon={Contact2}
          mono
        />
        <Field
          label="Date of Birth"
          value={
            personalDetails.date_of_birth
              ? formatUtcToFriendlyLocal(personalDetails.date_of_birth)
              : null
          }
          icon={CalendarDays}
        />
        <Field label="Gender" value={personalDetails.gender} icon={User2} />
        <Field
          label="Street Address"
          value={personalDetails.street_name}
          icon={MapPin}
        />
        <Field label="Suburb" value={personalDetails.suburb} icon={MapPin} />
        <Field label="State" value={personalDetails.state} icon={MapPin} />
        <Field
          label="Postcode"
          value={personalDetails.postcode}
          icon={MapPin}
          mono
        />
        <Field label="Country" value={personalDetails.country} icon={MapPin} />
        <Field
          label="Nationality"
          value={personalDetails.nationality}
          icon={Shield}
        />
        <Field
          label="Country of Birth"
          value={personalDetails.country_of_birth}
          icon={MapPin}
        />
        <Field
          label="Passport Number"
          value={personalDetails.passport_number}
          icon={Shield}
          mono
        />
        <Field
          label="Passport Expiry"
          value={
            personalDetails.passport_expiry
              ? formatUtcToFriendlyLocal(personalDetails.passport_expiry)
              : null
          }
          icon={CalendarDays}
        />
      </FieldsGrid>
    </Section>
  );
}
