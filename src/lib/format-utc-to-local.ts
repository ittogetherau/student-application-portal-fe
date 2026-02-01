type NullableTimestamp = string | null | undefined;

function normalizeUtc(ts: string): string {
  return ts.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(ts) ? ts : `${ts}Z`;
}

/**
 * Example output:
 * 5 Jan 2026, 14:32
 * Today, 14:32
 * Yesterday, 09:10
 */
export function formatUtcToFriendlyLocal(
  utcTimestamp: NullableTimestamp,
  options?: { showTime?: boolean },
): string {
  if (!utcTimestamp) return "";

  const date = new Date(normalizeUtc(utcTimestamp));
  if (Number.isNaN(date.getTime())) return "";

  const hasTimeComponent = /T\d{2}:\d{2}/.test(utcTimestamp);
  const shouldShowTime = options?.showTime ?? true;
  const showTime = shouldShowTime && hasTimeComponent;

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfThatDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  const dayDiff =
    (startOfToday.getTime() - startOfThatDay.getTime()) / 86_400_000;

  const time = showTime
    ? date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  if (dayDiff === 0) return showTime ? `Today, ${time}` : "Today";
  if (dayDiff === 1) return showTime ? `Yesterday, ${time}` : "Yesterday";

  return (
    date.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) + (showTime ? `, ${time}` : "")
  );
}
