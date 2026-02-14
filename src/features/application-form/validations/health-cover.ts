import { z } from "zod";

export const healthCoverSchema = z
  .object({
    arrange_OSHC: z.boolean({
      message: "Please select whether you wish to arrange OSHC",
    }),
    OSHC_provider: z.string().nullish(),
    OSHC_type: z.enum(["Single", "Couple", "Family"]).nullish(),
    OSHC_start_date: z.string().nullish(),
    OSHC_end_date: z.string().nullish(),
    OSHC_duration: z.string().nullish(),
    OSHC_fee: z.number().nonnegative("OSHC fee must be zero or positive").nullable(),
  })
  .superRefine((val, ctx) => {
    // Only validate OSHC fields if user selected true for arrange_OSHC
    if (val.arrange_OSHC) {
      if (!val.OSHC_provider || val.OSHC_provider.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["OSHC_provider"],
          message: "OSHC Provider is required",
        });
      }

      if (!val.OSHC_type) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["OSHC_type"],
          message: "OSHC Type is required",
        });
      }

      if (!val.OSHC_start_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["OSHC_start_date"],
          message: "Start date is required",
        });
      }

      if (!val.OSHC_end_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["OSHC_end_date"],
          message: "End date is required",
        });
      }

      if (!val.OSHC_duration || val.OSHC_duration.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["OSHC_duration"],
          message: "OSHC Duration is required",
        });
      }

      if (val.OSHC_fee === undefined || val.OSHC_fee === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["OSHC_fee"],
          message: "OSHC Fee is required",
        });
      }

      // Date validation only if both dates are provided
      if (val.OSHC_start_date && val.OSHC_end_date) {
        const start = new Date(val.OSHC_start_date);
        const end = new Date(val.OSHC_end_date);

        if (
          !Number.isNaN(start.getTime()) &&
          !Number.isNaN(end.getTime()) &&
          end <= start
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["OSHC_end_date"],
            message: "End date must be after the start date",
          });
        }
      }
    }
  });

export type HealthCoverValues = z.infer<typeof healthCoverSchema>;

export const defaultHealthCoverValues: HealthCoverValues = {
  arrange_OSHC: false,
  OSHC_provider: "",
  OSHC_type: undefined,
  OSHC_start_date: "",
  OSHC_end_date: "",
  OSHC_duration: "",
  OSHC_fee: 0,
};
