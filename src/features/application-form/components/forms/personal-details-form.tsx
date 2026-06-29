"use client";

import { getFieldError } from "@/components/forms/form-errors";
import { FormInput } from "@/components/forms/form-input";
import { FormRadio } from "@/components/forms/form-radio";
import { FormSearchableSelect } from "@/components/forms/form-searchable-select";
import { FormSelect } from "@/components/forms/form-select";
import { FormTextarea } from "@/components/forms/form-textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dropzone, DropzoneEmptyState } from "@/components/ui/dropzone";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ApplicationStepHeader from "@/features/application-form/components/application-step-header";
import { useFormPersistence } from "@/features/application-form/hooks/use-form-persistence.hook";
import { useOcrAutofillUpload } from "@/features/application-form/hooks/use-ocr-autofill-upload.hook";
import { mapPassportOcrToPersonalDetails } from "@/features/application-form/utils/ocr-autofill-mappers";
import {
  defaultPersonalDetailsValues,
  personalDetailsSchema,
  type PersonalDetailsValues,
} from "@/features/application-form/validations/personal-details";
import { usePlacesAutocomplete } from "@/hooks/usePlacesAutocomplete.hook";
import type { OcrResult } from "@/service/document.service";
import {
  getCountriesList,
  getNationalitiesList,
} from "@/shared/data/country-list";
import {
  useDocuments,
  useDocumentTypesQuery,
} from "@/shared/hooks/document.hook";
import {
  DROPZONE_ACCEPT,
  getDropzoneHelperText,
  MAX_FILE_SIZE_BYTES,
} from "@/shared/lib/document-file-helpers";
import { cn } from "@/shared/lib/utils";
import { getDateInputValueFromToday } from "@/shared/validation/date-input";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  ChevronRight,
  FileCheck2,
  Info,
  Loader2,
  Upload,
  X,
  ExternalLink,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { usePublicStudentApplicationStore } from "@/features/student-application/store/use-public-student-application.store";
import { useApplicationStepMutations } from "../../hooks/use-application-steps.hook";
import { ExtractedDataPreview } from "../extracted-data-preview";
import HealthCoverAutoSubmit from "../health-cover-auto-submit";
import {
  useApplicationGetQuery,
  useApplicationUpdateMutation,
} from "@/shared/hooks/use-applications";

const stepId = 1;

type PlacePrediction = {
  description: string;
  place_id?: string;
  structured_formatting?: {
    main_text?: string;
    secondary_text?: string;
  };
};

type AddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

const PersonalDetailsForm = ({ applicationId }: { applicationId: string }) => {
  const personalDetailsMutation =
    useApplicationStepMutations(applicationId)[stepId];
  const updateApplication = useApplicationUpdateMutation(applicationId);
  const { data: applicationResponse } = useApplicationGetQuery(applicationId);
  const enrollmentData = applicationResponse?.data?.enrollment_data;
  const isDev = process.env.NODE_ENV === "development";
  const isPublicMode = usePublicStudentApplicationStore(
    (state) => state.enabled && !!state.token,
  );
  const studentEmail = usePublicStudentApplicationStore(
    (state) => state.studentEmail,
  );
  const isEmailLocked = isPublicMode && !isDev;
  const yesterdayForInput = getDateInputValueFromToday(-1);
  const tomorrowForInput = getDateInputValueFromToday(1);

  const methods = useForm<PersonalDetailsValues>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: defaultPersonalDetailsValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  // Enable automatic form persistence
  const { saveOnSubmit } = useFormPersistence({
    applicationId,
    stepId,
    form: methods,
    enabled: !!applicationId,
  });

  const {
    setQuery: setAddressQuery,
    data: placePredictions,
    isLoading: isPlacesLoading,
    error: placesError,
  } = usePlacesAutocomplete("", {
    debounceMs: 350,
    minLength: 3,
  });
  const [isPlacesOpen, setIsPlacesOpen] = useState(false);

  // Get document types and upload hook
  const { data: documentTypesResponse } = useDocumentTypesQuery();
  const { uploadDocument } = useDocuments(applicationId);

  // Get passport document type ID
  const passportDocType = documentTypesResponse?.data?.find(
    (dt) => dt.code === "PASSPORT",
  );

  const processPassportOcrData = useCallback(
    (ocrData: OcrResult) => {
      return mapPassportOcrToPersonalDetails(ocrData, {
        getValue: (key) => methods.getValues(key),
        setValue: (key, value) =>
          methods.setValue(key, value, {
            shouldValidate: true,
            shouldDirty: true,
          }),
      });
    },
    [methods],
  );

  const {
    uploadedFile,
    isUploading,
    uploadSuccess,
    extractedSummary,
    handleFileUpload,
    handleRemoveFile,
  } = useOcrAutofillUpload({
    applicationId,
    documentTypeId: passportDocType?.id,
    uploadDocument,
    onProcessOcrData: processPassportOcrData,
    startSuccessMessage: "Passport uploaded! Extracting data...",
    extractedWithFieldsMessage: (count) =>
      `Passport data extracted! ${count} fields populated.`,
    extractedWithoutFieldsMessage: "Passport uploaded successfully!",
    uploadFailureMessage: "Failed to upload passport",
    extractionFailureMessage: "Failed to extract data from passport",
    processingTimeoutMessage: "OCR processing timed out. Please try again.",
  });

  useEffect(() => {
    if (!isEmailLocked || !studentEmail) return;
    if (methods.getValues("email") === studentEmail) return;

    methods.setValue("email", studentEmail, {
      shouldDirty: false,
      shouldValidate: true,
    });
  }, [isEmailLocked, methods, studentEmail]);

  const watchedStudentOrigin = methods.watch("student_origin");

  useEffect(() => {
    const studentOrigin =
      applicationResponse?.data?.personal_details?.student_origin ??
      watchedStudentOrigin;

    if (studentOrigin !== "Overseas Student in Australia (Onshore)") return;

    const enrollment = applicationResponse?.data?.enrollment_data;
    if (!enrollment) return;

    if (
      typeof enrollment.esos_agent_assessment === "string" &&
      enrollment.esos_agent_assessment.trim().length > 0
    ) {
      methods.setValue("esos_agent_assessment", enrollment.esos_agent_assessment, {
        shouldDirty: false,
        shouldValidate: true,
      });
    }
    if (typeof enrollment.esos_agent_assessment_reason === "string") {
      methods.setValue(
        "esos_agent_assessment_reason",
        enrollment.esos_agent_assessment_reason,
        {
          shouldDirty: false,
          shouldValidate: true,
        },
      );
    }
  }, [applicationResponse?.data, watchedStudentOrigin, methods]);

  const onSubmit = (values: PersonalDetailsValues) => {
    const normalizedValues: PersonalDetailsValues = {
      ...values,
      email:
        isEmailLocked && studentEmail
          ? studentEmail
          : typeof values.email === "string"
            ? values.email.trim().toLowerCase()
            : values.email,
    };

    console.log("submitting personal details", normalizedValues);
    if (applicationId) {
      saveOnSubmit(normalizedValues);

      const currentEnrollment = (enrollmentData || {}) as Record<string, unknown>;
      const nextEnrollment = { ...currentEnrollment };
      if (values.student_origin === "Overseas Student in Australia (Onshore)") {
        nextEnrollment.esos_agent_assessment = values.esos_agent_assessment;
        nextEnrollment.esos_agent_assessment_reason = values.esos_agent_assessment_reason;
      } else {
        delete nextEnrollment.esos_agent_assessment;
        delete nextEnrollment.esos_agent_assessment_date;
        delete nextEnrollment.esos_agent_assessment_reason;
      }
      updateApplication.mutate({
        enrollment_data: nextEnrollment,
      });
    }
    personalDetailsMutation.mutate(normalizedValues);
  };

  const getComponentByType = (components: AddressComponent[], type: string) =>
    components.find((component) => component.types.includes(type));

  const getComponentByPriority = (
    components: AddressComponent[],
    types: string[],
  ) => {
    for (const type of types) {
      const match = getComponentByType(components, type);
      if (match) return match;
    }
    return undefined;
  };

  const handlePlaceSelect = async (prediction: PlacePrediction) => {
    const description = prediction.description;
    methods.setValue("search_address", description, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setAddressQuery(description);
    setIsPlacesOpen(false);

    if (!prediction.place_id) return;

    try {
      const response = await fetch(
        `/api/google-places/details?placeId=${encodeURIComponent(
          prediction.place_id,
        )}`,
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to fetch address details.");
      }

      const payload = (await response.json()) as {
        address_components?: AddressComponent[];
        error?: string;
      };

      if (payload.error) {
        throw new Error(payload.error);
      }

      const components = payload.address_components ?? [];
      const country = getComponentByType(components, "country")?.long_name;
      const streetNumber = getComponentByType(
        components,
        "street_number",
      )?.long_name;
      const streetName = getComponentByType(components, "route")?.long_name;
      const suburb = getComponentByPriority(components, [
        "locality",
        "postal_town",
        "sublocality",
        "sublocality_level_1",
      ])?.long_name;
      const state = getComponentByPriority(components, [
        "administrative_area_level_1",
        "administrative_area_level_2",
      ])?.long_name;
      const postcode = getComponentByType(components, "postal_code")?.long_name;

      if (country)
        methods.setValue("country", country, {
          shouldDirty: true,
          shouldValidate: true,
        });
      if (streetNumber)
        methods.setValue("street_number", streetNumber, {
          shouldDirty: true,
          shouldValidate: true,
        });
      if (streetName)
        methods.setValue("street_name", streetName, {
          shouldDirty: true,
          shouldValidate: true,
        });
      if (suburb)
        methods.setValue("suburb", suburb, {
          shouldDirty: true,
          shouldValidate: true,
        });
      if (state)
        methods.setValue("state", state, {
          shouldDirty: true,
          shouldValidate: true,
        });
      if (postcode)
        methods.setValue("postcode", postcode, {
          shouldDirty: true,
          shouldValidate: true,
        });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to fetch address details.",
      );
    }
  };

  const {
    formState: { errors },
  } = methods;
  const searchAddressError = getFieldError(errors, "search_address")
    ?.message as string | undefined;

  return (
    <FormProvider {...methods}>
      <HealthCoverAutoSubmit applicationId={applicationId} />

      <form className="space-y-5" onSubmit={methods.handleSubmit(onSubmit)}>
        {/* Passport Upload Section */}
        <Card className="border-primary/20 bg-primary/5 shadow-sm">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-primary" />
                <h4 className="font-medium text-sm">
                  Quick Fill with Passport
                </h4>
              </div>

              {!uploadedFile ? (
                <Dropzone
                  onDrop={(acceptedFiles) => {
                    const file = acceptedFiles?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  onError={(error) => {
                    if (error?.message) {
                      toast.error(error.message);
                    }
                  }}
                  accept={DROPZONE_ACCEPT}
                  maxFiles={1}
                  maxSize={MAX_FILE_SIZE_BYTES}
                  disabled={isUploading || !applicationId}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer",
                    "border-muted hover:border-primary/50 hover:bg-accent",
                  )}
                >
                  <DropzoneEmptyState>
                    <div className="flex items-center justify-center gap-2">
                      <Upload className="h-4 w-4 text-primary" />
                      <div className="text-left">
                        <p className="text-sm font-medium">
                          Upload passport to auto-fill
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getDropzoneHelperText(MAX_FILE_SIZE_BYTES)}
                        </p>
                      </div>
                    </div>
                  </DropzoneEmptyState>
                </Dropzone>
              ) : (
                <div className="border rounded-lg p-3 bg-background">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-xs truncate">
                              {uploadedFile.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Extracting data...
                            </p>
                          </div>
                        </>
                      ) : uploadSuccess ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-xs truncate">
                              {uploadedFile.name}
                            </p>
                            <p className="text-xs text-green-600">
                              Data extracted!
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <FileCheck2 className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-xs truncate">
                              {uploadedFile.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                    {!isUploading && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveFile}
                        className="h-6 w-6 p-0 shrink-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Extracted Data Preview */}
        {uploadSuccess && extractedSummary && (
          <ExtractedDataPreview data={extractedSummary} />
        )}

        {/* PASSPORT DETAILS */}
        <section className="space-y-3 border p-4 rounded-lg">
          <h3 className="text-lg font-semibold">Passport Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSearchableSelect
              name="country_of_birth"
              label="Country of Birth"
              placeholder="Select country..."
              searchPlaceholder="Search countries..."
              options={getCountriesList()}
              emptyMessage="No country found."
            />
            <FormSearchableSelect
              name="nationality"
              label="Nationality"
              placeholder="Select nationality..."
              searchPlaceholder="Search nationalities..."
              options={getNationalitiesList()}
              emptyMessage="No nationality found."
            />
            <FormInput
              name="passport_number"
              label="Passport Number"
              placeholder="Enter passport number"
            />
            <FormInput
              name="passport_expiry"
              label="Passport Expiry Date"
              type="date"
              min={tomorrowForInput}
            />
          </div>
        </section>

        {/* BASIC INFORMATION */}
        <section className="space-y-3 border p-4 rounded-lg">
          <div>
            <h3 className="text-lg font-semibold">Basic Information</h3>
          </div>

          <div className="space-y-4">
            {/* Student Origin */}
            <FormRadio
              name="student_origin"
              label="Student Origin"
              options={[
                "Overseas Student (Offshore)",
                "Overseas Student in Australia (Onshore)",
                "Resident Student (Domestic)",
              ]}
            />

            {methods.watch("student_origin") ===
              "Overseas Student in Australia (Onshore)" && (
              <Card className="border-primary/20 bg-primary/5 shadow-sm mt-3 animate-in fade-in-0 duration-200">
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm flex items-center gap-1.5 text-primary">
                      <Info className="h-4 w-4 shrink-0" />
                      ESOS Onshore Commission Self-Assessment
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Due to National Code regulations, education providers are prohibited from paying commissions to education agents for the recruitment of onshore transfer students who have already commenced study in Australia with another provider (unless accepted on or before 31 March 2026).
                    </p>
                  </div>
                  
                  <div className="flex">
                    <a
                      href="https://www.education.gov.au/esos-framework/resources/ban-payment-agent-commissions-onshore-transfers"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 bg-primary/10 px-2.5 py-1.5 rounded"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View Onshore Transfer Commission Policy
                    </a>
                  </div>

                  <div className="pt-2 border-t border-primary/10">
                    <FormRadio
                      name="esos_agent_assessment"
                      label="Eligibility Self-Assessment Declaration"
                      options={[
                        {
                          label: "I believe this student is eligible for onshore commission under ESOS",
                          value: "eligible",
                        },
                        {
                          label: "I believe this student is not eligible for onshore commission under ESOS",
                          value: "not_eligible",
                        },
                      ]}
                      colMode={true}
                      disabled={!!applicationResponse?.data?.status && applicationResponse?.data?.status !== "draft"}
                    />
                    {methods.watch("esos_agent_assessment") && (
                      <div className="mt-4 border-t border-primary/10 pt-4">
                        <FormTextarea
                          name="esos_agent_assessment_reason"
                          label="Reason for Eligibility Assessment (Optional)"
                          placeholder="Explain why the student is or is not eligible..."
                          rows={3}
                          disabled={!!applicationResponse?.data?.status && applicationResponse?.data?.status !== "draft"}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Title */}
            <div>
              <FormRadio
                name="title"
                label="Title"
                options={["Mr", "Ms", "Mrs", "Other"]}
              />
            </div>

            {/* Full Name */}
            <div>
              <div className="flex items-center gap-0.5 mb-1">
                <p className="text-sm font-medium">Enter your Full Name</p>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info size={16} className="text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <span className="max-w-[32ch] block">
                      Please write the name that you used when you applied for
                      your Unique Student Identifier (USI), including any middle
                      names. If you do not have a USI please write your name
                      exactly as written in the identity document you choose to
                      use
                    </span>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormInput
                  name="given_name"
                  label="First Name"
                  placeholder="Enter first name"
                />
                <FormInput
                  name="middle_name"
                  label="Middle Name(Optional)"
                  placeholder="Enter middle name"
                />
                <FormInput
                  name="family_name"
                  label="Last Name"
                  placeholder="Enter last name"
                />
                <FormInput
                  name="date_of_birth"
                  label="Date of birth"
                  type="date"
                  max={yesterdayForInput}
                />
              </div>
            </div>

            <FormRadio
              name="gender"
              label="Gender"
              options={["Male", "Female", "Other"]}
            />
          </div>
        </section>

        {/* CONTACT DETAILS */}
        <section className="space-y-3 border p-4 rounded-lg">
          <div>
            <h3 className="text-lg font-semibold">Contact Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              name="email"
              label="Contact Email Address"
              type="email"
              placeholder="Enter email address"
              readOnly={isEmailLocked}
              description={
                isEmailLocked
                  ? "This email is locked to the address linked to your application."
                  : undefined
              }
            />
            {/* <FormInput
              name="alternate_email"
              label="Alternate Email Address(Optional)"
              type="email"
              placeholder="Enter alternate email address"
            /> */}
            <FormInput
              name="phone"
              label="Mobile Number"
              placeholder="Enter mobile number"
            />
            {/* <FormInput
              name="home_phone"
              label="Home Phone(Optional)"
              placeholder="Enter home phone"
            /> */}
          </div>
        </section>

        {/* VISA DETAILS - Only show for Onshore students */}
        {methods.watch("student_origin") ===
          "Overseas Student in Australia (Onshore)" && (
          <section className="space-y-3 border p-4 rounded-lg">
            <div>
              <h3 className="text-lg font-semibold">Visa Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                name="visa_type"
                label="VISA Type"
                placeholder="Select VISA Type"
                options={[
                  { value: "graduate_485", label: "Graduate 485" },
                  { value: "student_visa", label: "Student Visa" },
                  { value: "tourist_visitor", label: "Tourist/Visitor" },
                  { value: "working_holiday", label: "Working Holiday" },
                  { value: "other", label: "Other" },
                ]}
              />
              <FormInput
                name="visa_number"
                label="VISA Number"
                placeholder="Enter visa number"
              />
              <FormInput name="visa_expiry" label="Expiry Date" type="date" />
            </div>
          </section>
        )}

        <section className="space-y-3 border p-4 rounded-lg">
          <div className="flex items-center gap-1">
            <h3 className="text-lg font-semibold">Residential Address</h3>

            <Tooltip>
              <TooltipTrigger asChild>
                <Info size={16} className="text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm space-y-2 text-xs">
                <p>
                  Please provide the physical address (street number and name
                  not post office box) where you usually reside rather than any
                  temporary address at which you reside for training, work or
                  other purposes before returning to your home.
                </p>

                <p>
                  If you are from a rural area use the address from your state
                  or territorys rural property addressing or numbering system as
                  your residential street address.
                </p>

                <p>
                  Building/property name is the official place name or common
                  usage name for an address site, including the name of a
                  building, Aboriginal community, homestead, building complex,
                  agricultural property, park or unbounded address site.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="search_address">Search Address</Label>
              <Controller
                name="search_address"
                control={methods.control}
                render={({ field: { value, onChange, onBlur, ref } }) => (
                  <div className="relative">
                    <Input
                      id="search_address"
                      ref={ref}
                      placeholder="Enter address or search"
                      aria-invalid={!!searchAddressError}
                      value={value ?? ""}
                      onChange={(event) => {
                        const nextValue = event.target.value;
                        onChange(nextValue);
                        setAddressQuery(nextValue);
                        setIsPlacesOpen(true);
                      }}
                      onFocus={() => setIsPlacesOpen(true)}
                      onBlur={(event) => {
                        onBlur();
                        const inputEl = event.currentTarget;
                        setTimeout(() => {
                          if (!inputEl.contains(document.activeElement)) {
                            setIsPlacesOpen(false);
                          }
                        }, 150);
                      }}
                      autoComplete="off"
                    />

                    {isPlacesOpen &&
                    (isPlacesLoading ||
                      placesError ||
                      placePredictions.length > 0) ? (
                      <div className="absolute z-20 mt-1 w-full rounded-md border bg-background shadow">
                        {isPlacesLoading ? (
                          <p className="px-3 py-2 text-xs text-muted-foreground">
                            Loading suggestions...
                          </p>
                        ) : placesError ? (
                          <p className="px-3 py-2 text-xs text-destructive">
                            {placesError}
                          </p>
                        ) : (
                          <ul className="max-h-56 overflow-auto py-1 text-sm">
                            {placePredictions.map((prediction) => (
                              <li
                                key={
                                  prediction.place_id ?? prediction.description
                                }
                              >
                                <button
                                  type="button"
                                  className="w-full text-left px-3 py-2 hover:bg-muted"
                                  onMouseDown={(event) =>
                                    event.preventDefault()
                                  }
                                  onClick={() => handlePlaceSelect(prediction)}
                                >
                                  <span className="font-medium">
                                    {prediction.structured_formatting
                                      ?.main_text ?? prediction.description}
                                  </span>
                                  {prediction.structured_formatting
                                    ?.secondary_text ? (
                                    <span className="text-muted-foreground">
                                      {
                                        prediction.structured_formatting
                                          .secondary_text
                                      }
                                    </span>
                                  ) : null}
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}
              />
              {searchAddressError ? (
                <p className="text-sm text-red-500">{searchAddressError}</p>
              ) : null}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSearchableSelect
                name="country"
                label="Country"
                placeholder="Select country..."
                searchPlaceholder="Search countries..."
                options={getCountriesList()}
                emptyMessage="No country found."
              />
              {/* <FormInput
                name="building_name"
                label="Building / Property name(Optional)"
                placeholder="Enter building name"
              />
              <FormInput
                name="flat_unit"
                label="Flat / Unit(Optional)"
                placeholder="Enter unit or apartment"
              /> */}
              <FormInput
                name="street_number"
                label="Street Number"
                placeholder="Enter street number"
              />
              <FormInput
                name="street_name"
                label="Street Name"
                placeholder="Enter street name"
              />
              <FormInput
                name="suburb"
                label="City/Town/Suburb"
                placeholder="Enter suburb or city"
              />
              <FormInput
                name="state"
                label="State/Province"
                placeholder="Enter state or province"
              />
              <FormInput
                name="postcode"
                label="Post Code"
                placeholder="Enter postcode"
              />
            </div>
          </div>
        </section>

        {/* POSTAL ADDRESS */}
        <section className="space-y-3 border p-4 rounded-lg">
          <div>
            <h3 className="text-lg font-semibold">Postal Address</h3>
          </div>

          <div className="space-y-4">
            <FormRadio
              name="postal_same_as_residential"
              label="Is your Postal address same as residential address?"
              options={["Yes", "No"]}
            />

            {methods.watch("postal_same_as_residential") === "No" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSearchableSelect
                  name="postal_country"
                  label="Country"
                  placeholder="Select country..."
                  searchPlaceholder="Search countries..."
                  options={getCountriesList()}
                  emptyMessage="No country found."
                />
                <FormInput
                  name="postal_building_name"
                  label="Building/Property name"
                  placeholder="Enter building name"
                />
                <FormInput
                  name="postal_flat_unit"
                  label="Flat/Unit"
                  placeholder="Enter unit or apartment"
                />
                <FormInput
                  name="postal_street_number"
                  label="Street Number"
                  placeholder="Enter street number"
                />
                <FormInput
                  name="postal_street_name"
                  label="Street Name"
                  placeholder="Enter street name"
                />
                <FormInput
                  name="postal_suburb"
                  label="City/Town/Suburb"
                  placeholder="Enter suburb or city"
                />
                <FormInput
                  name="postal_state"
                  label="State/Province"
                  placeholder="Enter state or province"
                />
                <FormInput
                  name="postal_postcode"
                  label="Post Code"
                  placeholder="Enter postcode"
                />
              </div>
            )}
          </div>
        </section>

        {/* OVERSEAS/PERMANENT ADDRESS */}
        <section className="space-y-3 border p-4 rounded-lg">
          <div>
            <h3 className="text-lg font-semibold">
              Overseas/Permanent Address
            </h3>
          </div>

          <div className="space-y-4">
            <FormSearchableSelect
              name="overseas_country"
              label="Select country"
              placeholder="Select country..."
              searchPlaceholder="Search countries..."
              options={getCountriesList()}
              emptyMessage="No country found."
            />

            <FormTextarea
              name="overseas_address"
              label="Overseas Address"
              placeholder="Enter overseas address"
              rows={5}
            />
          </div>
        </section>

        <ApplicationStepHeader>
          <Button type="submit" disabled={personalDetailsMutation.isPending}>
            {personalDetailsMutation.isPending
              ? "Saving..."
              : "Save & Continue"}
            <ChevronRight />
          </Button>
        </ApplicationStepHeader>
      </form>
    </FormProvider>
  );
};

export default PersonalDetailsForm;
