import { z } from "zod";

const DATE_INPUT_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const toDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getTodayDateInputValue = () => toDateInputValue(new Date());

export const getDateInputValueFromToday = (offsetDays: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return toDateInputValue(date);
};

type DateInputBound = string | (() => string);

interface DateInputStringOptions {
  min?: DateInputBound;
  max?: DateInputBound;
  invalidFormatMessage?: string;
  minMessage?: string;
  maxMessage?: string;
}

const resolveBound = (bound: DateInputBound | undefined) =>
  typeof bound === "function" ? bound() : bound;

const dateInputSuperRefine =
  ({
    min,
    max,
    invalidFormatMessage = "Invalid date",
    minMessage = "Date is too early",
    maxMessage = "Date is too late",
  }: DateInputStringOptions) =>
  (value: string | null | undefined, ctx: z.RefinementCtx) => {
    if (!value) return;

    if (!DATE_INPUT_REGEX.test(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: invalidFormatMessage,
      });
      return;
    }

    const minValue = resolveBound(min);
    if (minValue && value < minValue) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: minMessage,
      });
    }

    const maxValue = resolveBound(max);
    if (maxValue && value > maxValue) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: maxMessage,
      });
    }
  };

export const dateInputString = ({
  min,
  max,
  invalidFormatMessage = "Invalid date",
  minMessage = "Date is too early",
  maxMessage = "Date is too late",
}: DateInputStringOptions = {}) =>
  z.string().optional().or(z.literal("")).superRefine(
    dateInputSuperRefine({
      min,
      max,
      invalidFormatMessage,
      minMessage,
      maxMessage,
    }),
  );

export const nullableDateInputString = ({
  min,
  max,
  invalidFormatMessage = "Invalid date",
  minMessage = "Date is too early",
  maxMessage = "Date is too late",
}: DateInputStringOptions = {}) =>
  z
    .string()
    .optional()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .superRefine(
      dateInputSuperRefine({
        min,
        max,
        invalidFormatMessage,
        minMessage,
        maxMessage,
      }),
    );

interface RequiredDateInputStringOptions extends DateInputStringOptions {
  requiredMessage: string;
}

export const requiredDateInputString = ({
  requiredMessage,
  ...options
}: RequiredDateInputStringOptions) =>
  z.string().min(1, requiredMessage).superRefine(dateInputSuperRefine(options));
