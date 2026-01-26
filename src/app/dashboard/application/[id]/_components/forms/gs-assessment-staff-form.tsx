"use client";

import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { CheckCircle2, Loader2, Save } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Controller,
  FormProvider,
  useForm,
  type Control,
  type Resolver,
} from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormInput } from "@/components/ui/forms/form-input";
import { FormTextarea } from "@/components/ui/forms/form-textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  useGSStaffAssessmentQuery,
  useGSStaffAssessmentSaveMutation,
  useGSStaffAssessmentSubmitMutation,
  useGSFinalizeDecisionMutation,
} from "@/hooks/useGSAssessment.hook";
import {
  gsAssessmentStaffSchema,
  type GSAssessmentStaffFormValues,
} from "../../_utils/gs-assessment-staff.validation";

interface StageQuestion {
  id: string;
  question: string;
}

const STAGE_1_QUESTIONS: StageQuestion[] = [
  {
    id: "q1",
    question:
      "Have you explained the academic entry requirements of the applied program/package programs to the applicant?",
  },
  {
    id: "q2",
    question:
      "Does the applicant meet the English Language Proficiency (ELP) requirements?",
  },
  {
    id: "q3",
    question:
      "Has the applicant been advised of the study details, including content, duration, tuition fees, campus location, and career opportunities on completion of the program(s)?",
  },
  {
    id: "q4",
    question:
      "If the applicant is seeking credit/recognition of previous learning (RPL), have the relevant course outlines been provided?",
  },
  {
    id: "q5",
    question:
      "Are you satisfied that the program the applicant has selected is linked to their previous educational background and/or future career aspirations? Has evidence been sighted to support this?",
  },
  {
    id: "q6",
    question:
      "Are there any gaps in the applicant's study or employment history? If yes, provide details with supporting documentation.",
  },
  {
    id: "q7",
    question:
      "Has the applicant ever been excluded from another institution? If yes, provide details with supporting documentation.",
  },
];

const STAGE_2_QUESTIONS: StageQuestion[] = [
  {
    id: "s2q1",
    question:
      "Has the student provided a signed letter of offer issued by the provider?",
  },
  {
    id: "s2q2",
    question: "Did the student submit other supporting documents?",
  },
  {
    id: "s2q3",
    question:
      "Do the financial documents submitted by the student, including all supporting documents, meet the CIHE GS requirement?",
  },
  {
    id: "s2q4",
    question:
      "Has the student provided proof of relationship for all financial sponsors?",
  },
  {
    id: "s2q5",
    question:
      "Has the student been interviewed by the admission team of Churchill Institute of Higher Education?",
  },
  {
    id: "s2q6",
    question: "Student fee payment has been verified",
  },
];

interface GSAssessmentStaffFormProps {
  applicationId?: string;
  readOnly?: boolean;
  onSuccess?: () => void;
}

export function GSAssessmentStaffForm({
  applicationId,
  readOnly = false,
  onSuccess,
}: GSAssessmentStaffFormProps) {
  const { data: staffAssessment, isLoading } = useGSStaffAssessmentQuery(
    applicationId ?? null
  );

  const saveMutation = useGSStaffAssessmentSaveMutation(applicationId ?? null);
  const submitMutation = useGSStaffAssessmentSubmitMutation(applicationId ?? null);
  const decisionMutation = useGSFinalizeDecisionMutation(applicationId ?? null);

  const resolver = zodResolver(
    gsAssessmentStaffSchema
  ) as Resolver<GSAssessmentStaffFormValues>;

  const methods = useForm<GSAssessmentStaffFormValues>({
    resolver,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const { handleSubmit, watch, control, reset, getValues } = methods;
  const gsStatus = watch("gsStatus") ?? "";

  useEffect(() => {
    const staffData = staffAssessment?.data;

    const applicantDetails = staffData?.applicant_details as Record<string, string> | undefined;
    const stage1Questions = staffData?.stage1_questions as Array<{
      answer?: string;
      evidence_verified?: boolean;
    }> | undefined;
    const stage2Questions = staffData?.stage2_questions as Array<{
      answer?: string;
      evidence_verified?: boolean;
      approval_status?: string;
    }> | undefined;

    reset({
      applicantDetails: {
        givenName: applicantDetails?.given_name || "",
        familyName: applicantDetails?.family_name || "",
        dob: applicantDetails?.dob || "",
        refNo: applicantDetails?.ref_no || "",
        passportNo: applicantDetails?.passport_no || "",
        email: applicantDetails?.email || "",
      },
      stage1: stage1Questions?.map((q) => ({
        answer: q.answer as "yes" | "no" | undefined,
        evidenceVerified: q.evidence_verified,
      })) ?? [],
      stage2: stage2Questions?.map((q) => ({
        answer: q.answer as "yes" | "no" | undefined,
        evidenceVerified: q.evidence_verified,
        approvalStatus: q.approval_status as "approved" | "not-approved" | "not-applicable" | undefined,
      })) ?? [],
      gsStatus: staffData?.recommendation as "approved" | "not_approved" | "conditional_approval" | undefined,
      notes: staffData?.additional_comments ?? "",
      conditions: staffData?.conditions ?? "",
      riskLevel: staffData?.risk_level as "low" | "medium" | "high" | undefined,
    });
  }, [staffAssessment, reset]);

  const transformToPayload = (values: GSAssessmentStaffFormValues) => ({
    applicant_details: {
      given_name: values.applicantDetails?.givenName ?? "",
      family_name: values.applicantDetails?.familyName ?? "",
      dob: values.applicantDetails?.dob ?? "",
      ref_no: values.applicantDetails?.refNo ?? "",
      passport_no: values.applicantDetails?.passportNo ?? "",
      email: values.applicantDetails?.email ?? "",
    },
    stage1_questions: STAGE_1_QUESTIONS.map((q, i) => ({
      id: q.id,
      question: q.question,
      answer: values.stage1?.[i]?.answer ?? "",
      evidence_verified: values.stage1?.[i]?.evidenceVerified ?? false,
    })),
    stage2_questions: STAGE_2_QUESTIONS.map((q, i) => ({
      id: q.id,
      question: q.question,
      answer: values.stage2?.[i]?.answer ?? "",
      evidence_verified: values.stage2?.[i]?.evidenceVerified ?? false,
      approval_status: values.stage2?.[i]?.approvalStatus ?? "",
    })),
    ...(values.gsStatus && { recommendation: values.gsStatus }),
    ...(values.notes && { additional_comments: values.notes }),
    ...(values.conditions && { conditions: values.conditions }),
    ...(values.riskLevel && { risk_level: values.riskLevel }),
  });

  const handleSave = async () => {
    const values = getValues();
    try {
      await saveMutation.mutateAsync(transformToPayload(values));
      toast.success("Assessment saved");
    } catch {
      // Error handled by mutation
    }
  };

  const handleFormSubmit = async (values: GSAssessmentStaffFormValues) => {
    try {
      await submitMutation.mutateAsync(transformToPayload(values));

      if (values.gsStatus) {
        await decisionMutation.mutateAsync({
          final_decision: values.gsStatus,
          decision_rationale: values.notes || "",
        });
      }

      toast.success("Assessment submitted");
      onSuccess?.();
    } catch {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form className="space-y-6">
        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold">
            Genuine Student (GS) Assessment
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {readOnly
              ? "View the assessment form for the applicant"
              : "Complete the assessment form for the applicant"}
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Applicant Detail</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              name="applicantDetails.givenName"
              label="Given Name(s)"
              disabled={readOnly}
            />
            <FormInput
              name="applicantDetails.familyName"
              label="Family Name"
              disabled={readOnly}
            />
            <FormInput
              name="applicantDetails.dob"
              label="DOB"
              type="date"
              disabled={readOnly}
            />
            <FormInput
              name="applicantDetails.refNo"
              label="Student ID / Ref no"
              disabled={readOnly}
            />
            <FormInput
              name="applicantDetails.passportNo"
              label="Passport No"
              disabled={readOnly}
            />
            <FormInput
              name="applicantDetails.email"
              label="Email"
              type="email"
              disabled={readOnly}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Stage 1 - Application</h3>
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium min-w-[300px]">
                      Question
                    </th>
                    <th className="text-center p-3 font-medium w-[80px]">
                      YES
                    </th>
                    <th className="text-center p-3 font-medium w-[80px]">
                      NO
                    </th>
                    <th className="text-center p-3 font-medium w-[150px]">
                      Evidence Verified
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {STAGE_1_QUESTIONS.map((q, index) => (
                    <tr
                      key={q.id}
                      className={
                        index % 2 === 0 ? "bg-background" : "bg-muted/20"
                      }
                    >
                      <td className="p-3 text-sm">{q.question}</td>
                      <td className="p-3 text-center">
                        <YesNoCheckboxCell
                          control={control}
                          name={`stage1.${index}.answer`}
                          checkedValue="yes"
                          disabled={readOnly}
                        />
                      </td>
                      <td className="p-3 text-center">
                        <YesNoCheckboxCell
                          control={control}
                          name={`stage1.${index}.answer`}
                          checkedValue="no"
                          disabled={readOnly}
                        />
                      </td>
                      <td className="p-3 text-center">
                        <BooleanCheckboxCell
                          control={control}
                          name={`stage1.${index}.evidenceVerified`}
                          disabled={readOnly}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Stage 2 - GTE Document</h3>
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium min-w-[300px]">
                      Question
                    </th>
                    <th className="text-center p-3 font-medium w-[80px]">
                      YES
                    </th>
                    <th className="text-center p-3 font-medium w-[80px]">
                      NO
                    </th>
                    <th className="text-center p-3 font-medium w-[150px]">
                      Evidence Verified
                    </th>
                    <th className="text-center p-3 font-medium w-[180px]">
                      Approval Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {STAGE_2_QUESTIONS.map((q, index) => (
                    <tr
                      key={q.id}
                      className={
                        index % 2 === 0 ? "bg-background" : "bg-muted/20"
                      }
                    >
                      <td className="p-3 text-sm">{q.question}</td>
                      <td className="p-3 text-center">
                        <YesNoCheckboxCell
                          control={control}
                          name={`stage2.${index}.answer`}
                          checkedValue="yes"
                          disabled={readOnly}
                        />
                      </td>
                      <td className="p-3 text-center">
                        <YesNoCheckboxCell
                          control={control}
                          name={`stage2.${index}.answer`}
                          checkedValue="no"
                          disabled={readOnly}
                        />
                      </td>
                      <td className="p-3 text-center">
                        <BooleanCheckboxCell
                          control={control}
                          name={`stage2.${index}.evidenceVerified`}
                          disabled={readOnly}
                        />
                      </td>
                      <td className="p-3">
                        <ApprovalStatusSelectCell
                          control={control}
                          name={`stage2.${index}.approvalStatus`}
                          disabled={readOnly}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
          <h3 className="font-semibold">Student GS Status</h3>
          <GSStatusRadio control={control} name="gsStatus" disabled={readOnly} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Risk Level</Label>
            <RiskLevelSelect control={control} name="riskLevel" disabled={readOnly} />
          </div>
        </div>

        <div className="space-y-2">
          <FormTextarea
            name="conditions"
            label="Conditions:"
            placeholder="Enter any conditions for approval..."
            rows={3}
            disabled={readOnly}
          />
        </div>

        <div className="space-y-2">
          <FormTextarea
            name="notes"
            label="Additional Comments:"
            placeholder="Enter any additional notes or remarks..."
            rows={5}
            disabled={readOnly}
          />
        </div>

        {!readOnly && (
          <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-background py-4">
            <Button
              type="button"
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="gap-2"
            >
              {saveMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Assessment
            </Button>
            <Button
              type="button"
              onClick={handleSubmit(handleFormSubmit)}
              className="gap-2 bg-green-600 hover:bg-green-700"
              disabled={!gsStatus || submitMutation.isPending || decisionMutation.isPending}
            >
              {(submitMutation.isPending || decisionMutation.isPending) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Submit & Complete
            </Button>
          </div>
        )}
      </form>
    </FormProvider>
  );
}

function YesNoCheckboxCell({
  control,
  name,
  checkedValue,
  disabled,
}: {
  control: Control<GSAssessmentStaffFormValues>;
  name: `stage1.${number}.answer` | `stage2.${number}.answer`;
  checkedValue: "yes" | "no";
  disabled?: boolean;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange, ref } }) => (
        <Checkbox
          ref={ref}
          checked={value === checkedValue}
          onCheckedChange={(checked) =>
            onChange(checked === true ? checkedValue : undefined)
          }
          disabled={disabled}
        />
      )}
    />
  );
}

function BooleanCheckboxCell({
  control,
  name,
  disabled,
}: {
  control: Control<GSAssessmentStaffFormValues>;
  name:
    | `stage1.${number}.evidenceVerified`
    | `stage2.${number}.evidenceVerified`;
  disabled?: boolean;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange, ref } }) => (
        <Checkbox
          ref={ref}
          checked={Boolean(value)}
          onCheckedChange={(checked) => onChange(checked === true)}
          disabled={disabled}
        />
      )}
    />
  );
}

function ApprovalStatusSelectCell({
  control,
  name,
  disabled,
}: {
  control: Control<GSAssessmentStaffFormValues>;
  name: `stage2.${number}.approvalStatus`;
  disabled?: boolean;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange, ref } }) => (
        <select
          ref={ref}
          className="w-full px-2 py-1.5 text-xs border rounded-md bg-background disabled:opacity-50 disabled:cursor-not-allowed"
          value={(value ?? "") as string}
          onChange={(e) => onChange(e.target.value || undefined)}
          disabled={disabled}
        >
          <option value="">Select...</option>
          <option value="approved">Approved</option>
          <option value="not-approved">Not Approved</option>
          <option value="not-applicable">Not Applicable</option>
        </select>
      )}
    />
  );
}

function GSStatusRadio({
  control,
  name,
  disabled,
}: {
  control: Control<GSAssessmentStaffFormValues>;
  name: "gsStatus";
  disabled?: boolean;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange } }) => (
        <RadioGroup
          value={(value ?? "") as string}
          onValueChange={onChange}
          className="flex flex-wrap gap-6"
          disabled={disabled}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="approved" id="status-approved" disabled={disabled} />
            <Label
              htmlFor="status-approved"
              className={`cursor-pointer font-normal ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              ✓ Approved
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="not_approved" id="status-not-approved" disabled={disabled} />
            <Label
              htmlFor="status-not-approved"
              className={`cursor-pointer font-normal ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              ✗ Not Approved
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="conditional_approval" id="status-conditional" disabled={disabled} />
            <Label
              htmlFor="status-conditional"
              className={`cursor-pointer font-normal ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              ⚠ Conditional Approval
            </Label>
          </div>
        </RadioGroup>
      )}
    />
  );
}

function RiskLevelSelect({
  control,
  name,
  disabled,
}: {
  control: Control<GSAssessmentStaffFormValues>;
  name: "riskLevel";
  disabled?: boolean;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange, ref } }) => (
        <select
          ref={ref}
          className="w-full px-3 py-2 text-sm border rounded-md bg-background disabled:opacity-50 disabled:cursor-not-allowed"
          value={(value ?? "") as string}
          onChange={(e) => onChange(e.target.value || undefined)}
          disabled={disabled}
        >
          <option value="">Select risk level...</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      )}
    />
  );
}
