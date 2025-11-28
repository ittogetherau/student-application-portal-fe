import { z } from "zod";

export const healthCoverSchema = z.object({
  provider: z.string().min(1, "Provider is required"),
  policy_number: z.string().min(1, "Policy number is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  coverage_type: z.string().min(1, "Coverage type is required"),
  cost: z.number().nonnegative("Cost must be zero or positive"),
});

export type HealthCoverValues = z.infer<typeof healthCoverSchema>;

export const defaultHealthCoverValues: HealthCoverValues = {
  provider: "",
  policy_number: "",
  start_date: "",
  end_date: "",
  coverage_type: "",
  cost: 0,
};
