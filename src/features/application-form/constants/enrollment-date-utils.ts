export const parseWeeksFromDurationText = (durationText?: string) => {
  if (!durationText) return null;
  const parts = durationText.trim().split(/\s+/);
  const weeksRaw = parts[0];
  const unitRaw = parts[1]?.toLowerCase();
  if (!weeksRaw) return null;
  if (unitRaw && unitRaw !== "week" && unitRaw !== "weeks") return null;
  const weeks = Number.parseInt(weeksRaw, 10);
  if (!Number.isFinite(weeks) || weeks <= 0) return null;
  return weeks;
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
