import { z } from "zod";

const requiredString = (label: string) =>
  z.string().min(1, `${label} is required`);

const requiredEmail = (label: string) =>
  z
    .string()
    .email(`${label} must be a valid email address`)
    .refine((value) => value.trim() !== "", {
      message: `${label} is required`,
    });

// Schema for Section 2: Basis for Credit (up to 2 rows in the PDF)
export const basisForCreditSchema = z.object({
  institution: z.string().optional(),
  country: z.string().optional(),
  courseCode: z.string().optional(),
  courseName: z.string().optional(),
});

// Schema for Section 3: Course Equivalence (up to 7 rows in the PDF)
export const courseEquivalenceSchema = z.object({
  unitCodeAndName: z.string().optional(),
  ciheEquivalent: z.string().optional(),
  approved: z.enum(["Yes", "No", ""]).optional(), // OFFICE USE ONLY
});

// Main Schema for the Student Form
export const advancedStandingSchema = z.object({
  studentType: z.enum(["Future Student", "Currently Enrolled Student"]),
  
  // Section 1: Student Details
  studentName: requiredString("Student Name"),
  dateOfBirth: requiredString("Date of Birth"),
  mobile: requiredString("Mobile"),
  email: requiredEmail("Email"),
  courseName: requiredString("Churchill Course Name"),

  // Section 2
  basisForCredit: z.array(basisForCreditSchema).max(2),

  // Section 3
  courseEquivalences: z.array(courseEquivalenceSchema).max(7),

  // Signature
  studentSignatureSvg: z.string().min(1, "Signature is required"),
  signatureDate: requiredString("Signature Date"),
  
  // Office Use Only
  staffSignatureSvg: z.string().optional(),
  staffDate: z.string().optional(),
  staffAssessments: z.array(z.object({ approved: z.enum(["Yes", "No", ""]) })).optional(),
});

export type AdvancedStandingFormValues = z.infer<typeof advancedStandingSchema>;
