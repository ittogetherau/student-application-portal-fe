/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Field,
  FieldsGrid,
} from "@/features/application-form/components/sync-review/field";
import { getUnhandledReviewEntries } from "@/features/application-form/components/review-sections/review-utils";
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
  showRequestChange,
}: {
  applicationId: string;
  personalDetails: any;
  showSync: boolean;
  isStaffOrAdmin: boolean;
  syncMeta?: SyncMetadataItem | null;
  showRequestChange?: boolean;
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
      applicationId={applicationId}
      syncMeta={syncMeta}
      showSync={showSync}
      isStaffOrAdmin={isStaffOrAdmin}
      showRequestChange={showRequestChange}
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
  const fullName = [
    personalDetails.title,
    personalDetails.given_name,
    personalDetails.middle_name,
    personalDetails.family_name,
  ]
    .filter((value: unknown) => typeof value === "string" && value.trim().length)
    .join(" ");
  const extraEntries = getUnhandledReviewEntries(personalDetails, [
    "title",
    "given_name",
    "middle_name",
    "family_name",
    "email",
    "phone",
    "date_of_birth",
    "gender",
    "street_name",
    "suburb",
    "state",
    "postcode",
    "country",
    "nationality",
    "country_of_birth",
    "passport_number",
    "passport_expiry",
  ], {
    defaultIcon: User2,
  });

  return (
    <Section
      value="personal"
      title="Personal"
      icon={User2}
      action={action}
      footer={syncNote}
    >
      <FieldsGrid>
        <Field label="Full Name" value={fullName} icon={User2} />
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

      {extraEntries.length ? (
        <FieldsGrid>
          {extraEntries.map((entry) => (
            <Field
              key={entry.key}
              label={entry.label}
              value={entry.value}
              icon={entry.icon}
              format={entry.format}
              mono={entry.mono}
            />
          ))}
        </FieldsGrid>
      ) : null}
    </Section>
  );
}
