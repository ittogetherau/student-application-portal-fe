"use client";

import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { GSScreeningForm } from "@/app/dashboard/application/gs-form/_components/gs-screening-form";
import {
  useGSStudentDeclarationByTokenQuery,
  useGSStudentDeclarationQuery,
} from "@/hooks/useGSAssessment.hook";
import type { GSScreeningFormValues } from "@/app/dashboard/application/gs-form/_utils/gs-screening.validation";

/** Public-by-token API response: { application_id, tracking_code, expires_at, declaration } */
type PublicDeclarationByTokenResponse = {
  application_id?: string;
  tracking_code?: string;
  expires_at?: string;
  declaration?: {
    id?: string;
    status?: string;
    data?: Record<string, unknown>;
    submitted_at?: string;
    [key: string]: unknown;
  };
};

const NUMERIC_FIELDS: (keyof GSScreeningFormValues)[] = [
  "travelApplicant",
  "travelFamily",
  "tuitionApplicant",
  "tuitionFamily",
  "oshcApplicant",
  "oshcFamily",
  "livingExpensesApplicant",
  "livingExpensesFamily",
];

/**
 * Maps API declaration payload into form values: coerces numeric fields and
 * returns a plain object suitable for initialData.
 */
function mapDeclarationDataToFormValues(
  raw: Record<string, unknown> | null | undefined
): Partial<GSScreeningFormValues> | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const out = { ...raw } as Record<string, unknown>;
  for (const key of NUMERIC_FIELDS) {
    if (key in out && (out[key] !== undefined && out[key] !== null)) {
      const n = Number(out[key]);
      out[key] = Number.isFinite(n) ? n : 0;
    }
  }
  return out as Partial<GSScreeningFormValues>;
}

type GSFormClientProps = {
  trackingId: string;
  token?: string | null;
  applicationId?: string | null;
};

/**
 * Loads declaration by token (public link) or by applicationId (authenticated),
 * then renders the GS screening form with initial data.
 * - With token: GET /api/v1/public/gs-declarations/{token}
 * - With applicationId and no token: useGSStudentDeclarationQuery(applicationId)
 */
export function GSFormClient({
  trackingId,
  token,
  applicationId,
}: GSFormClientProps) {
  const byToken = useGSStudentDeclarationByTokenQuery(token ?? null);
  const byApplicationId = useGSStudentDeclarationQuery(
    token ? null : applicationId ?? null
  );

  const useToken = Boolean(token);
  const query = useToken ? byToken : byApplicationId;
  const isLoading = query.isLoading;

  // Public-by-token returns { application_id, tracking_code, expires_at, declaration }; form data is declaration.data
  // Authenticated by applicationId returns { id, status, data, ... }; form data is data
  const rawData = useToken
    ? (query.data?.data as PublicDeclarationByTokenResponse | undefined)?.declaration?.data
    : (query.data?.data as { data?: Record<string, unknown> } | undefined)?.data;
  const initialData = mapDeclarationDataToFormValues(rawData);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <GSScreeningForm
      currentView="student"
      trackingId={trackingId}
      token={token ?? undefined}
      applicationId={applicationId ?? undefined}
      initialData={initialData}
    />
  );
}
