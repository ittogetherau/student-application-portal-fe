import { z } from "zod";

// utls
const yesNoEnum = z.enum(["yes", "no"]);
const trim = (value?: unknown) => (typeof value === "string" ? value.trim() : "");

const requiredYesNo = (label: string) =>
  yesNoEnum.optional().refine((value) => value === "yes" || value === "no", {
    message: `${label} selection is required`,
  });

const requiredString = (label: string) =>
  z.string().min(1, `${label} is required`);
const requiredEmail = (label: string) =>
  z
    .string()
    .email(`${label} must be a valid email address`)
    .refine((value) => value.trim() !== "", {
      message: `${label} is required`,
    });

const requiredNumber = (label: string) =>
  z.coerce
    .number({
      error: `${label} is required`,
    })
    .min(0, `${label} must be 0 or greater`);

// schema (base object)
const gsScreeningFieldsSchema = z.object({
  firstName: requiredString("First name"),
  lastName: requiredString("Last name"),
  dateOfBirth: requiredString("Date of birth"),
  studentId: requiredString("Student ID / Reference number"),
  passportNumber: requiredString("Passport number"),
  email: requiredEmail("Email"),

  currentlyInAustralia: requiredYesNo("Current location"),
  currentVisaDocument: z.string().optional(),

  intendToApplyStudentVisa: requiredYesNo("Intent to apply for a student visa"),

  visaRefusedOrCancelled: requiredYesNo("Visa refusal history"),
  visaRefusalExplanation: z.string().optional(),
  visaRefusalDocument: z.string().optional(),

  familyVisaRefusedOrCancelled: requiredYesNo("Family visa refusal history"),
  familyVisaRefusalDocument: z.string().optional(),

  currentSituation: requiredString("Current situation"),
  reasonsForCourse: requiredString("Reasons for course"),
  careerBenefits: requiredString("Career benefits"),
  studyHistoryInAustralia: z.string().optional(),
  reasonForStudentVisa: z.string().optional(),
  otherInformation: requiredString("Other information"),

  isMarried: requiredYesNo("Marital status"),
  marriageCertificate: z.string().optional(),

  hasChildren: requiredYesNo("Dependent children"),
  childrenBirthCertificates: z.string().optional(),

  hasRelativesInAustralia: requiredYesNo("Relatives in Australia"),
  relativesAreCitizens: yesNoEnum.optional(),
  relativesRelationshipType: z.string().optional(),
  relativesVisaType: z.string().optional(),
  relationshipDetails: requiredString("Relationship details"),
  intendToLiveWithRelatives: yesNoEnum.optional(),

  campusLocation: requiredString("Campus location"),
  intendedSuburb: requiredString("Intended suburb"),
  knowledgeAboutAustralia: requiredString("Knowledge about Australia"),

  travelApplicant: requiredNumber("Applicant travel cost"),
  travelFamily: requiredNumber("Family travel cost"),
  tuitionApplicant: requiredNumber("Applicant tuition"),
  tuitionFamily: requiredNumber("Family tuition"),
  oshcApplicant: requiredNumber("Applicant OSHC"),
  oshcFamily: requiredNumber("Family OSHC"),
  livingExpensesApplicant: requiredNumber("Applicant living expenses"),
  livingExpensesFamily: requiredNumber("Family living expenses"),

  applicantFullName: requiredString("Applicant full name"),
  applicantDate: requiredString("Applicant date"),

  agentAgencyName: z.string().optional(),
  agentCounsellorName: z.string().optional(),
  agentDate: z.string().optional(),

  applicantSignature: z.string().optional(),
  agentSignature: z.string().optional(),
});

// Student schema includes conditional document requirements.
export const gsScreeningSchema = gsScreeningFieldsSchema.superRefine(
  (values, ctx) => {
    if (values.currentlyInAustralia === "yes") {
      if (trim(values.currentVisaDocument) === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["currentVisaDocument"],
          message: "Current visa or bridging visa details are required",
        });
      }
    }

    if (values.visaRefusedOrCancelled === "yes") {
      if (trim(values.visaRefusalExplanation) === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["visaRefusalExplanation"],
          message:
            "Visa refusal explanation is required when you have had a visa refused or cancelled",
        });
      }

      if (trim(values.visaRefusalDocument) === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["visaRefusalDocument"],
          message: "Visa refusal or cancellation document reference is required",
        });
      }
    }

    if (values.familyVisaRefusedOrCancelled === "yes") {
      if (trim(values.familyVisaRefusalDocument) === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["familyVisaRefusalDocument"],
          message:
            "Family visa refusal document reference is required when a relative has had a visa refused or cancelled",
        });
      }
    }

    if (values.isMarried === "yes" && trim(values.marriageCertificate) === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["marriageCertificate"],
        message: "Marriage certificate or partner details are required",
      });
    }

    if (
      values.hasChildren === "yes" &&
      trim(values.childrenBirthCertificates) === ""
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["childrenBirthCertificates"],
        message: "Children birth certificate details are required",
      });
    }

    if (values.hasRelativesInAustralia === "yes") {
      if (
        values.relativesAreCitizens !== "yes" &&
        values.relativesAreCitizens !== "no"
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["relativesAreCitizens"],
          message: "Relative citizenship status selection is required",
        });
      }

      if (trim(values.relativesRelationshipType) === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["relativesRelationshipType"],
          message:
            "Tell us how you are related to the family member(s) living in Australia",
        });
      }

      if (
        values.relativesAreCitizens === "no" &&
        trim(values.relativesVisaType) === ""
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["relativesVisaType"],
          message:
            "Visa type and subclass for your relatives is required when they are not citizens or permanent residents",
        });
      }

      if (
        values.intendToLiveWithRelatives !== "yes" &&
        values.intendToLiveWithRelatives !== "no"
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["intendToLiveWithRelatives"],
          message: "Intent to live with relatives selection is required",
        });
      }
    }
  },
);

export type GSScreeningFormValues = z.infer<typeof gsScreeningFieldsSchema>;

export type DeclarationViewType = "student" | "agent";

export const createGSScreeningSchema = (viewType: DeclarationViewType) => {
  const baseSchema =
    viewType === "agent"
      ? z
          .object({
            agentAgencyName: z.string().optional(),
            agentCounsellorName: z.string().optional(),
            agentDate: z.string().optional(),
            agentSignature: z.string().optional(),
          })
          .passthrough()
      : gsScreeningSchema;

  return baseSchema.superRefine((values, ctx) => {
    if (viewType === "agent") {
      if (!values.agentAgencyName || trim(values.agentAgencyName) === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["agentAgencyName"],
          message: "Agent agency name is required",
        });
      }
      if (
        !values.agentCounsellorName ||
        trim(values.agentCounsellorName) === ""
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["agentCounsellorName"],
          message: "Agent counsellor name is required",
        });
      }
      if (!values.agentDate || trim(values.agentDate) === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["agentDate"],
          message: "Agent date is required",
        });
      }

      if (!values.agentSignature || trim(values.agentSignature) === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["agentSignature"],
          message: "Agent signature is required",
        });
      }
    } else {
      if (
        !values.applicantSignature ||
        trim(values.applicantSignature) === ""
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["applicantSignature"],
          message: "Applicant signature is required",
        });
      }
    }
  });
};
