/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import ApplicationStepHeader from "@/app/dashboard/application/create/_components/application-step-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormInput } from "@/components/ui/forms/form-input";
import { FormRadio } from "@/components/ui/forms/form-radio";
import { FormSearchableSelect } from "@/components/ui/forms/form-searchable-select";
import { FormSelect } from "@/components/ui/forms/form-select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getCountriesList, getNationalitiesList } from "@/data/country-list";
import { useDocuments, useDocumentTypesQuery } from "@/hooks/document.hook";
import { useApplicationStepMutations } from "@/hooks/useApplicationSteps.hook";
import { useFormPersistence } from "@/hooks/useFormPersistence.hook";
import { cn } from "@/lib/utils";
import documentService from "@/service/document.service";
import {
  defaultPersonalDetailsValues,
  personalDetailsSchema,
  type PersonalDetailsValues,
} from "@/validation/application/personal-details";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  ChevronRight,
  FileCheck2,
  Info,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { ExtractedDataPreview } from "../_components/extracted-data-preview";
import HealthCoverAutoSubmit from "../_components/health-cover-auto-submit";

const stepId = 1;

const PersonalDetailsForm = ({ applicationId }: { applicationId: string }) => {
  const personalDetailsMutation =
    useApplicationStepMutations(applicationId)[stepId];

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

  // Passport upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [extractedSummary, setExtractedSummary] = useState<Record<
    string,
    any
  > | null>(null);
  // Get document types and upload hook
  const { data: documentTypesResponse } = useDocumentTypesQuery();
  const { uploadDocument } = useDocuments(applicationId);

  // Get passport document type ID
  const passportDocType = documentTypesResponse?.data?.find(
    (dt) => dt.code === "PASSPORT"
  );

  // Handle file upload
  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!applicationId || !passportDocType) {
        toast.error("Application not ready for upload");
        return;
      }

      // Validate file type
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
      ];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a valid image (JPG, PNG) or PDF file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      setUploadedFile(file);
      setIsUploading(true);
      setUploadSuccess(false);

      try {
        // Upload the document
        await uploadDocument.mutateAsync({
          application_id: applicationId,
          document_type_id: passportDocType.id,
          file,
        });

        toast.success("Passport uploaded! Extracting data...");

        // Poll for OCR results (max 30 seconds)
        const maxAttempts = 15; // 15 attempts * 2 seconds = 30 seconds
        let attempts = 0;

        const pollOcrResults = async (): Promise<void> => {
          attempts++;

          try {
            console.log(
              "[PersonalDetails] 🔍 Polling OCR results, attempt:",
              attempts
            );
            const ocrResponse = await documentService.getOcrResults(
              applicationId
            );

            console.log("[PersonalDetails] 📦 OCR Response:", {
              success: ocrResponse.success,
              hasData: !!ocrResponse.data,
              response: ocrResponse,
            });

            if (ocrResponse.success && ocrResponse.data) {
              console.log(
                "[PersonalDetails] 📊 OCR Sections:",
                ocrResponse.data.sections
              );
              console.log(
                "[PersonalDetails] 📋 Personal Details Section:",
                ocrResponse.data.sections.personal_details
              );

              let personalDetailsData =
                ocrResponse.data.sections.personal_details?.extracted_data;

              if (
                personalDetailsData &&
                typeof personalDetailsData === "object" &&
                !Array.isArray(personalDetailsData)
              ) {
                // Transform data for form fields
                const transformedData: Record<string, any> = {
                  ...personalDetailsData,
                };

                // Map expiry_date to passport_expiry
                if (
                  transformedData.expiry_date &&
                  !transformedData.passport_expiry
                ) {
                  transformedData.passport_expiry = transformedData.expiry_date;
                }

                // Normalize gender
                if (transformedData.gender) {
                  const gender = String(transformedData.gender).toUpperCase();
                  if (gender === "M" || gender === "MALE") {
                    transformedData.gender = "Male";
                  } else if (gender === "F" || gender === "FEMALE") {
                    transformedData.gender = "Female";
                  }
                }

                personalDetailsData = transformedData;
              }

              console.log(
                "[PersonalDetails] 🎯 Processed Data:",
                personalDetailsData
              );

              // Check if OCR is still pending
              const pendingCount = ocrResponse.data.metadata?.ocr_pending || 0;
              console.log(
                "[PersonalDetails] ⏳ Pending OCR jobs:",
                pendingCount
              );

              if (personalDetailsData && pendingCount === 0) {
                // OCR completed successfully
                console.log("[PersonalDetails] ✅ OCR COMPLETE!");

                // Get current form values
                const currentFormValues = methods.getValues();

                // Populate form fields with better error handling
                let fieldsPopulated = 0;

                Object.entries(personalDetailsData).forEach(([key, value]) => {
                  try {
                    const fieldKey = key as keyof PersonalDetailsValues;
                    const currentValue = methods.getValues(fieldKey);

                    // Skip if field already has a value
                    if (currentValue) return;

                    // Skip null/undefined/empty values
                    if (value === null || value === undefined || value === "")
                      return;

                    // Set the value
                    methods.setValue(fieldKey, value as any, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                    fieldsPopulated++;
                  } catch (error) {
                    console.error(
                      `[PersonalDetails] ❌ Error setting field "${key}":`,
                      error
                    );
                  }
                });

                setExtractedSummary(personalDetailsData);
                setUploadSuccess(true);
                setIsUploading(false);
                if (fieldsPopulated > 0) {
                  toast.success(
                    `Passport data extracted! ${fieldsPopulated} fields populated.`
                  );
                } else {
                  toast.success("Passport uploaded successfully!");
                }
                return;
              }

              // OCR still processing, continue polling
              if (attempts < maxAttempts) {
                setTimeout(() => pollOcrResults(), 2000); // Poll every 2 seconds
              } else {
                // Timeout
                setUploadSuccess(false);
                setIsUploading(false);
                toast.error("OCR processing timed out. Please try again.");
              }
            } else {
              // No OCR data yet, continue polling
              if (attempts < maxAttempts) {
                setTimeout(() => pollOcrResults(), 2000);
              } else {
                setUploadSuccess(false);
                setIsUploading(false);
                toast.error("Failed to extract data from passport");
              }
            }
          } catch (error) {
            console.error("OCR polling error:", error);
            if (attempts < maxAttempts) {
              setTimeout(() => pollOcrResults(), 2000);
            } else {
              setUploadSuccess(false);
              setIsUploading(false);
              toast.error("Failed to extract data from passport");
            }
          }
        };

        // Start polling after a short delay
        setTimeout(() => pollOcrResults(), 2000);
      } catch (error) {
        console.error("Upload failed:", error);
        toast.error("Failed to upload passport");
        setUploadedFile(null);
        setIsUploading(false);
      }
    },
    [applicationId, passportDocType, uploadDocument, methods]
  );

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Remove uploaded file
  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadSuccess(false);
    setExtractedSummary(null);
  };

  const onSubmit = (values: PersonalDetailsValues) => {
    console.log("submitting personal details", values);
    if (applicationId) {
      saveOnSubmit(values);
    }
    personalDetailsMutation.mutate(values);
  };

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
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer",
                    isDragging
                      ? "border-primary bg-primary/10"
                      : "border-muted hover:border-primary/50 hover:bg-accent"
                  )}
                >
                  <input
                    type="file"
                    id="passport-upload"
                    className="hidden"
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    onChange={handleFileChange}
                    disabled={isUploading || !applicationId}
                  />
                  <label
                    htmlFor="passport-upload"
                    className="cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Upload className="h-4 w-4 text-primary" />
                    <div className="text-left">
                      <p className="text-sm font-medium">
                        Upload passport to auto-fill
                      </p>
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG or PDF (max 5MB)
                      </p>
                    </div>
                  </label>
                </div>
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
            <FormInput
              name="search_address"
              label="Search Address"
              placeholder="Enter address or search"
            />

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

            {/* <FormTextarea
              name="overseas_address"
              label="Overseas Address(Optional)"
              placeholder="Enter overseas address"
              rows={5}
            /> */}
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
