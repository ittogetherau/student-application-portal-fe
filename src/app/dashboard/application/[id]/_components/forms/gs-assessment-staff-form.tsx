"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormInput } from "@/components/ui/forms/form-input";
import { FormTextarea } from "@/components/ui/forms/form-textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Save } from "lucide-react";
import {
  Controller,
  FormProvider,
  useForm,
  type Control,
  type Resolver,
} from "react-hook-form";
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

type YesNoAnswer = "yes" | "no" | "";
type ApprovalStatus = "approved" | "not-approved" | "not-applicable" | "";

export function GSAssessmentStaffForm() {
  const resolver = zodResolver(
    gsAssessmentStaffSchema,
  ) as Resolver<GSAssessmentStaffFormValues>;

  const methods = useForm<GSAssessmentStaffFormValues>({
    resolver,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const { handleSubmit, watch, control } = methods;

  const gsStatus = watch("gsStatus") ?? "";

  const onSubmit = (values: GSAssessmentStaffFormValues) => {
    const stage1 = STAGE_1_QUESTIONS.map((question, index) => ({
      ...question,
      answer: (values.stage1?.[index]?.answer ?? "") as YesNoAnswer,
      evidenceVerified: Boolean(values.stage1?.[index]?.evidenceVerified),
    }));

    const stage2 = STAGE_2_QUESTIONS.map((question, index) => ({
      ...question,
      answer: (values.stage2?.[index]?.answer ?? "") as YesNoAnswer,
      evidenceVerified: Boolean(values.stage2?.[index]?.evidenceVerified),
      approvalStatus: (values.stage2?.[index]?.approvalStatus ??
        "") as ApprovalStatus,
    }));

    const payload = {
      applicantDetails: {
        givenName: values.applicantDetails?.givenName ?? "",
        familyName: values.applicantDetails?.familyName ?? "",
        dob: values.applicantDetails?.dob ?? "",
        refNo: values.applicantDetails?.refNo ?? "",
        passportNo: values.applicantDetails?.passportNo ?? "",
        email: values.applicantDetails?.email ?? "",
      },
      stage1,
      stage2,
      gsStatus: (values.gsStatus ?? "") as "approved" | "not-approved" | "",
      notes: values.notes ?? "",
    };

    console.log("GSAssessmentStaffForm submit:", payload);
  };

  return (
    <FormProvider {...methods}>
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {/* Header */}
        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold">
            Genuine Student (GS) Assessment
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Complete the assessment form for the applicant
          </p>
        </div>

        {/* Applicant Details */}
        <div className="space-y-4">
          <h3 className="font-semibold">Applicant Detail</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              name="applicantDetails.givenName"
              label="Given Name(s)"
            />
            <FormInput name="applicantDetails.familyName" label="Family Name" />
            <FormInput name="applicantDetails.dob" label="DOB" type="date" />
            <FormInput
              name="applicantDetails.refNo"
              label="Student ID / Ref no"
            />
            <FormInput name="applicantDetails.passportNo" label="Passport No" />
            <FormInput
              name="applicantDetails.email"
              label="Email"
              type="email"
            />
          </div>
        </div>

        {/* Stage 1 - Application */}
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
                        />
                      </td>
                      <td className="p-3 text-center">
                        <YesNoCheckboxCell
                          control={control}
                          name={`stage1.${index}.answer`}
                          checkedValue="no"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <BooleanCheckboxCell
                          control={control}
                          name={`stage1.${index}.evidenceVerified`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Stage 2 - GTE Document */}
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
                        />
                      </td>
                      <td className="p-3 text-center">
                        <YesNoCheckboxCell
                          control={control}
                          name={`stage2.${index}.answer`}
                          checkedValue="no"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <BooleanCheckboxCell
                          control={control}
                          name={`stage2.${index}.evidenceVerified`}
                        />
                      </td>
                      <td className="p-3">
                        <ApprovalStatusSelectCell
                          control={control}
                          name={`stage2.${index}.approvalStatus`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Student GS Status */}
        <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
          <h3 className="font-semibold">Student GS Status</h3>
          <GSStatusRadio control={control} name="gsStatus" />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <FormTextarea
            name="notes"
            label="Note:"
            placeholder="Enter any additional notes or remarks..."
            rows={5}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-background py-4">
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Save Assessment
          </Button>
          <Button
            type="submit"
            className="gap-2 bg-green-600 hover:bg-green-700"
            disabled={!gsStatus}
          >
            <CheckCircle2 className="h-4 w-4" />
            Submit &amp; Complete
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

function YesNoCheckboxCell({
  control,
  name,
  checkedValue,
}: {
  control: Control<GSAssessmentStaffFormValues>;
  name: `stage1.${number}.answer` | `stage2.${number}.answer`;
  checkedValue: "yes" | "no";
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
        />
      )}
    />
  );
}

function BooleanCheckboxCell({
  control,
  name,
}: {
  control: Control<GSAssessmentStaffFormValues>;
  name:
    | `stage1.${number}.evidenceVerified`
    | `stage2.${number}.evidenceVerified`;
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
        />
      )}
    />
  );
}

function ApprovalStatusSelectCell({
  control,
  name,
}: {
  control: Control<GSAssessmentStaffFormValues>;
  name: `stage2.${number}.approvalStatus`;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange, ref } }) => (
        <select
          ref={ref}
          className="w-full px-2 py-1.5 text-xs border rounded-md bg-background"
          value={(value ?? "") as string}
          onChange={(e) => onChange(e.target.value || undefined)}
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
}: {
  control: Control<GSAssessmentStaffFormValues>;
  name: "gsStatus";
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange } }) => (
        <RadioGroup
          value={(value ?? "") as string}
          onValueChange={onChange}
          className="flex gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="approved" id="status-approved" />
            <Label
              htmlFor="status-approved"
              className="cursor-pointer font-normal"
            >
              ✓ Approved
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="not-approved" id="status-not-approved" />
            <Label
              htmlFor="status-not-approved"
              className="cursor-pointer font-normal"
            >
              ✗ Not Approved
            </Label>
          </div>
        </RadioGroup>
      )}
    />
  );
}
