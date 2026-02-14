/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Field,
  FieldsGrid,
} from "@/features/application-form/components/sync-review/field";
import {
  EmptyNote,
  Section,
} from "@/features/application-form/components/sync-review/section";
import { SyncActionButton } from "@/features/application-form/components/sync-review/sync-action-button";
import {
  SyncMetadataNote,
  type SyncMetadataItem,
} from "@/features/application-form/components/sync-review/sync-metadata-note";
import { useGalaxySyncLanguageMutation } from "@/features/application-form/hooks/galaxy-sync.hook";
import { useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  FileText,
  Languages,
  MapPin,
  Shield,
} from "lucide-react";

export function LanguageCulturalSection({
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
  const syncLanguage = useGalaxySyncLanguageMutation(applicationId);
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
        syncLanguage.mutate(undefined, { onSettled: invalidateApplication })
      }
      isPending={syncLanguage.isPending}
      syncMeta={syncMeta}
    />
  );

  const aboriginalOrIslander =
    data.is_aus_aboriginal_or_islander ?? data.aboriginal_torres_strait ?? null;

  const hasAny =
    aboriginalOrIslander ||
    data.is_english_main_language ||
    data.main_language ||
    data.english_speaking_proficiency ||
    data.english_instruction_previous_studies ||
    data.completed_english_test ||
    data.english_test_type ||
    data.english_test_date ||
    data.english_test_score ||
    data.first_language ||
    data.english_proficiency ||
    (data.other_languages && data.other_languages.length > 0) ||
    data.indigenous_status ||
    data.country_of_birth ||
    data.citizenship_status ||
    data.visa_type ||
    data.visa_expiry;

  return (
    <Section
      value="language-cultural"
      title="Language & Cultural"
      icon={Languages}
      action={action}
      footer={syncNote}
    >
      <FieldsGrid>
        <Field
          label="Aboriginal/Torres Strait"
          value={aboriginalOrIslander}
          icon={Shield}
        />
        <Field
          label="English Main Language"
          value={data.is_english_main_language}
          icon={Languages}
        />
        <Field
          label="Main Language"
          value={data.main_language ?? data.first_language}
          icon={Languages}
        />
        <Field
          label="English Proficiency"
          value={data.english_speaking_proficiency ?? data.english_proficiency}
          icon={Languages}
        />
        <Field
          label="English Instruction (Previous Studies)"
          value={data.english_instruction_previous_studies}
          icon={Languages}
        />
        <Field
          label="Completed English Test"
          value={data.completed_english_test}
          icon={FileText}
        />
        <Field
          label="English Test Type"
          value={data.english_test_type}
          icon={FileText}
        />
        <Field
          label="English Test Date"
          value={data.english_test_date}
          icon={CalendarDays}
        />
        <Field
          label="English Test (Overall)"
          value={data.english_test_overall ?? data.english_test_score}
          icon={FileText}
        />
        <Field
          label="English Test (Listening)"
          value={data.english_test_listening}
          icon={FileText}
        />
        <Field
          label="English Test (Reading)"
          value={data.english_test_reading}
          icon={FileText}
        />
        <Field
          label="English Test (Writing)"
          value={data.english_test_writing}
          icon={FileText}
        />
        <Field
          label="English Test (Speaking)"
          value={data.english_test_speaking}
          icon={FileText}
        />
        <Field
          label="Other Languages"
          value={
            data.other_languages?.length
              ? data.other_languages.join(", ")
              : null
          }
          icon={Languages}
        />
        <Field
          label="Indigenous Status"
          value={data.indigenous_status}
          icon={Shield}
        />
        <Field
          label="Country of Birth"
          value={data.country_of_birth}
          icon={MapPin}
        />
        <Field
          label="Citizenship Status"
          value={data.citizenship_status}
          icon={Shield}
        />
        <Field label="Visa Type" value={data.visa_type} icon={Shield} />
        <Field
          label="Visa Expiry"
          value={data.visa_expiry}
          icon={CalendarDays}
        />
      </FieldsGrid>

      {!hasAny && (
        <EmptyNote>No language or cultural information provided.</EmptyNote>
      )}
    </Section>
  );
}
