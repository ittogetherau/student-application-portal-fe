"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormInput } from "@/components/ui/forms/form-input";
import { FormRadio } from "@/components/ui/forms/form-radio";
import { FormTextarea } from "@/components/ui/forms/form-textarea";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  FileText,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useState, useEffect } from "react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  createGSScreeningSchema,
  GSScreeningFormValues,
} from "../_utils/gs-screening.validation";
import {
  useGSStudentDeclarationSaveByTokenMutation,
  useGSStudentDeclarationSubmitByTokenMutation,
  useGSStudentDeclarationSaveMutation,
  useGSStudentDeclarationSubmitMutation,
  useGSAgentDeclarationSaveMutation,
  useGSAgentDeclarationSubmitMutation,
} from "@/hooks/useGSAssessment.hook";

const defaultValues: GSScreeningFormValues = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  studentId: "",
  passportNumber: "",
  email: "",

  currentlyInAustralia: undefined,
  currentVisaDocument: "",

  intendToApplyStudentVisa: undefined,

  visaRefusedOrCancelled: undefined,
  visaRefusalExplanation: "",
  visaRefusalDocument: "",

  familyVisaRefusedOrCancelled: undefined,
  familyVisaRefusalDocument: "",

  currentSituation: "",
  reasonsForCourse: "",
  careerBenefits: "",
  otherInformation: "",
  studyHistoryInAustralia: "",
  reasonForStudentVisa: "",

  isMarried: undefined,
  marriageCertificate: "",

  hasChildren: undefined,
  childrenBirthCertificates: "",

  hasRelativesInAustralia: undefined,
  relativesAreCitizens: undefined,
  relativesRelationshipType: "",
  relativesVisaType: "",
  relationshipDetails: "",
  intendToLiveWithRelatives: undefined,

  campusLocation: "",
  intendedSuburb: "",
  knowledgeAboutAustralia: "",

  travelApplicant: 0,
  travelFamily: 0,
  tuitionApplicant: 0,
  tuitionFamily: 0,
  oshcApplicant: 0,
  oshcFamily: 0,
  livingExpensesApplicant: 0,
  livingExpensesFamily: 0,

  applicantFullName: "",
  applicantDate: "",

  agentAgencyName: "",
  agentCounsellorName: "",
  agentDate: "",
};

const yesNoOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

type DeclarationView = "student" | "agent";

interface GSScreeningFormProps {
  currentView: DeclarationView;
  trackingId?: string;
  token?: string;
  applicationId?: string;
  readOnly?: boolean;
  initialData?: Partial<GSScreeningFormValues>;
  handleBack?: () => void;
}

export function GSScreeningForm({
  currentView,
  trackingId,
  token,
  applicationId,
  readOnly = false,
  initialData,
  handleBack,
}: GSScreeningFormProps) {
  const resolver = zodResolver(
    createGSScreeningSchema(currentView),
  ) as Resolver<GSScreeningFormValues>;

  const mergedDefaults = { ...defaultValues, ...(initialData ?? {}) };

  const methods = useForm<GSScreeningFormValues>({
    resolver,
    defaultValues: mergedDefaults,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const { handleSubmit, watch, reset } = methods;

  useEffect(() => {
    if (initialData != null) {
      reset({ ...defaultValues, ...initialData });
    }
  }, [initialData, reset]);

  const currentlyInAustralia = watch("currentlyInAustralia");
  const visaRefusedOrCancelled = watch("visaRefusedOrCancelled");
  const familyVisaRefusedOrCancelled = watch("familyVisaRefusedOrCancelled");
  const isMarried = watch("isMarried");
  const hasChildren = watch("hasChildren");
  const hasRelativesInAustralia = watch("hasRelativesInAustralia");

  const travelApplicant = watch("travelApplicant");
  const travelFamily = watch("travelFamily");
  const tuitionApplicant = watch("tuitionApplicant");
  const tuitionFamily = watch("tuitionFamily");
  const oshcApplicant = watch("oshcApplicant");
  const oshcFamily = watch("oshcFamily");
  const livingExpensesApplicant = watch("livingExpensesApplicant");
  const livingExpensesFamily = watch("livingExpensesFamily");
  const relativesAreCitizens = watch("relativesAreCitizens");

  const toNumberValue = (value: unknown) => {
    if (typeof value === "number") {
      return Number.isFinite(value) ? value : 0;
    }

    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }

    return 0;
  };

  const totalFunding = (
    toNumberValue(travelApplicant) +
    toNumberValue(tuitionApplicant) +
    toNumberValue(oshcApplicant) +
    toNumberValue(livingExpensesApplicant) +
    toNumberValue(travelFamily) +
    toNumberValue(tuitionFamily) +
    toNumberValue(oshcFamily) +
    toNumberValue(livingExpensesFamily)
  ).toFixed(2);

  const [onshoreGuidance, setOnshoreGuidance] = useState<"yes" | "no">("no");

  // Public-by-token mutations (GET/POST /api/v1/public/gs-declarations/{token}) – student via email link
  const saveByTokenMutation = useGSStudentDeclarationSaveByTokenMutation();
  const submitByTokenMutation = useGSStudentDeclarationSubmitByTokenMutation();

  // Authenticated mutations (staff filling on behalf of student – use applicationId)
  const saveStudentDeclarationMutation = useGSStudentDeclarationSaveMutation(
    applicationId ?? null,
  );
  const submitStudentDeclarationMutation =
    useGSStudentDeclarationSubmitMutation(applicationId ?? null);

  // Agent mutations
  const saveAgentDeclarationMutation = useGSAgentDeclarationSaveMutation(
    applicationId ?? null,
  );
  const submitAgentDeclarationMutation = useGSAgentDeclarationSubmitMutation(
    applicationId ?? null,
  );

  const isSubmitting =
    saveByTokenMutation.isPending ||
    submitByTokenMutation.isPending ||
    saveStudentDeclarationMutation.isPending ||
    submitStudentDeclarationMutation.isPending ||
    saveAgentDeclarationMutation.isPending ||
    submitAgentDeclarationMutation.isPending;

  const onSubmit = async (values: GSScreeningFormValues) => {
    const payload = { data: values as Record<string, unknown> };

    try {
      if (currentView === "student") {
        // Public link: token in URL – use GET/POST /api/v1/public/gs-declarations/{token}
        if (token) {
          await saveByTokenMutation.mutateAsync({ token, payload });
          await submitByTokenMutation.mutateAsync({ token, payload });
          handleBack?.();
        } else if (applicationId) {
          // Staff filling on behalf of student (authenticated – use applicationId)
          await saveStudentDeclarationMutation.mutateAsync(payload);
          await submitStudentDeclarationMutation.mutateAsync(payload);
          toast.success("Student declaration submitted successfully!");
          handleBack?.();
        } else {
          toast.error("Application ID or authentication token is missing.");
          return;
        }
      } else if (currentView === "agent") {
        if (!applicationId) {
          toast.error("Application ID is missing.");
          return;
        }

        await saveAgentDeclarationMutation.mutateAsync(payload);
        await submitAgentDeclarationMutation.mutateAsync(payload);
        handleBack?.();
      }
    } catch (error) {
      console.error("Declaration submission error:", error);
    }
  };

  return (
    <FormProvider {...methods}>
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-3">
          <div>
            <h1 className="text-2xl font-bold">
              Genuine Student (GS) Screening Form
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              CRICOS: 04082E • February 2026
            </p>
          </div>

          {readOnly && (
            <div className="bg-slate-100 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400 shrink-0 mt-0.5" />
                <div className="text-sm text-slate-700 dark:text-slate-300">
                  <p className="font-medium">View-Only Mode</p>
                  <p className="text-slate-600 dark:text-slate-400">
                    You are viewing a completed declaration form. All fields are
                    read-only and cannot be modified.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-100 space-y-2">
                <p>
                  All applicants for a student visa must be a genuine applicant
                  for entry and must stay as a student and be able to
                  demonstrate that they meet the{" "}
                  <a
                    href="https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500/genuine-student-requirement"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 dark:text-blue-300 underline hover:no-underline"
                  >
                    Genuine Student (GS)
                  </a>{" "}
                  requirement.
                </p>
                <p>
                  To assist with this assessment, provide detailed and
                  personalised responses to the questions in this form. You
                  should also attach any relevant documents that support your
                  statements.
                </p>
                <p>
                  Ensure your answers are written by you and accurately reflect
                  your individual circumstances, motivations and study goals.
                  Avoid using generic or template responses.
                </p>
                <p className="font-medium">
                  Note: The Churchill Institute of Higher Education Genuine
                  Student (GS) Checklist form must be attached along with this
                  form as part of the application documents.
                </p>
              </div>
            </div>
          </div>
        </div>

        {currentView === "student" && (
          <>
            <div className="space-y-6">
              <h2 className="text-xl font-bold">SECTION A</h2>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    1. APPLICANT{`'`}S DETAILS
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      name="firstName"
                      label="Given Name(s)"
                      placeholder="Enter given name(s)"
                      disabled={readOnly}
                    />
                    <FormInput
                      name="lastName"
                      label="Family Name"
                      placeholder="Enter family name"
                      disabled={readOnly}
                    />
                    <FormInput
                      name="dateOfBirth"
                      label="Date of Birth (DOB)"
                      type="date"
                      disabled={readOnly}
                    />
                    <FormInput
                      name="studentId"
                      label="Student ID / Reference Number"
                      placeholder="Enter student ID/reference"
                      disabled={readOnly}
                    />
                    <FormInput
                      name="passportNumber"
                      label="Passport Number"
                      placeholder="Enter passport number"
                      disabled={readOnly}
                    />
                    <FormInput
                      name="email"
                      label="Email"
                      placeholder="Enter email address"
                      type="email"
                      disabled={readOnly}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    2. CURRENT LOCATION (IN AUSTRALIA OR OVERSEAS)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormRadio
                    name="currentlyInAustralia"
                    label="A. Are you currently onshore/living in Australia?"
                    options={yesNoOptions}
                    disabled={readOnly}
                  />
                  {currentlyInAustralia === "yes" && (
                    <div className="space-y-3 pl-4 border-l-2 border-primary/30">
                      <p className="text-sm text-muted-foreground">
                        If yes, attach a copy of your current visa and any
                        previous visas you held prior to your existing visa.
                        Provide details of any bridging visas if applicable.
                      </p>
                      <FormInput
                        name="currentVisaDocument"
                        label="Current visa or bridging visa details"
                        placeholder="Document reference / notes"
                        disabled={readOnly}
                      />
                    </div>
                  )}
                  {currentlyInAustralia === "yes" && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">
                        Are you living in Australia (onshore)?
                      </Label>
                      <RadioGroup
                        value={onshoreGuidance}
                        onValueChange={(value) =>
                          setOnshoreGuidance(value as "yes" | "no")
                        }
                        className="flex gap-4"
                      >
                        <Label
                          htmlFor="onshore-guidance-yes"
                          className="flex items-center gap-2 cursor-pointer font-normal"
                        >
                          <RadioGroupItem
                            id="onshore-guidance-yes"
                            value="yes"
                          />
                          Yes
                        </Label>
                        <Label
                          htmlFor="onshore-guidance-no"
                          className="flex items-center gap-2 cursor-pointer font-normal"
                        >
                          <RadioGroupItem id="onshore-guidance-no" value="no" />
                          No
                        </Label>
                      </RadioGroup>
                    </div>
                  )}
                  <FormRadio
                    name="intendToApplyStudentVisa"
                    label="B. Do you intend to apply for a student visa to study this course?"
                    options={yesNoOptions}
                    disabled={readOnly}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    3. IMMIGRATION HISTORY
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <FormRadio
                      name="visaRefusedOrCancelled"
                      label="A. Have you ever had a visa refused or cancelled in any country including Australia?"
                      options={yesNoOptions}
                      disabled={readOnly}
                    />
                    {visaRefusedOrCancelled === "yes" && (
                      <div className="space-y-4 pl-4 border-l-2 border-destructive/30">
                        <FormTextarea
                          name="visaRefusalExplanation"
                          label="Explain the reason for the refusal or cancellation and how your situation has changed"
                          placeholder="Provide detailed explanation..."
                          rows={4}
                          disabled={readOnly}
                        />
                        <FormInput
                          name="visaRefusalDocument"
                          label="Document reference (visa refusal or cancellation notice)"
                          placeholder="Document name or reference"
                          disabled={readOnly}
                        />
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <FormRadio
                      name="familyVisaRefusedOrCancelled"
                      label="B. Have any of your immediate family members ever had a visa refused or cancelled in any country including Australia?"
                      options={yesNoOptions}
                      disabled={readOnly}
                    />
                    {familyVisaRefusedOrCancelled === "yes" && (
                      <div className="space-y-3 pl-4 border-l-2 border-destructive/30">
                        <FormInput
                          name="familyVisaRefusalDocument"
                          label="Family visa refusal document"
                          placeholder="Document reference or details"
                          disabled={readOnly}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    COURSE INFORMATION AND PERSONAL CIRCUMSTANCES
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormTextarea
                    name="currentSituation"
                    label="Provide details about your current situation, including family, community, work and economic circumstances"
                    placeholder="Describe your situation..."
                    rows={4}
                    disabled={readOnly}
                  />
                  <FormTextarea
                    name="reasonsForCourse"
                    label="Briefly outline your reasons for choosing the course(s) at Churchill Institute of Higher Education and your understanding of the course"
                    placeholder="Explain why you selected this course..."
                    rows={3}
                    disabled={readOnly}
                  />
                  <FormTextarea
                    name="careerBenefits"
                    label="Explain how completing this course will benefit your future career prospects"
                    placeholder="Describe career prospects (jobs, employers, remuneration) you expect after the course"
                    rows={3}
                    disabled={readOnly}
                  />
                  <FormTextarea
                    name="otherInformation"
                    label="Provide any other relevant information"
                    placeholder="Anything else to support your assessment"
                    rows={3}
                    disabled={readOnly}
                  />
                  {onshoreGuidance === "yes" && (
                    <>
                      <FormTextarea
                        name="studyHistoryInAustralia"
                        label="E. Provide details of your study history in Australia (courses, institutions, dates, previous visas). Attach supporting documents."
                        placeholder="List previous Australian studies..."
                        rows={4}
                        disabled={readOnly}
                      />
                      <FormTextarea
                        name="reasonForStudentVisa"
                        label="F. If holding a visa other than a student visa, explain why you are applying for a student visa and include your Australia study history"
                        placeholder="Describe your reasons..."
                        rows={4}
                        disabled={readOnly}
                      />
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">5. FAMILY DETAILS</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormRadio
                      name="isMarried"
                      label="A. Are you married or in a de facto relationship?"
                      options={yesNoOptions}
                      disabled={readOnly}
                    />
                    <FormRadio
                      name="hasChildren"
                      label="B. Do you have dependent children?"
                      options={yesNoOptions}
                      disabled={readOnly}
                    />
                  </div>

                  {isMarried === "yes" && (
                    <FormInput
                      name="marriageCertificate"
                      label="Marriage certificate or partner details"
                      placeholder="Provide document reference or details"
                      disabled={readOnly}
                    />
                  )}

                  {hasChildren === "yes" && (
                    <FormInput
                      name="childrenBirthCertificates"
                      label="Children birth certificates or supporting documents"
                      placeholder="Document reference or details"
                      disabled={readOnly}
                    />
                  )}

                  <FormRadio
                    name="hasRelativesInAustralia"
                    label="C. Do you have any relatives (parents, brothers, sisters, aunties, uncles, cousins or in-laws) living in Australia?"
                    options={yesNoOptions}
                    disabled={readOnly}
                  />

                  {hasRelativesInAustralia === "yes" && (
                    <div className="space-y-4 pl-4 border-l-2 border-primary/30">
                      <FormRadio
                        name="relativesAreCitizens"
                        label="Are your relatives Australian citizens or permanent residents?"
                        options={yesNoOptions}
                        disabled={readOnly}
                      />
                      <FormInput
                        name="relativesRelationshipType"
                        label="Relationship to the relatives in Australia"
                        placeholder="e.g. Sister, Aunt, Cousin"
                        disabled={readOnly}
                      />
                      {relativesAreCitizens === "no" && (
                        <FormInput
                          name="relativesVisaType"
                          label="If No – what visa type and subclass are they on? (e.g. Temporary Resident - subclass 485)"
                          placeholder="Document visa type and subclass"
                          disabled={readOnly}
                        />
                      )}
                      <FormRadio
                        name="intendToLiveWithRelatives"
                        label="E. Do you intend to live with relatives while you study?"
                        options={yesNoOptions}
                        disabled={readOnly}
                      />
                    </div>
                  )}

                  <FormTextarea
                    name="relationshipDetails"
                    label="Relationship details and living arrangements"
                    placeholder="Summarise any living or supporting arrangements"
                    rows={4}
                    disabled={readOnly}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    6. LIVING IN AUSTRALIA
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormInput
                    name="campusLocation"
                    label="A. At which Churchill Institute campus will you study?"
                    placeholder="Enter campus location"
                    disabled={readOnly}
                  />
                  <FormInput
                    name="intendedSuburb"
                    label="B. Intended suburb/city of residence"
                    placeholder="Describe where you plan to live"
                    disabled={readOnly}
                  />
                  <FormTextarea
                    name="knowledgeAboutAustralia"
                    label="C. Knowledge about living in Australia"
                    placeholder="Share what you know about accommodation, cost of living or commuting"
                    rows={4}
                    disabled={readOnly}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold">
                  SECTION B - FINANCIAL CAPACITY ASSESSMENT
                </h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Check the Department of Home Affairs website{" "}
                  <a
                    href="https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500#HowTo"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline hover:no-underline inline-flex items-center gap-1"
                  >
                    (Subclass 500 Student visa)
                    <ExternalLink className="h-3 w-3" />
                  </a>{" "}
                  for the most updated information about the financial capacity
                  requirements.
                </p>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[40%]"></TableHead>
                          <TableHead className="text-center">
                            Applicant
                          </TableHead>
                          <TableHead className="text-center">
                            Family Members
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">
                            Travel (return Airfares)
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">$</span>
                              <FormInput
                                name="travelApplicant"
                                label=" "
                                placeholder="0.00"
                                type="number"
                                disabled={readOnly}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">$</span>
                              <FormInput
                                name="travelFamily"
                                label=" "
                                placeholder="0.00"
                                type="number"
                                disabled={readOnly}
                              />
                            </div>
                          </TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell className="font-medium">
                            Tuition for first year of study
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">$</span>
                              <FormInput
                                name="tuitionApplicant"
                                label=" "
                                placeholder="0.00"
                                type="number"
                                disabled={readOnly}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">$</span>
                              <FormInput
                                name="tuitionFamily"
                                label=" "
                                placeholder="0.00"
                                type="number"
                                disabled={readOnly}
                              />
                            </div>
                          </TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell className="font-medium">
                            Overseas Health Cover (OSHC)
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">$</span>
                              <FormInput
                                name="oshcApplicant"
                                label=" "
                                placeholder="0.00"
                                type="number"
                                disabled={readOnly}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">$</span>
                              <FormInput
                                name="oshcFamily"
                                label=" "
                                placeholder="0.00"
                                type="number"
                                disabled={readOnly}
                              />
                            </div>
                          </TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell className="font-medium">
                            Living Expenses
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">$</span>
                              <FormInput
                                name="livingExpensesApplicant"
                                label=" "
                                placeholder="0.00"
                                type="number"
                                disabled={readOnly}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">$</span>
                              <FormInput
                                name="livingExpensesFamily"
                                label=" "
                                placeholder="0.00"
                                type="number"
                                disabled={readOnly}
                              />
                            </div>
                          </TableCell>
                        </TableRow>

                        <TableRow className="bg-muted/30 font-semibold">
                          <TableCell>
                            TOTAL funding (Applicant + Family Members)
                          </TableCell>
                          <TableCell colSpan={2} className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <span>$</span>
                              <span>{totalFunding}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-xs text-blue-900 dark:text-blue-100">
                      <strong>
                        Applicants must refer to the Churchill Institute of
                        Higher Education Genuine Student (GS) Checklist
                        (Appendix A) for prescribed supporting documentation
                        required to evidence financial capacity, sponsorship
                        arrangements, and family circumstances, as mandated
                        under the Department of Home Affairs student visa
                        requirements.
                      </strong>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        <div className="space-y-6">
          <h2 className="text-xl font-bold">DECLARATION</h2>

          {currentView === "student" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">APPLICANT DECLARATION</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* <div className="space-y-3 text-sm">
                  <p>By submitting this form, I accept and declare that:</p>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>
                      The information provided in this form is true and correct.
                    </li>
                    <li>
                      I acknowledge and accept that Churchill Institute of
                      Higher Education may vary or cancel any decision made on
                      the basis of incorrect, incomplete, false or misleading
                      information.
                    </li>
                    <li>
                      I understand that the information provided will be used in
                      the administration of my application and subsequent
                      enrolment, and may be accessed by third parties involved
                      in the assessment process.
                    </li>
                    <li>
                      I authorise any institution or organisation named on any
                      supporting document to release personal information for
                      verification purposes.
                    </li>
                    <li>
                      I agree to inform Churchill Institute of Higher Education
                      immediately if there is any change to the information I
                      have provided.
                    </li>
                  </ol>
                </div>

                <Separator /> */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    name="applicantFullName"
                    label="Applicant Full Name"
                    placeholder="Enter full name"
                    disabled={readOnly}
                  />
                  <FormInput
                    name="applicantDate"
                    label="Date"
                    type="date"
                    disabled={readOnly}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {currentView === "agent" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AGENT DECLARATION</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    name="agentAgencyName"
                    label="Agency name / Branch"
                    placeholder="Enter agency and branch"
                    disabled={readOnly}
                  />
                  <FormInput
                    name="agentCounsellorName"
                    label="Counsellor's name"
                    placeholder="Enter counsellor name"
                    disabled={readOnly}
                  />
                  <FormInput
                    name="agentDate"
                    label="Date"
                    type="date"
                    disabled={readOnly}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {!readOnly && (
          <div className="flex items-center justify-end">
            <Button
              type="submit"
              size="lg"
              className="gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-5 w-5" />
              )}
              {isSubmitting ? "Submitting..." : "Save & Submit"}
            </Button>
          </div>
        )}
      </form>
    </FormProvider>
  );
}
