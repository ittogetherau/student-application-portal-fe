"use client";

import { FormInput } from "@/components/forms/form-input";
import { FormRadio } from "@/components/forms/form-radio";
import { FormTextarea } from "@/components/forms/form-textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SignatureModal from "@/features/gs/components/signature-modal";
import {
  useGSAgentDeclarationSaveMutation,
  useGSAgentDeclarationSubmitMutation,
  useGSStudentDeclarationDocumentUploadByTokenMutation,
  useGSStudentDeclarationDocumentUploadMutation,
  useGSStudentDeclarationSaveByTokenMutation,
  useGSStudentDeclarationSaveMutation,
  useGSStudentDeclarationSubmitByTokenMutation,
  useGSStudentDeclarationSubmitMutation,
} from "@/hooks/useGSAssessment.hook";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  FileText,
  Loader2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { toast } from "react-hot-toast";

import { siteRoutes } from "@/shared/constants/site-routes";
import {
  createGSScreeningSchema,
  GSScreeningFormValues,
} from "../../utils/gs-screening.validation";
import { DeclarationDocumentUpload } from "../declaration-document-upload";

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

  applicantSignature: "",
  agentSignature: "",
};

const formatLocalDateForInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const yesNoOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

type DeclarationView = "student" | "agent";
type DeclarationDocumentFieldName =
  | "currentVisaDocument"
  | "visaRefusalDocument"
  | "familyVisaRefusalDocument"
  | "marriageCertificate"
  | "childrenBirthCertificates";
type DeclarationSectionToggleFieldName =
  | "currentlyInAustralia"
  | "visaRefusedOrCancelled"
  | "familyVisaRefusedOrCancelled"
  | "isMarried"
  | "hasChildren";

const declarationDocumentMetaByField: Record<
  DeclarationDocumentFieldName,
  { documentTypeCode: string; documentName: string }
> = {
  currentVisaDocument: {
    documentTypeCode: "currentVisaDocument",
    documentName: "current_visa_document",
  },
  visaRefusalDocument: {
    documentTypeCode: "visaRefusalDocument",
    documentName: "visa_refusal_document",
  },
  familyVisaRefusalDocument: {
    documentTypeCode: "familyVisaRefusalDocument",
    documentName: "family_visa_refusal_document",
  },
  marriageCertificate: {
    documentTypeCode: "marriageCertificate",
    documentName: "marriage_certificate",
  },
  childrenBirthCertificates: {
    documentTypeCode: "childrenBirthCertificates",
    documentName: "children_birth_certificates",
  },
};

const declarationSectionToggleByField: Record<
  DeclarationDocumentFieldName,
  DeclarationSectionToggleFieldName
> = {
  currentVisaDocument: "currentlyInAustralia",
  visaRefusalDocument: "visaRefusedOrCancelled",
  familyVisaRefusalDocument: "familyVisaRefusedOrCancelled",
  marriageCertificate: "isMarried",
  childrenBirthCertificates: "hasChildren",
};

type UploadedDeclarationDocument = {
  id?: string;
  file_name?: string;
  document_name?: string;
  view_url?: string;
  download_url?: string;
  uploaded_at?: string;
  [key: string]: unknown;
};

interface GSScreeningFormProps {
  currentView: DeclarationView;
  trackingId?: string;
  token?: string;
  applicationId?: string;
  readOnly?: boolean;
  initialData?: Partial<GSScreeningFormValues>;
  prefillData?: Partial<GSScreeningFormValues>;
  initialUploadedDocuments?: UploadedDeclarationDocument[];
  handleBack?: () => void;
}

export function GSScreeningForm({
  currentView,
  trackingId,
  token,
  applicationId,
  readOnly = false,
  initialData,
  prefillData,
  initialUploadedDocuments = [],
  handleBack,
}: GSScreeningFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const isPublicStudentMode = currentView === "student" && Boolean(token);
  const isPrefillLocked = readOnly || isPublicStudentMode;
  const resolver = zodResolver(
    createGSScreeningSchema(currentView),
  ) as Resolver<GSScreeningFormValues>;

  const mergedDefaults = {
    ...defaultValues,
    ...(prefillData ?? {}),
    ...(initialData ?? {}),
  };

  const methods = useForm<GSScreeningFormValues>({
    resolver,
    defaultValues: mergedDefaults,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const {
    watch,
    reset,
    setValue,
    getValues,
    formState: { errors, isDirty },
  } = methods;
  const [currentVisaFile, setCurrentVisaFile] = useState<File | null>(null);
  const [visaRefusalFile, setVisaRefusalFile] = useState<File | null>(null);
  const [familyVisaRefusalFile, setFamilyVisaRefusalFile] =
    useState<File | null>(null);
  const [marriageCertFile, setMarriageCertFile] = useState<File | null>(null);
  const [childrenBirthCertsFile, setChildrenBirthCertsFile] =
    useState<File | null>(null);
  const [signatureModalFor, setSignatureModalFor] = useState<
    "applicant" | "agent" | null
  >(null);

  const uploadedDocumentByField = useMemo(() => {
    const getLatestForField = (fieldName: DeclarationDocumentFieldName) => {
      const sectionName =
        declarationDocumentMetaByField[fieldName].documentName.toLowerCase();

      const matches = initialUploadedDocuments.filter((doc) => {
        const documentName = String(doc.document_name ?? "").toLowerCase();
        const fileName = String(doc.file_name ?? "").toLowerCase();
        return documentName === sectionName || fileName.includes(sectionName);
      });

      if (matches.length === 0) return undefined;

      const sorted = [...matches].sort((a, b) => {
        const aTime = String(a.uploaded_at ?? "");
        const bTime = String(b.uploaded_at ?? "");
        return bTime.localeCompare(aTime);
      });
      return sorted[0];
    };

    return {
      currentVisaDocument: getLatestForField("currentVisaDocument"),
      visaRefusalDocument: getLatestForField("visaRefusalDocument"),
      familyVisaRefusalDocument: getLatestForField("familyVisaRefusalDocument"),
      marriageCertificate: getLatestForField("marriageCertificate"),
      childrenBirthCertificates: getLatestForField("childrenBirthCertificates"),
    } satisfies Record<
      DeclarationDocumentFieldName,
      UploadedDeclarationDocument | undefined
    >;
  }, [initialUploadedDocuments]);

  useEffect(() => {
    if (isDirty) return;
    if (initialData != null || prefillData != null) {
      reset({
        ...defaultValues,
        ...(prefillData ?? {}),
        ...(initialData ?? {}),
      });
    }
  }, [initialData, isDirty, prefillData, reset]);

  useEffect(() => {
    const fields: DeclarationDocumentFieldName[] = [
      "currentVisaDocument",
      "visaRefusalDocument",
      "familyVisaRefusalDocument",
      "marriageCertificate",
      "childrenBirthCertificates",
    ];

    for (const field of fields) {
      const currentValue = String(getValues(field) ?? "").trim();
      const uploadedDoc = uploadedDocumentByField[field];
      const uploadedFileName = String(uploadedDoc?.file_name ?? "").trim();
      if (currentValue === "" && uploadedFileName !== "") {
        setValue(field, uploadedFileName, { shouldValidate: false });
      }

      // If we have an uploaded file for a conditional section, default that section
      // to "yes" so the relevant upload block remains visible after refresh.
      const toggleField = declarationSectionToggleByField[field];
      const currentToggleValue = String(getValues(toggleField) ?? "").trim();
      if (uploadedFileName !== "" && currentToggleValue === "") {
        setValue(toggleField, "yes", { shouldValidate: false });
      }
    }
  }, [getValues, setValue, uploadedDocumentByField]);

  const todayForInput = useMemo(() => formatLocalDateForInput(new Date()), []);

  useEffect(() => {
    if (currentView !== "agent" || readOnly) return;

    const existingAgentDate = String(getValues("agentDate") ?? "");
    if (existingAgentDate.trim() === "") {
      setValue("agentDate", todayForInput, { shouldValidate: false });
    }

    const existingCounsellorName = String(
      getValues("agentCounsellorName") ?? "",
    );
    if (existingCounsellorName.trim() === "") {
      const fallbackName = String(session?.user?.email ?? "");
      if (fallbackName.trim() !== "") {
        setValue("agentCounsellorName", fallbackName, {
          shouldValidate: false,
        });
      }
    }
  }, [
    currentView,
    getValues,
    initialData,
    readOnly,
    session?.user?.email,
    setValue,
    todayForInput,
  ]);

  useEffect(() => {
    if (currentView !== "student" || readOnly) return;

    const existingApplicantDate = String(getValues("applicantDate") ?? "");
    if (existingApplicantDate.trim() === "") {
      setValue("applicantDate", todayForInput, { shouldValidate: false });
    }
  }, [currentView, getValues, initialData, readOnly, setValue, todayForInput]);

  const currentlyInAustralia = watch("currentlyInAustralia");
  const visaRefusedOrCancelled = watch("visaRefusedOrCancelled");
  const familyVisaRefusedOrCancelled = watch("familyVisaRefusedOrCancelled");
  const isMarried = watch("isMarried");
  const hasChildren = watch("hasChildren");
  const hasRelativesInAustralia = watch("hasRelativesInAustralia");
  const firstName = watch("firstName");
  const lastName = watch("lastName");
  const applicantSignature = watch("applicantSignature");
  const agentSignature = watch("agentSignature");

  useEffect(() => {
    if (!isPublicStudentMode || readOnly) return;

    const existingApplicantFullName = String(
      getValues("applicantFullName") ?? "",
    ).trim();
    if (existingApplicantFullName !== "") return;

    const combinedName = `${String(firstName ?? "").trim()} ${String(
      lastName ?? "",
    ).trim()}`.replace(/\s+/g, " ").trim();

    if (combinedName !== "") {
      setValue("applicantFullName", combinedName, { shouldValidate: false });
    }
  }, [
    firstName,
    getValues,
    isPublicStudentMode,
    lastName,
    readOnly,
    setValue,
  ]);

  useEffect(() => {
    if (currentlyInAustralia !== "yes") {
      setCurrentVisaFile(null);
      setValue("currentVisaDocument", "", { shouldValidate: false });
    }
  }, [currentlyInAustralia, setValue]);

  useEffect(() => {
    if (visaRefusedOrCancelled !== "yes") {
      setVisaRefusalFile(null);
      setValue("visaRefusalDocument", "", { shouldValidate: false });
    }
  }, [visaRefusedOrCancelled, setValue]);

  useEffect(() => {
    if (familyVisaRefusedOrCancelled !== "yes") {
      setFamilyVisaRefusalFile(null);
      setValue("familyVisaRefusalDocument", "", { shouldValidate: false });
    }
  }, [familyVisaRefusedOrCancelled, setValue]);

  useEffect(() => {
    if (isMarried !== "yes") {
      setMarriageCertFile(null);
      setValue("marriageCertificate", "", { shouldValidate: false });
    }
  }, [isMarried, setValue]);

  useEffect(() => {
    if (hasChildren !== "yes") {
      setChildrenBirthCertsFile(null);
      setValue("childrenBirthCertificates", "", { shouldValidate: false });
    }
  }, [hasChildren, setValue]);

  const clearSignature = (type: "applicant" | "agent") => {
    const field =
      type === "applicant" ? "applicantSignature" : "agentSignature";
    setValue(field, "", { shouldValidate: true, shouldDirty: true });
    setSignatureModalFor(null);
  };

  const handleSignatureSave = (svg: string) => {
    if (!signatureModalFor) return;

    const field =
      signatureModalFor === "applicant"
        ? "applicantSignature"
        : "agentSignature";

    setValue(field, svg, { shouldValidate: true, shouldDirty: true });
    setSignatureModalFor(null);
  };

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

  const renderSignaturePreview = (svgString?: string) => {
    if (!svgString) return null;

    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;

    return (
      <div className="w-32 aspect-square rounded-md border bg-muted/40 overflow-hidden">
        <img
          src={dataUrl}
          alt="Signature preview"
          className="h-28 w-full object-cover"
        />
      </div>
    );
  };

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
  const uploadStudentDeclarationDocumentMutation =
    useGSStudentDeclarationDocumentUploadMutation(applicationId ?? null);
  const uploadStudentDeclarationDocumentByTokenMutation =
    useGSStudentDeclarationDocumentUploadByTokenMutation();

  const isUploadingDeclarationDocument =
    uploadStudentDeclarationDocumentMutation.isPending ||
    uploadStudentDeclarationDocumentByTokenMutation.isPending;

  const handleDeclarationDocumentFileChange = async (
    fieldName: DeclarationDocumentFieldName,
    file: File | null,
    setSelectedFile: (nextFile: File | null) => void,
  ) => {
    setSelectedFile(file);
    if (!file || currentView !== "student" || readOnly) return;

    if (!token && !applicationId) {
      setSelectedFile(null);
      setValue(fieldName, "", { shouldValidate: true, shouldDirty: true });
      toast.error("Application ID or authentication token is missing.");
      return;
    }

    try {
      const documentMeta = declarationDocumentMetaByField[fieldName];
      const payload = {
        file,
        document_name: documentMeta.documentName,
        document_type_code: documentMeta.documentTypeCode,
      };

      const uploadedDocumentValue = token
        ? await uploadStudentDeclarationDocumentByTokenMutation.mutateAsync({
            token,
            payload,
          })
        : await uploadStudentDeclarationDocumentMutation.mutateAsync(payload);

      setValue(
        fieldName,
        uploadedDocumentValue.trim() !== "" ? uploadedDocumentValue : file.name,
        { shouldValidate: true, shouldDirty: true },
      );
      toast.success("Document uploaded successfully");
    } catch {
      // Mutation hook handles error toast. Reset local state/value to keep form valid.
      setSelectedFile(null);
      setValue(fieldName, "", { shouldValidate: true, shouldDirty: true });
    }
  };

  const isSubmitting =
    saveByTokenMutation.isPending ||
    submitByTokenMutation.isPending ||
    saveStudentDeclarationMutation.isPending ||
    submitStudentDeclarationMutation.isPending ||
    saveAgentDeclarationMutation.isPending ||
    submitAgentDeclarationMutation.isPending ||
    isUploadingDeclarationDocument;

  const onSubmit = async (values: GSScreeningFormValues) => {
    try {
      if (currentView === "student") {
        const data = { ...values } as Record<string, unknown>;
        const payload = { data };

        if (token) {
          await saveByTokenMutation.mutateAsync({
            token,
            payload,
          });
          await submitByTokenMutation.mutateAsync({
            token,
            payload,
          });
          router.push(siteRoutes.track.root(trackingId));
        } else if (applicationId) {
          await saveStudentDeclarationMutation.mutateAsync({
            ...payload,
          });
          await submitStudentDeclarationMutation.mutateAsync({
            ...payload,
          });
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

        const data = {
          agentAgencyName: values.agentAgencyName ?? "",
          agentCounsellorName: values.agentCounsellorName ?? "",
          agentDate: todayForInput,
          agentSignature: values.agentSignature ?? "",
        };
        const payload = { data };

        await saveAgentDeclarationMutation.mutateAsync(payload);
        await submitAgentDeclarationMutation.mutateAsync(payload);
        handleBack?.();
      }
    } catch (error) {
      console.error("Declaration submission error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit declaration. Please check required fields and try again.",
      );
    }
  };

  const handleFormSubmit = methods.handleSubmit(onSubmit, (formErrors) => {
    // Show the first validation error as a toast for visibility (e.g., missing signatures)
    const firstError = Object.values(formErrors)[0];
    const message =
      (firstError?.message as string | undefined) ||
      "Please fix the highlighted errors and try again.";
    toast.error(message);
  });

  return (
    <FormProvider {...methods}>
      <form className="space-y-6" onSubmit={handleFormSubmit}>
        <div className="space-y-3">
          <div>
            <h1 className="text-2xl font-bold">
              Genuine Student (GS) Screening Form
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Genuine Student (GS) Form - Student to Complete
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
                  The Australian government has replaced the Genuine Temporary
                  Entrant (GTE) requirement for student visas with a Genuine
                  Student (GS) requirement. This is effective for student visa
                  applications lodged on and after 23 March 2024. <br />
                  All applicants for a student visa must be a genuine applicant
                  for entry to Australia for the purpose of studying and
                  obtaining a qualification. They must be able to demonstrate
                  that studying in Australia is the primary reason of their
                  student visa. To be granted a student visa, all applicants
                  must demonstrate they satisfy the genuine student criterion or
                  the genuine student dependent criterion. More information
                  regarding the Genuine Student requirement is available on the{" "}
                  <a
                    href="https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500/genuine-student-requirement"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 dark:text-blue-300 underline hover:no-underline"
                  >
                    Department of Home Affairs website.
                  </a>{" "}
                  <br />
                  International students applying to Churchill Institute of
                  Higher Education (PRV14305 | CRICOS Provider: 04082E) must be
                  genuine in their intention to study, must comply with student
                  visa requirements, enrol into their degree at Churchill
                  Institute and must successfully complete their course at
                  Churchill Institute of Higher Education.Please complete the
                  below questions to demonstrate you meet the GS criteria. You
                  must complete this form; and limit your response to each
                  question below to a maximum of 150 words and provide evidence
                  to support your statements. Please refer to the{" "}
                  <a
                    href="https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500/genuine-student-requirement"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 dark:text-blue-300 underline hover:no-underline"
                  >
                    Genuine Student criteria provided by the Department of Home
                    Affairs{" "}
                  </a>{" "}
                  and{" "}
                  <a
                    href="https://immi.homeaffairs.gov.au/Visa-subsite/files/direction-no-106.pdf"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 dark:text-blue-300 underline hover:no-underline"
                  >
                    Ministerial Direction Nr 106
                  </a>{" "}
                  when responding to the above questions.
                </p>
                <br />

                <blockquote className="text-xs italic text-muted-foreground">
                  Note: The Churchill Institute of Higher Education Genuine
                  Student (GS) Checklist form must be attached along with this
                  form as part of the application documents.
                </blockquote>
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
                      disabled={isPrefillLocked}
                    />

                    <FormInput
                      name="lastName"
                      label="Family Name"
                      placeholder="Enter family name"
                      disabled={isPrefillLocked}
                    />
                    <FormInput
                      name="dateOfBirth"
                      label="Date of Birth (DOB)"
                      type="date"
                      disabled={
                        isPrefillLocked || Boolean(initialData?.dateOfBirth)
                      }
                    />
                    <FormInput
                      name="studentId"
                      label="Student ID / Reference Number"
                      placeholder="Enter student ID/reference"
                      disabled={isPrefillLocked}
                    />
                    <FormInput
                      name="passportNumber"
                      label="Passport Number"
                      placeholder="Enter passport number"
                      disabled={isPrefillLocked}
                    />
                    <FormInput
                      name="email"
                      label="Email"
                      placeholder="Enter email address"
                      type="email"
                      disabled={isPrefillLocked}
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
                      <DeclarationDocumentUpload
                        name="currentVisaDocument"
                        label="Current visa or bridging visa details"
                        file={currentVisaFile}
                        existingFileName={String(
                          uploadedDocumentByField.currentVisaDocument
                            ?.file_name ?? "",
                        )}
                        existingFileUrl={
                          String(
                            uploadedDocumentByField.currentVisaDocument
                              ?.view_url ??
                              uploadedDocumentByField.currentVisaDocument
                                ?.download_url ??
                              "",
                          ) || undefined
                        }
                        onFileChange={(file) =>
                          void handleDeclarationDocumentFileChange(
                            "currentVisaDocument",
                            file,
                            setCurrentVisaFile,
                          )
                        }
                        disabled={readOnly || isUploadingDeclarationDocument}
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
                        <DeclarationDocumentUpload
                          name="visaRefusalDocument"
                          label="Document (visa refusal or cancellation notice)"
                          description="Upload PDF, JPG or PNG"
                          file={visaRefusalFile}
                          existingFileName={String(
                            uploadedDocumentByField.visaRefusalDocument
                              ?.file_name ?? "",
                          )}
                          existingFileUrl={
                            String(
                              uploadedDocumentByField.visaRefusalDocument
                                ?.view_url ??
                                uploadedDocumentByField.visaRefusalDocument
                                  ?.download_url ??
                                "",
                            ) || undefined
                          }
                          onFileChange={(file) =>
                            void handleDeclarationDocumentFileChange(
                              "visaRefusalDocument",
                              file,
                              setVisaRefusalFile,
                            )
                          }
                          disabled={readOnly || isUploadingDeclarationDocument}
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
                        <DeclarationDocumentUpload
                          name="familyVisaRefusalDocument"
                          label="Family visa refusal document"
                          file={familyVisaRefusalFile}
                          existingFileName={String(
                            uploadedDocumentByField.familyVisaRefusalDocument
                              ?.file_name ?? "",
                          )}
                          existingFileUrl={
                            String(
                              uploadedDocumentByField.familyVisaRefusalDocument
                                ?.view_url ??
                                uploadedDocumentByField
                                  .familyVisaRefusalDocument?.download_url ??
                                "",
                            ) || undefined
                          }
                          onFileChange={(file) =>
                            void handleDeclarationDocumentFileChange(
                              "familyVisaRefusalDocument",
                              file,
                              setFamilyVisaRefusalFile,
                            )
                          }
                          disabled={readOnly || isUploadingDeclarationDocument}
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
                    <DeclarationDocumentUpload
                      name="marriageCertificate"
                      label="Marriage certificate or partner details"
                      file={marriageCertFile}
                      existingFileName={String(
                        uploadedDocumentByField.marriageCertificate
                          ?.file_name ?? "",
                      )}
                      existingFileUrl={
                        String(
                          uploadedDocumentByField.marriageCertificate
                            ?.view_url ??
                            uploadedDocumentByField.marriageCertificate
                              ?.download_url ??
                            "",
                        ) || undefined
                      }
                      onFileChange={(file) =>
                        void handleDeclarationDocumentFileChange(
                          "marriageCertificate",
                          file,
                          setMarriageCertFile,
                        )
                      }
                      disabled={readOnly || isUploadingDeclarationDocument}
                    />
                  )}

                  {hasChildren === "yes" && (
                    <DeclarationDocumentUpload
                      name="childrenBirthCertificates"
                      label="Children birth certificates or supporting documents"
                      file={childrenBirthCertsFile}
                      existingFileName={String(
                        uploadedDocumentByField.childrenBirthCertificates
                          ?.file_name ?? "",
                      )}
                      existingFileUrl={
                        String(
                          uploadedDocumentByField.childrenBirthCertificates
                            ?.view_url ??
                            uploadedDocumentByField.childrenBirthCertificates
                              ?.download_url ??
                            "",
                        ) || undefined
                      }
                      onFileChange={(file) =>
                        void handleDeclarationDocumentFileChange(
                          "childrenBirthCertificates",
                          file,
                          setChildrenBirthCertsFile,
                        )
                      }
                      disabled={readOnly || isUploadingDeclarationDocument}
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
                      Applicants must refer to the{" "}
                      <strong>Churchill Institute of Higher Education</strong>{" "}
                      Genuine Student (GS) Checklist (
                      <strong>Appendix A</strong>) for prescribed supporting
                      documentation required to evidence financial capacity,
                      sponsorship arrangements, and family circumstances, as
                      mandated under the Department of Home Affairs student visa
                      requirements.
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    name="applicantFullName"
                    label="Applicant Full Name"
                    placeholder="Enter full name"
                    disabled={isPrefillLocked}
                  />
                  <FormInput
                    name="applicantDate"
                    label="Date"
                    type="date"
                    disabled
                  />
                </div>

                {applicantSignature && (
                  <div className="space-y-2">
                    {renderSignaturePreview(applicantSignature)}
                    <Label className="text-sm font-medium">
                      Applicant signature
                    </Label>
                  </div>
                )}
                {!readOnly && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setSignatureModalFor("applicant")}
                    >
                      {applicantSignature
                        ? "Replace signature"
                        : "Add signature"}
                    </Button>
                    {applicantSignature && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => clearSignature("applicant")}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                )}
                {errors.applicantSignature && (
                  <p className="text-sm text-destructive">
                    {errors.applicantSignature.message as string}
                  </p>
                )}
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
                    disabled
                  />
                </div>

                {agentSignature && (
                  <div className="space-y-2">
                    {renderSignaturePreview(agentSignature)}
                    <Label className="text-sm font-medium">
                      Agent signature
                    </Label>
                  </div>
                )}
                {!readOnly && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setSignatureModalFor("agent")}
                    >
                      {agentSignature ? "Replace signature" : "Add signature"}
                    </Button>
                    {agentSignature && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => clearSignature("agent")}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                )}
                {errors.agentSignature && (
                  <p className="text-sm text-destructive">
                    {errors.agentSignature.message as string}
                  </p>
                )}
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

      {!readOnly && (
        <SignatureModal
          open={Boolean(signatureModalFor)}
          title={
            signatureModalFor === "applicant"
              ? "Applicant signature"
              : "Agent signature"
          }
          onConfirm={handleSignatureSave}
          onOpenChange={(open) => !open && setSignatureModalFor(null)}
        />
      )}
    </FormProvider>
  );
}
