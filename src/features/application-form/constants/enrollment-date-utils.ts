export const parseWeeksFromDurationText = (durationText?: string) => {
  if (!durationText) return null;
  const normalized = durationText.trim().toLowerCase();
  if (/^\d+(?:\.\d+)?$/.test(normalized)) {
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : null;
  }
  const match = normalized.match(/^(\d+(?:\.\d+)?)\s*([a-z]+)/);
  if (!match) return null;

  const value = Number.parseFloat(match[1]);
  const unit = match[2];

  if (!Number.isFinite(value) || value <= 0) return null;

  if (unit.startsWith("week")) {
    return Math.round(value);
  }

  if (unit.startsWith("month")) {
    return Math.round(value * (52 / 12));
  }

  if (unit.startsWith("year") || unit.startsWith("yr")) {
    return Math.round(value * 52);
  }

  return null;
};

export const parseWeeksValue = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.trunc(value);
  }

  if (typeof value === "string") {
    return parseWeeksFromDurationText(value);
  }

  return null;
};

export const calculateEnrollmentWeeks = (
  defaultWeeks: number,
  subjectCredits?: number | null,
) => {
  let courseWeeks = Math.max(0, Math.trunc(defaultWeeks));
  const normalizedSubjectCredits =
    typeof subjectCredits === "number" && Number.isFinite(subjectCredits)
      ? Math.trunc(subjectCredits)
      : null;

  if (normalizedSubjectCredits === null || normalizedSubjectCredits < 4) {
    return courseWeeks;
  }

  if (normalizedSubjectCredits < 8) {
    return Math.max(0, courseWeeks - 26);
  }

  if (normalizedSubjectCredits <= 11) {
    return Math.max(0, courseWeeks - 52);
  }

  if (normalizedSubjectCredits === 12) {
    return Math.max(0, courseWeeks - 76);
  }

  return courseWeeks;
};

export const parseStartDateToUtcDate = (input: string) => {
  const value = input.trim();

  const dmy = value.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (dmy) {
    const day = Number(dmy[1]);
    const month = Number(dmy[2]);
    const year = Number(dmy[3]);
    if (![year, month, day].every(Number.isFinite)) return null;
    return new Date(Date.UTC(year, month - 1, day));
  }

  const ymd = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymd) {
    const year = Number(ymd[1]);
    const month = Number(ymd[2]);
    const day = Number(ymd[3]);
    if (![year, month, day].every(Number.isFinite)) return null;
    return new Date(Date.UTC(year, month - 1, day));
  }

  return null;
};

export const formatUtcDateToYmd = (date: Date) => {
  const yyyy = String(date.getUTCFullYear());
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const normalizeDateStringToYmd = (input: unknown) => {
  if (typeof input !== "string") return null;
  const parsed = parseStartDateToUtcDate(input);
  if (!parsed) return null;
  return formatUtcDateToYmd(parsed);
};

export const addWeeksToYmdDateString = (startDateRaw: string, weeks: number) => {
  const startDate = parseStartDateToUtcDate(startDateRaw);
  if (!startDate) return null;

  const endDate = new Date(startDate);
  endDate.setUTCDate(endDate.getUTCDate() + weeks * 7);
  return formatUtcDateToYmd(endDate);
};
