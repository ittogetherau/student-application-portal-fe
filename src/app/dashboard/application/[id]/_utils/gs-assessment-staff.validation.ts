import { z } from "zod";

// Define custom schemas with error messages using z.enum for proper error handling
const yesNoSchema = z.enum(["yes", "no"], {
  message: "Select Yes or No",
});

const approvalStatusSchema = z.enum(["approved", "not-approved", "not-applicable"], {
  message: "Select status",
});

const riskLevelSchema = z.enum(["low", "medium", "high"], {
  message: "Select level",
});

const gsStatusSchema = z.enum(["approved", "not_approved", "conditional_approval"], {
  message: "Select status",
});

export const gsAssessmentStaffSchema = z.object({
  applicantDetails: z.object({
    givenName: z.string().min(1, { message: "Required" }),
    familyName: z.string().min(1, { message: "Required" }),
    dob: z.string().min(1, { message: "Required" }),
    refNo: z.string().min(1, { message: "Required" }),
    passportNo: z.string().min(1, { message: "Required" }),
    email: z.string().min(1, { message: "Required" }).email({ message: "Invalid email" }),
  }),

  stage1: z.array(
    z.object({
      answer: yesNoSchema,
      evidenceVerified: z.boolean(),
    })
  ),

  stage2: z.array(
    z.object({
      answer: yesNoSchema,
      evidenceVerified: z.boolean(),
      approvalStatus: approvalStatusSchema,
    })
  ),

  gsStatus: gsStatusSchema,
  notes: z.string().min(1, { message: "Required" }),
  conditions: z.string().min(1, { message: "Required" }),
  riskLevel: riskLevelSchema,
});

// Define the types explicitly to maintain compatibility
export type GSAssessmentStaffFormValues = {
  applicantDetails: {
    givenName: string;
    familyName: string;
    dob: string;
    refNo: string;
    passportNo: string;
    email: string;
  };
  stage1: Array<{
    answer: "yes" | "no";
    evidenceVerified: boolean;
  }>;
  stage2: Array<{
    answer: "yes" | "no";
    evidenceVerified: boolean;
    approvalStatus: "approved" | "not-approved" | "not-applicable";
  }>;
  gsStatus: "approved" | "not_approved" | "conditional_approval";
  notes: string;
  conditions: string;
  riskLevel: "low" | "medium" | "high";
};

