/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { CompactTable } from "@/features/application-form/components/sync-review/compact-table";
import {
  Field,
  FieldsGrid,
  formatMoney,
  toText,
} from "@/features/application-form/components/sync-review/field";
import {
  EmptyNote,
  Group,
  Section,
} from "@/features/application-form/components/sync-review/section";
import { CheckCircle2, FileText } from "lucide-react";

export function AdditionalServicesSection({
  additionalServicesData,
}: {
  applicationId: string;
  additionalServicesData: any;
}) {
  if (!additionalServicesData) return null;

  const additionalServicesRaw = Array.isArray(additionalServicesData)
    ? additionalServicesData
    : additionalServicesData?.services || [];

  const additionalServices = (additionalServicesRaw || [])
    .filter((s: any) => s && (s.selected === true || s.selected === undefined))
    .filter(
      (s: any) =>
        !!toText(s?.name) ||
        !!toText(s?.service_id) ||
        !!toText(s?.description) ||
        s?.fee != null,
    );

  const additionalTotal =
    additionalServicesData?.total_additional_fees?.parsedValue ??
    additionalServicesData?.total_additional_fees?.source ??
    null;

  const additionalRequested =
    additionalServicesData?.request_additional_services ?? null;

  const hasServices =
    (Array.isArray(additionalServicesData) &&
      additionalServicesData.length > 0) ||
    (typeof additionalServicesData === "object" &&
      "services" in additionalServicesData &&
      Array.isArray(additionalServicesData.services) &&
      additionalServicesData.services.length > 0);

  if (!hasServices) return null;

  return (
    <Section
      value="additional-services"
      title="Additional Services"
      icon={FileText}
    >
      <FieldsGrid>
        <Field
          label="Requested"
          value={additionalRequested}
          icon={CheckCircle2}
        />
        <Field
          label="Total Additional Fees"
          value={additionalTotal}
          icon={FileText}
          format={formatMoney}
        />
      </FieldsGrid>

      {additionalServices.length === 0 ? (
        <EmptyNote>No additional services selected.</EmptyNote>
      ) : (
        <Group>
          <CompactTable
            headers={["Name", "Service ID", "Description", "Fee"]}
            rows={additionalServices.map((service: any) => [
              service.name,
              service.service_id,
              service.description,
              formatMoney(service.fee),
            ])}
          />
        </Group>
      )}
    </Section>
  );
}
