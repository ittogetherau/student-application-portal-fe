import { Primitive, toText } from "../components/sync-review/field";

const asPrimitive = (value: unknown): Primitive =>
  typeof value === "string" ||
  typeof value === "number" ||
  typeof value === "boolean" ||
  value === null ||
  value === undefined
    ? value
    : undefined;

export const formatYesNo = (value: unknown) => {
  const s = toText(asPrimitive(value));
  if (!s) return "";
  const lower = s.toLowerCase();
  if (lower === "yes") return "Yes";
  if (lower === "no") return "No";
  return s;
};

export const formatYesNoNa = (value: unknown) => {
  const s = toText(asPrimitive(value));
  if (!s) return "";
  const lower = s.toLowerCase();
  if (lower === "yes") return "Yes";
  if (lower === "no") return "No";
  if (lower === "na" || lower === "n/a") return "N/A";
  return s;
};

export const formatClassType = (value: unknown) => {
  const s = toText(asPrimitive(value));
  if (!s) return "";
  return s
    .split(/[\s_-]+/g)
    .filter(Boolean)
    .map((p) => p[0]?.toUpperCase() + p.slice(1))
    .join(" ");
};
