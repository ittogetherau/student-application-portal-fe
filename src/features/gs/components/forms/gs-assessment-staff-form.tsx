"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { getFieldError } from "@/components/forms/form-errors";
import { FormInput } from "@/components/forms/form-input";
import { FormTextarea } from "@/components/forms/form-textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  useGSFinalizeDecisionMutation,
  useGSStaffAssessmentQuery,
  useGSStaffAssessmentSaveMutation,
  useGSStaffAssessmentSubmitMutation,
} from "@/hooks/useGSAssessment.hook";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Save } from "lucide-react";
import { memo, useCallback, useEffect } from "react";
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
  useWatch,
  type Control,
  type Resolver,
} from "react-hook-form";
import { toast } from "react-hot-toast";
import { siteRoutes } from "@/shared/constants/site-routes";
import { GSAssessmentPdfDownloadButton } from "./gs-assessment-pdf-download-button";
import {
  STAGE_1_QUESTIONS,
  STAGE_2_QUESTIONS,
  type StageQuestion,
} from "../../utils/gs-assessment-questions";
import { gsAssessmentStaffSchema } from "../../../../shared/validation/gs-assessment-staff.validation";
import { useRouter } from "next/navigation";

// Form input type (allows undefined for initial state, Zod validates on submit)
type GSAssessmentStaffFormInput = {
  applicantDetails: {
    givenName: string;
    familyName: string;
    dob: string;
    refNo: string;
    passportNo: string;
    email: string;
  };
  stage1: Array<{
    answer?: "yes" | "no";
    evidenceVerified: boolean;
  }>;
  stage2: Array<{
    answer?: "yes" | "no";
    evidenceVerified: boolean;
    approvalStatus?: "approved" | "not-approved" | "not-applicable";
  }>;
  gsStatus?: "approved" | "not_approved" | "conditional_approval";
  notes: string;
  conditions: string;
  riskLevel?: "low" | "medium" | "high";
};

// Default form values
const DEFAULT_VALUES: GSAssessmentStaffFormInput = {
  applicantDetails: {
    givenName: "",
    familyName: "",
    dob: "",
    refNo: "",
    passportNo: "",
    email: "",
  },
  stage1: STAGE_1_QUESTIONS.map(() => ({
    answer: undefined,
    evidenceVerified: false,
  })),
  stage2: STAGE_2_QUESTIONS.map(() => ({
    answer: undefined,
    evidenceVerified: false,
    approvalStatus: undefined,
  })),
  gsStatus: undefined,
  notes: "",
  conditions: "",
  riskLevel: undefined,
};

// Error display component using Controller for proper reactivity
function ErrorMessage({ name }: { name: string }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ fieldState: { error } }) =>
        error ? (
          <p className="text-sm text-red-500 mt-1">{error.message}</p>
        ) : (
          <></>
        )
      }
    />
  );
}

interface GSAssessmentStaffFormProps {
  applicationId?: string;
  readonly?: boolean;
  onSuccess?: () => void;
}

export function GSAssessmentStaffForm({
  applicationId,
  readonly = false,
  onSuccess,
}: GSAssessmentStaffFormProps) {
  const router = useRouter();

  const { data: staffAssessment, isLoading } = useGSStaffAssessmentQuery(
    applicationId ?? null,
  );

  const saveMutation = useGSStaffAssessmentSaveMutation(applicationId ?? null);
  const submitMutation = useGSStaffAssessmentSubmitMutation(
    applicationId ?? null,
  );
  const decisionMutation = useGSFinalizeDecisionMutation(applicationId ?? null);

  const methods = useForm<GSAssessmentStaffFormInput>({
    resolver: zodResolver(
      gsAssessmentStaffSchema,
    ) as Resolver<GSAssessmentStaffFormInput>,
    defaultValues: DEFAULT_VALUES,
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const { handleSubmit, control, reset, getValues, setValue, clearErrors } =
    methods;

  const isSubmitting =
    saveMutation.isPending ||
    submitMutation.isPending ||
    decisionMutation.isPending;

  const staffAssessmentData = staffAssessment?.data;
  const isSubmitted = staffAssessmentData?.status === "submitted";

  // Transform form values to API payload
  const transformToPayload = useCallback(
    (values: GSAssessmentStaffFormInput) => ({
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
    }),
    [],
  );

  type AnswerFieldName = `stage1.${number}.answer` | `stage2.${number}.answer`;
  type EvidenceFieldName =
    | `stage1.${number}.evidenceVerified`
    | `stage2.${number}.evidenceVerified`;

  const handleSelectAllAnswer = useCallback(
    (isChecked: boolean, stage: "stage1" | "stage2", value: "yes" | "no") => {
      const questions =
        stage === "stage1" ? STAGE_1_QUESTIONS : STAGE_2_QUESTIONS;
      const fieldsToClear: AnswerFieldName[] = [];

      questions.forEach((_, index) => {
        const fieldName = `${stage}.${index}.answer` as AnswerFieldName;
        setValue(fieldName, isChecked ? value : undefined);
        if (isChecked) fieldsToClear.push(fieldName);
      });

      if (isChecked && fieldsToClear.length > 0) clearErrors(fieldsToClear);
    },
    [setValue, clearErrors],
  );

  const handleSelectAllYes = useCallback(
    (isChecked: boolean, stage: "stage1" | "stage2") =>
      handleSelectAllAnswer(isChecked, stage, "yes"),
    [handleSelectAllAnswer],
  );

  const handleSelectAllNo = useCallback(
    (isChecked: boolean, stage: "stage1" | "stage2") =>
      handleSelectAllAnswer(isChecked, stage, "no"),
    [handleSelectAllAnswer],
  );

  const handleSelectAllEvidenceVerified = useCallback(
    (isChecked: boolean, stage: "stage1" | "stage2") => {
      const questions =
        stage === "stage1" ? STAGE_1_QUESTIONS : STAGE_2_QUESTIONS;

      questions.forEach((_, index) => {
        const fieldName =
          `${stage}.${index}.evidenceVerified` as EvidenceFieldName;
        setValue(fieldName, isChecked);
      });
    },
    [setValue],
  );

  // Populate form with API data
  useEffect(() => {
    const staffData = staffAssessment?.data;
    if (!staffData) return;

    const applicantDetails = staffData?.applicant_details as
      | Record<string, string>
      | undefined;
    const stage1Questions = staffData?.stage1_questions as
      | Array<{ answer?: string; evidence_verified?: boolean }>
      | undefined;
    const stage2Questions = staffData?.stage2_questions as
      | Array<{
          answer?: string;
          evidence_verified?: boolean;
          approval_status?: string;
        }>
      | undefined;

    reset({
      applicantDetails: {
        givenName: applicantDetails?.given_name || "",
        familyName: applicantDetails?.family_name || "",
        dob: applicantDetails?.dob || "",
        refNo: applicantDetails?.ref_no || "",
        passportNo: applicantDetails?.passport_no || "",
        email: applicantDetails?.email || "",
      },
      stage1:
        stage1Questions?.map((q) => ({
          answer: q.answer as "yes" | "no" | undefined,
          evidenceVerified: q.evidence_verified ?? false,
        })) ?? DEFAULT_VALUES.stage1,
      stage2:
        stage2Questions?.map((q) => ({
          answer: q.answer as "yes" | "no" | undefined,
          evidenceVerified: q.evidence_verified ?? false,
          approvalStatus: q.approval_status as
            | "approved"
            | "not-approved"
            | "not-applicable"
            | undefined,
        })) ?? DEFAULT_VALUES.stage2,
      gsStatus: staffData?.recommendation as
        | "approved"
        | "not_approved"
        | "conditional_approval"
        | undefined,
      notes: (staffData?.additional_comments as string) ?? "",
      conditions: (staffData?.conditions as string) ?? "",
      riskLevel: staffData?.risk_level as "low" | "medium" | "high" | undefined,
    });
  }, [staffAssessment, reset]);

  const handleSave = async () => {
    const values = getValues();
    try {
      await saveMutation.mutateAsync(transformToPayload(values));
      toast.success("Assessment saved");
    } catch {
      // Error handled by mutation
    }
  };

  const handleFormSubmit = async (values: GSAssessmentStaffFormInput) => {
    // Validation is handled by Zod schema - if we reach here, form is valid
    if (!values.gsStatus) return;

    try {
      await submitMutation.mutateAsync(transformToPayload(values));

      await decisionMutation.mutateAsync({
        final_decision: values.gsStatus,
        decision_rationale: values.notes || "",
      });

      toast.success("Assessment submitted");
      if (applicationId) {
        router.push(siteRoutes.dashboard.application.id.gs(applicationId));
      }
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

  const isReadonlyMode =
    readonly || staffAssessment?.data?.status === "submitted";

  return (
    <FormProvider {...methods}>
      <form className="space-y-6" onSubmit={handleSubmit(handleFormSubmit)}>
        {/* Header */}
        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold">
            Genuine Student (GS) Assessment
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isReadonlyMode
              ? "View the assessment form for the applicant"
              : "Complete the assessment form for the applicant"}
          </p>
        </div>

        {/* Applicant Details */}
        <div className="space-y-4">
          <h3 className="font-semibold">Applicant Detail</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              name="applicantDetails.givenName"
              label="Given Name(s)"
              disabled={isReadonlyMode}
            />
            <FormInput
              name="applicantDetails.familyName"
              label="Family Name"
              disabled={isReadonlyMode}
            />
            <FormInput
              name="applicantDetails.dob"
              label="DOB"
              type="date"
              disabled={isReadonlyMode}
            />
            <FormInput
              name="applicantDetails.refNo"
              label="Student ID / Ref no"
              disabled={isReadonlyMode}
            />
            <FormInput
              name="applicantDetails.passportNo"
              label="Passport No"
              disabled={isReadonlyMode}
            />
            <FormInput
              name="applicantDetails.email"
              label="Email"
              type="email"
              disabled={isReadonlyMode}
            />
          </div>
        </div>

        {/* Stage 1 Questions */}
        <StageQuestionsTable
          title="Stage 1 - Application"
          stage="stage1"
          questions={STAGE_1_QUESTIONS}
          control={control}
          isReadonlyMode={isReadonlyMode}
          onSelectAllYes={handleSelectAllYes}
          onSelectAllNo={handleSelectAllNo}
          onSelectAllEvidenceVerified={handleSelectAllEvidenceVerified}
          showApprovalStatus={false}
        />

        {/* Stage 2 Questions */}
        <StageQuestionsTable
          title="Stage 2 - GTE Document"
          stage="stage2"
          questions={STAGE_2_QUESTIONS}
          control={control}
          isReadonlyMode={isReadonlyMode}
          onSelectAllYes={handleSelectAllYes}
          onSelectAllNo={handleSelectAllNo}
          onSelectAllEvidenceVerified={handleSelectAllEvidenceVerified}
          showApprovalStatus={true}
        />

        {/* GS Status */}
        <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
          <h3 className="font-semibold">Student GS Status</h3>
          <GSStatusRadio control={control} disabled={isReadonlyMode} />
        </div>

        {/* Risk Level */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Risk Level</Label>
            <RiskLevelSelect control={control} disabled={isReadonlyMode} />
          </div>
        </div>

        {/* Conditions */}
        <FormTextarea
          name="conditions"
          label="Conditions:"
          placeholder="Enter any conditions for approval..."
          rows={3}
          disabled={isReadonlyMode}
        />

        {/* Notes */}
        <FormTextarea
          name="notes"
          label="Additional Comments:"
          placeholder="Enter any additional notes or remarks..."
          rows={5}
          disabled={isReadonlyMode}
        />

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-background py-4">
          {isSubmitted && (
            <GSAssessmentPdfDownloadButton
              data={staffAssessmentData}
              applicationId={applicationId}
              variant="secondary"
              className="gap-2"
            />
          )}

          {!isReadonlyMode && (
            <>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Submit Assessment
              </Button>

              <Button
                type="button"
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="gap-2"
                variant={"secondary"}
              >
                {saveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Draft
              </Button>
            </>
          )}
        </div>
      </form>
    </FormProvider>
  );
}

// ============================================================================
// Stage Questions Table Component
// ============================================================================

interface StageQuestionsTableProps {
  title: string;
  stage: "stage1" | "stage2";
  questions: StageQuestion[];
  control: Control<GSAssessmentStaffFormInput>;
  isReadonlyMode: boolean;
  onSelectAllYes: (isChecked: boolean, stage: "stage1" | "stage2") => void;
  onSelectAllNo: (isChecked: boolean, stage: "stage1" | "stage2") => void;
  onSelectAllEvidenceVerified: (
    isChecked: boolean,
    stage: "stage1" | "stage2",
  ) => void;
  showApprovalStatus: boolean;
}

const StageQuestionsTable = memo(function StageQuestionsTable({
  title,
  stage,
  questions,
  control,
  isReadonlyMode,
  onSelectAllYes,
  onSelectAllNo,
  onSelectAllEvidenceVerified,
  showApprovalStatus,
}: StageQuestionsTableProps) {
  const stageValues = useWatch({ control, name: stage });

  const answers = (stageValues ?? []).map((q) => q?.answer);
  const allYes = answers.length > 0 && answers.every((a) => a === "yes");
  const someYes = answers.some((a) => a === "yes");
  const yesChecked: boolean | "indeterminate" = allYes
    ? true
    : someYes
      ? "indeterminate"
      : false;

  const allNo = answers.length > 0 && answers.every((a) => a === "no");
  const someNo = answers.some((a) => a === "no");
  const noChecked: boolean | "indeterminate" = allNo
    ? true
    : someNo
      ? "indeterminate"
      : false;

  const evidence = (stageValues ?? []).map((q) => Boolean(q?.evidenceVerified));
  const allEvidence = evidence.length > 0 && evidence.every(Boolean);
  const someEvidence = evidence.some(Boolean);
  const evidenceChecked: boolean | "indeterminate" = allEvidence
    ? true
    : someEvidence
      ? "indeterminate"
      : false;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">{title}</h3>
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium min-w-[300px]">
                  Question
                </th>
                <th className="text-center p-3 font-medium w-[80px]">
                  <div className="flex items-center justify-center gap-2">
                    <Checkbox
                      checked={yesChecked}
                      onCheckedChange={(checked) =>
                        onSelectAllYes(checked === true, stage)
                      }
                      disabled={isReadonlyMode}
                      aria-label="Select all YES"
                    />
                    YES
                  </div>
                </th>
                <th className="text-center p-3 font-medium w-[80px]">
                  <div className="flex items-center justify-center gap-2">
                    <Checkbox
                      checked={noChecked}
                      onCheckedChange={(checked) =>
                        onSelectAllNo(checked === true, stage)
                      }
                      disabled={isReadonlyMode}
                      aria-label="Select all NO"
                    />
                    NO
                  </div>
                </th>
                <th className="text-center p-3 font-medium w-[150px]">
                  <div className="flex items-center justify-center gap-2">
                    <Checkbox
                      checked={evidenceChecked}
                      onCheckedChange={(checked) =>
                        onSelectAllEvidenceVerified(checked === true, stage)
                      }
                      disabled={isReadonlyMode}
                      aria-label="Select all evidence verified"
                    />
                    Evidence Verified
                  </div>
                </th>
                {showApprovalStatus && (
                  <th className="text-center p-3 font-medium w-[180px]">
                    Approval Status
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {questions.map((q, index) => (
                <tr
                  key={q.id}
                  className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}
                >
                  <td className="p-3 text-sm">
                    {q.question}
                    <ErrorMessage name={`${stage}.${index}.answer`} />
                  </td>
                  <td className="p-3 text-center">
                    <YesNoCheckbox
                      control={control}
                      name={`${stage}.${index}.answer`}
                      checkedValue="yes"
                      disabled={isReadonlyMode}
                    />
                  </td>
                  <td className="p-3 text-center">
                    <YesNoCheckbox
                      control={control}
                      name={`${stage}.${index}.answer`}
                      checkedValue="no"
                      disabled={isReadonlyMode}
                    />
                  </td>
                  <td className="p-3 text-center">
                    <EvidenceCheckbox
                      control={control}
                      name={`${stage}.${index}.evidenceVerified`}
                      disabled={isReadonlyMode}
                    />
                  </td>
                  {showApprovalStatus && (
                    <td className="p-3">
                      <ApprovalStatusSelect
                        control={control}
                        name={`stage2.${index}.approvalStatus`}
                        disabled={isReadonlyMode}
                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

// ============================================================================
// Form Field Components
// ============================================================================

const YesNoCheckbox = memo(function YesNoCheckbox({
  control,
  name,
  checkedValue,
  disabled,
}: {
  control: Control<GSAssessmentStaffFormInput>;
  name: `stage1.${number}.answer` | `stage2.${number}.answer`;
  checkedValue: "yes" | "no";
  disabled?: boolean;
}) {
  const { clearErrors } = useFormContext<GSAssessmentStaffFormInput>();

  return (
    <Controller
      name={name}
      control={control}
      render={({
        field: { value, onChange, ref },
        fieldState: { invalid },
      }) => (
        <Checkbox
          ref={ref}
          checked={value === checkedValue}
          onCheckedChange={(checked) => {
            if (checked) {
              onChange(checkedValue);
              clearErrors(name);
            }
          }}
          disabled={disabled}
          className={
            invalid
              ? "border-red-500 border-2 data-[state=unchecked]:border-red-500"
              : ""
          }
        />
      )}
    />
  );
});

const EvidenceCheckbox = memo(function EvidenceCheckbox({
  control,
  name,
  disabled,
}: {
  control: Control<GSAssessmentStaffFormInput>;
  name:
    | `stage1.${number}.evidenceVerified`
    | `stage2.${number}.evidenceVerified`;
  disabled?: boolean;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({
        field: { value, onChange, ref },
        fieldState: { invalid },
      }) => (
        <>
          <Checkbox
            ref={ref}
            checked={Boolean(value)}
            onCheckedChange={(checked) => onChange(checked === true)}
            disabled={disabled}
            className={invalid ? "border-red-500" : ""}
          />
        </>
      )}
    />
  );
});

const ApprovalStatusSelect = memo(function ApprovalStatusSelect({
  control,
  name,
  disabled,
}: {
  control: Control<GSAssessmentStaffFormInput>;
  name: `stage2.${number}.approvalStatus`;
  disabled?: boolean;
}) {
  const { clearErrors } = useFormContext<GSAssessmentStaffFormInput>();

  return (
    <Controller
      name={name}
      control={control}
      render={({
        field: { value, onChange, ref },
        fieldState: { invalid, error },
      }) => (
        <div>
          <select
            ref={ref}
            className={`w-full px-2 py-1.5 text-xs border rounded-md bg-background disabled:opacity-50 disabled:cursor-not-allowed ${
              invalid ? "border-red-500" : ""
            }`}
            value={value || ""}
            onChange={(e) => {
              const newValue = e.target.value || undefined;
              onChange(newValue);
              if (newValue) {
                clearErrors(name);
              }
            }}
            disabled={disabled}
          >
            <option value="">Select...</option>
            <option value="approved">Approved</option>
            <option value="not-approved">Not Approved</option>
            <option value="not-applicable">Not Applicable</option>
          </select>
          {error && (
            <p className="text-xs text-red-500 mt-1">{error.message}</p>
          )}
        </div>
      )}
    />
  );
});

const GSStatusRadio = memo(function GSStatusRadio({
  control,
  disabled,
}: {
  control: Control<GSAssessmentStaffFormInput>;
  disabled?: boolean;
}) {
  return (
    <Controller
      name="gsStatus"
      control={control}
      render={({
        field: { value, onChange },
        formState: { errors },
        fieldState: { invalid },
      }) => {
        const error = getFieldError(errors, "gsStatus")?.message;
        return (
          <>
            <RadioGroup
              value={value || ""}
              onValueChange={onChange}
              className={`flex flex-wrap gap-6 ${
                invalid ? "border border-red-500 p-2 rounded" : ""
              }`}
              disabled={disabled}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="approved"
                  id="status-approved"
                  disabled={disabled}
                />
                <Label
                  htmlFor="status-approved"
                  className={`cursor-pointer font-normal ${
                    disabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  ✓ Approved
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="not_approved"
                  id="status-not-approved"
                  disabled={disabled}
                />
                <Label
                  htmlFor="status-not-approved"
                  className={`cursor-pointer font-normal ${
                    disabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  ✗ Not Approved
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="conditional_approval"
                  id="status-conditional"
                  disabled={disabled}
                />
                <Label
                  htmlFor="status-conditional"
                  className={`cursor-pointer font-normal ${
                    disabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  ⚠ Conditional Approval
                </Label>
              </div>
            </RadioGroup>
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </>
        );
      }}
    />
  );
});

const RiskLevelSelect = memo(function RiskLevelSelect({
  control,
  disabled,
}: {
  control: Control<GSAssessmentStaffFormInput>;
  disabled?: boolean;
}) {
  return (
    <Controller
      name="riskLevel"
      control={control}
      render={({
        field: { value, onChange, ref },
        formState: { errors },
        fieldState: { invalid },
      }) => {
        const error = getFieldError(errors, "riskLevel")?.message;
        return (
          <>
            <select
              ref={ref}
              className={`w-full px-3 py-2 text-sm border rounded-md bg-background disabled:opacity-50 disabled:cursor-not-allowed ${
                invalid ? "border-red-500" : ""
              }`}
              value={value || ""}
              onChange={(e) => onChange(e.target.value || undefined)}
              disabled={disabled}
            >
              <option value="">Select risk level...</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </>
        );
      }}
    />
  );
});
