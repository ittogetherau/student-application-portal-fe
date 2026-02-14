export const STUDY_REASON_CODES = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "11",
  "12",
  "@@",
] as const;

export type StudyReasonCode = (typeof STUDY_REASON_CODES)[number];

export const normalizeYesNo = (value: unknown) => {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value !== "string") return value;
  const lower = value.trim().toLowerCase();
  if (lower === "yes" || lower === "y" || lower === "true") return "Yes";
  if (lower === "no" || lower === "n" || lower === "false") return "No";
  return value;
};

export const normalizeYesNoNa = (value: unknown) => {
  const normalized = normalizeYesNo(value);
  if (normalized !== value) return normalized;
  if (typeof value !== "string") return value;
  const lower = value.trim().toLowerCase();
  if (lower === "na" || lower === "n/a") return "N/A";
  return value;
};

export const toApiYesNo = (value: "Yes" | "No") =>
  value === "Yes" ? "yes" : "no";

export const toApiYesNoNa = (value: "Yes" | "No" | "N/A") =>
  value === "N/A" ? "na" : toApiYesNo(value);

export const coerceYesNo = (value: unknown) => {
  const normalized = normalizeYesNo(value);
  return normalized === "Yes" || normalized === "No" ? normalized : null;
};

export const coerceYesNoNa = (value: unknown) => {
  const normalized = normalizeYesNoNa(value);
  return normalized === "Yes" || normalized === "No" || normalized === "N/A"
    ? normalized
    : null;
};

export const normalizeClassType = (value: unknown) => {
  if (typeof value !== "string") return value;
  const normalized = value.trim().toLowerCase();
  if (
    normalized === "classroom" ||
    normalized === "hybrid" ||
    normalized === "online"
  ) {
    return normalized;
  }
  return value;
};

export const coerceClassType = (value: unknown) =>
  typeof value === "string"
    ? (() => {
        const normalized = value.trim().toLowerCase();
        if (
          normalized === "classroom" ||
          normalized === "hybrid" ||
          normalized === "online"
        ) {
          return normalized;
        }
        return null;
      })()
    : null;

const isStudyReasonCode = (value: string): value is StudyReasonCode =>
  STUDY_REASON_CODES.includes(value as StudyReasonCode);

export const normalizeStudyReasonCode = (value: unknown) => {
  if (typeof value !== "string" && typeof value !== "number") return value;

  const raw = String(value).trim();
  if (!raw) return value;

  if (isStudyReasonCode(raw)) return raw;
  if (/^\d$/.test(raw)) {
    const padded = raw.padStart(2, "0");
    return isStudyReasonCode(padded) ? padded : value;
  }

  const prefix = raw.match(/^(\d{1,2})\b/)?.[1];
  if (prefix) {
    const padded = prefix.padStart(2, "0");
    return isStudyReasonCode(padded) ? padded : value;
  }

  return value;
};

export const coerceStudyReasonCode = (value: unknown): StudyReasonCode | null => {
  const normalized = normalizeStudyReasonCode(value);
  return typeof normalized === "string" && isStudyReasonCode(normalized)
    ? normalized
    : null;
};

export const normalizeEnrollmentPayload = (input: unknown) => {
  if (
    !input ||
    typeof input !== "object" ||
    Array.isArray(input) ||
    Object.keys(input as Record<string, unknown>).length === 0
  ) {
    return input;
  }

  const data = input as Record<string, unknown>;

  return {
    ...data,
    advanced_standing_credit: normalizeYesNo(data.advanced_standing_credit),
    inclue_material_fee_in_initial_payment: normalizeYesNo(
      data.inclue_material_fee_in_initial_payment,
    ),
    receiving_scholarship: normalizeYesNo(data.receiving_scholarship),
    work_integrated_learning: normalizeYesNoNa(data.work_integrated_learning),
    third_party_provider: normalizeYesNoNa(data.third_party_provider),
    class_type: normalizeClassType(data.class_type ?? data.classType),
    study_reason: normalizeStudyReasonCode(data.study_reason ?? data.studyReason),
  };
};
