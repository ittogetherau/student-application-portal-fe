/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Field,
  FieldsGrid,
  formatMoney,
} from "@/features/application-form/components/sync-review/field";
import { getUnhandledReviewEntries } from "@/features/application-form/components/review-sections/review-utils";
import {
  EmptyNote,
  Section,
} from "@/features/application-form/components/sync-review/section";
import { SyncActionButton } from "@/features/application-form/components/sync-review/sync-action-button";
import {
  SyncMetadataNote,
  type SyncMetadataItem,
} from "@/features/application-form/components/sync-review/sync-metadata-note";
import { useGalaxySyncOshcMutation } from "@/features/application-form/hooks/galaxy-sync.hook";
import { formatUtcToFriendlyLocal } from "@/shared/lib/format-utc-to-local";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarDays, FileText, HeartPulse, Shield } from "lucide-react";

export function HealthCoverSection({
  applicationId,
  policy,
  showSync,
  isStaffOrAdmin,
  syncMeta,
  showRequestChange,
}: {
  applicationId: string;
  policy: any;
  showSync: boolean;
  isStaffOrAdmin: boolean;
  syncMeta?: SyncMetadataItem | null;
  showRequestChange?: boolean;
}) {
  const queryClient = useQueryClient();
  const syncOshc = useGalaxySyncOshcMutation(applicationId);
  if (!policy) return null;
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
        syncOshc.mutate(undefined, { onSettled: invalidateApplication })
      }
      isPending={syncOshc.isPending}
      syncMeta={syncMeta}
    />
  );
  const hasOshc = policy.has_oshc ?? policy.arrange_OSHC ?? null;
  const provider = policy.provider ?? policy.OSHC_provider ?? null;
  const policyNumber = policy.policy_number ?? policy.OSHC_policy_number ?? null;
  const coverageType = policy.coverage_type ?? policy.OSHC_type ?? null;
  const startDate = policy.start_date ?? policy.OSHC_start_date ?? null;
  const endDate = policy.end_date ?? policy.OSHC_end_date ?? null;
  const duration = policy.duration ?? policy.OSHC_duration ?? null;
  const fee = policy.fee ?? policy.OSHC_fee ?? null;
  const hasDetails =
    provider ||
    policyNumber ||
    coverageType ||
    startDate ||
    endDate ||
    duration ||
    fee;
  const extraEntries = getUnhandledReviewEntries(policy, [
    "has_oshc",
    "arrange_OSHC",
    "provider",
    "OSHC_provider",
    "policy_number",
    "OSHC_policy_number",
    "coverage_type",
    "OSHC_type",
    "start_date",
    "OSHC_start_date",
    "end_date",
    "OSHC_end_date",
    "duration",
    "OSHC_duration",
    "fee",
    "OSHC_fee",
  ], {
    defaultIcon: HeartPulse,
  });

  return (
    <Section
      value="health-cover"
      title="Health Cover"
      icon={HeartPulse}
      action={action}
      footer={syncNote}
    >
      <FieldsGrid>
        <Field label="Has OSHC" value={hasOshc} icon={Shield} />
      </FieldsGrid>

      {hasOshc || hasDetails ? (
        <FieldsGrid>
          <Field label="Provider" value={provider} icon={HeartPulse} />
          <Field label="Policy Number" value={policyNumber} icon={FileText} />
          <Field label="Coverage Type" value={coverageType} icon={FileText} />
          <Field
            label="Start Date"
            value={startDate ? formatUtcToFriendlyLocal(String(startDate)) : null}
            icon={CalendarDays}
          />
          <Field
            label="End Date"
            value={endDate ? formatUtcToFriendlyLocal(String(endDate)) : null}
            icon={CalendarDays}
          />
          <Field label="Duration" value={duration} icon={CalendarDays} />
          <Field label="Fee" value={fee} icon={FileText} format={formatMoney} />
        </FieldsGrid>
      ) : (
        <EmptyNote>No health cover details provided.</EmptyNote>
      )}

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
