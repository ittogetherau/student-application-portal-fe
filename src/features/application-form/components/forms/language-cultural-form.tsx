/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { FormInput } from "@/components/forms/form-input";
import { FormRadio } from "@/components/forms/form-radio";
import { FormSearchableSelect } from "@/components/forms/form-searchable-select";
import { FormSelect } from "@/components/forms/form-select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dropzone, DropzoneEmptyState } from "@/components/ui/dropzone";
import ApplicationStepHeader from "@/features/application-form/components/application-step-header";

import { useFormPersistence } from "@/features/application-form/hooks/use-form-persistence.hook";
import {
  defaultLanguageAndCultureValues,
  languageAndCultureSchema,
  type LanguageAndCultureFormValues,
  type LanguageAndCultureValues,
} from "@/features/application-form/utils/validations/language-cultural";
import documentService from "@/service/document.service";
import useDocuments, {
  useDocumentTypesQuery,
} from "@/shared/hooks/document.hook";
import {
  DROPZONE_ACCEPT,
  MAX_FILE_SIZE_BYTES,
  getDropzoneHelperText,
  isAllowedFileType,
} from "@/shared/lib/document-file-helpers";
import { cn } from "@/shared/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  ChevronRight,
  FileCheck2,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useApplicationStepMutations } from "../../hooks/use-application-steps.hook";
import { ExtractedDataPreview } from "../extracted-data-preview";

const languageOptions = [
  "Afrikaans",
  "Albanian",
  "Arabic",
  "Armenian",
  "Bengali",
  "Bulgarian",
  "Burmese",
  "Cantonese",
  "Chinese (Mandarin)",
  "Croatian",
  "Czech",
  "Danish",
  "Dutch",
  "English",
  "Estonian",
  "Filipino",
  "Finnish",
  "French",
  "German",
  "Greek",
  "Gujarati",
  "Hebrew",
  "Hindi",
  "Hungarian",
  "Indonesian",
  "Italian",
  "Japanese",
  "Kannada",
  "Khmer",
  "Korean",
  "Lao",
  "Latvian",
  "Lithuanian",
  "Malay",
  "Malayalam",
  "Marathi",
  "Mongolian",
  "Nepali",
  "Norwegian",
  "Persian",
  "Polish",
  "Portuguese",
  "Punjabi",
  "Romanian",
  "Russian",
  "Serbian",
  "Sinhala",
  "Slovak",
  "Slovenian",
  "Spanish",
  "Swahili",
  "Swedish",
  "Tamil",
  "Telugu",
  "Thai",
  "Turkish",
  "Ukrainian",
  "Urdu",
  "Vietnamese",
  "Other",
];

// Test type options
const testTypeOptions = [
  {
    value: "ielts",
    label: "INTERNATIONAL ENGLISH LANGUAGE TESTING SYSTEM (IELTS)",
  },
  { value: "pte", label: "PEARSON TEST OF ENGLISH (PTE)" },
  { value: "toefl", label: "TEST OF ENGLISH AS A FOREIGN LANGUAGE (TOEFL)" },
  { value: "cambridge", label: "CAMBRIDGE ENGLISH" },
  { value: "oet", label: "OCCUPATIONAL ENGLISH TEST (OET)" },
  { value: "other", label: "OTHER" },
];

const stepId = 4; // Language & Culture is step 4
const LanguageDefaultForm = ({ applicationId }: { applicationId: string }) => {
  const languageMutation = useApplicationStepMutations(applicationId)[stepId];

  const methods = useForm<LanguageAndCultureFormValues>({
    resolver: zodResolver(languageAndCultureSchema),
    defaultValues: defaultLanguageAndCultureValues,
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

  // English test upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [extractedSummary, setExtractedSummary] = useState<Record<
    string,
    any
  > | null>(null);

  // Get document types and upload hook
  const { data: documentTypesResponse } = useDocumentTypesQuery();
  const { uploadDocument } = useDocuments(applicationId);

  // Get English test document type ID
  const englishTestDocType = documentTypesResponse?.data?.find(
    (dt) => dt.code === "ENGLISH_TEST",
  );

  // Handle file upload
  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!applicationId || !englishTestDocType) {
        toast.error("Application not ready for upload");
        return;
      }

      if (!isAllowedFileType(file)) {
        toast.error("Please upload a valid image (JPG, PNG) or PDF file");
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error("File size must be less than 5MB");
        return;
      }

      setUploadedFile(file);
      setIsUploading(true);
      setUploadSuccess(false);
      setExtractedSummary(null);

      try {
        await uploadDocument.mutateAsync({
          application_id: applicationId,
          document_type_id: englishTestDocType.id,
          file,
          process_ocr: true,
        });

        toast.success("Test report uploaded! Extracting data...");

        const maxAttempts = 15;
        let attempts = 0;

        const pollOcrResults = async (): Promise<void> => {
          attempts++;

          try {
            const ocrResponse =
              await documentService.getOcrResults(applicationId);

            if (ocrResponse.success && ocrResponse.data) {
              const data = ocrResponse.data as any;
              const languageData =
                data.language_cultural?.extracted_data ||
                data.sections?.language_cultural?.extracted_data;
              const pendingCount = data.metadata?.ocr_pending || 0;

              if (languageData && pendingCount === 0) {
                let fieldsPopulated = 0;

                // Helper to set form value if not already set
                const setIfEmpty = (
                  key: keyof LanguageAndCultureFormValues,
                  value: any,
                ) => {
                  const currentValue = methods.getValues(key);
                  if (
                    !currentValue &&
                    value !== null &&
                    value !== undefined &&
                    value !== ""
                  ) {
                    methods.setValue(key, value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                    fieldsPopulated++;
                  }
                };

                // 1. Map top-level fields
                if (languageData.test_type) {
                  const testTypeStr = String(languageData.test_type)
                    .toUpperCase()
                    .trim();
                  const matchedOption = testTypeOptions.find(
                    (opt) =>
                      opt.value.toUpperCase() === testTypeStr ||
                      opt.label.toUpperCase().includes(testTypeStr),
                  );
                  if (matchedOption) {
                    setIfEmpty("english_test_type", matchedOption.value);
                  } else {
                    setIfEmpty("english_test_type", "other");
                  }
                }

                if (languageData.overall_score) {
                  setIfEmpty(
                    "english_test_overall",
                    String(languageData.overall_score),
                  );
                }

                // Handle date with multiple possible keys
                const testDate =
                  languageData.test_date ||
                  languageData.date_of_test ||
                  languageData.date;
                if (testDate) {
                  setIfEmpty("english_test_date", String(testDate));
                }

                // 2. Map nested component scores
                const scores = languageData.component_scores;
                if (scores && typeof scores === "object") {
                  if (scores.listening)
                    setIfEmpty(
                      "english_test_listening",
                      String(scores.listening),
                    );
                  if (scores.reading)
                    setIfEmpty("english_test_reading", String(scores.reading));
                  if (scores.writing)
                    setIfEmpty("english_test_writing", String(scores.writing));
                  if (scores.speaking)
                    setIfEmpty(
                      "english_test_speaking",
                      String(scores.speaking),
                    );
                }

                // 3. Mark test as completed
                methods.setValue("completed_english_test", "Yes", {
                  shouldValidate: true,
                  shouldDirty: true,
                });

                // Trigger a full form validation to clear previous errors
                setTimeout(() => methods.trigger(), 100);

                setExtractedSummary(languageData);
                setUploadSuccess(true);
                setIsUploading(false);

                if (fieldsPopulated > 0) {
                  toast.success(
                    `Test data extracted! ${fieldsPopulated} fields populated.`,
                  );
                } else {
                  toast.success("Test report uploaded successfully!");
                }
                return;
              }

              if (attempts < maxAttempts) {
                setTimeout(() => pollOcrResults(), 2000);
              } else {
                setUploadSuccess(false);
                setIsUploading(false);
                toast.error("OCR processing timed out.");
              }
            } else {
              if (attempts < maxAttempts) {
                setTimeout(() => pollOcrResults(), 2000);
              } else {
                setUploadSuccess(false);
                setIsUploading(false);
                toast.error("Failed to extract data from test report");
              }
            }
          } catch {
            if (attempts < maxAttempts) {
              setTimeout(() => pollOcrResults(), 2000);
            } else {
              setUploadSuccess(false);
              setIsUploading(false);
              toast.error("Failed to extract data from test report");
            }
          }
        };

        setTimeout(() => pollOcrResults(), 2000);
      } catch (error) {
        console.error("Upload failed:", error);
        toast.error("Failed to upload test report");
        setUploadedFile(null);
        setIsUploading(false);
      }
    },
    [applicationId, englishTestDocType, uploadDocument, methods],
  );

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadSuccess(false);
    setExtractedSummary(null);
  };

  const onSubmit = (values: LanguageAndCultureFormValues) => {
    if (applicationId) {
      saveOnSubmit(values);
    }
    const payload: LanguageAndCultureValues =
      languageAndCultureSchema.parse(values);
    languageMutation.mutate(payload);
  };

  // Watch for conditional rendering
  const isEnglishMain = methods.watch("is_english_main_language");
  const completedEnglishTest = methods.watch("completed_english_test");

  return (
    <FormProvider {...methods}>
      <form className="space-y-10" onSubmit={methods.handleSubmit(onSubmit)}>
        {/* English Test Upload Section */}
        <Card className="border-primary/20 bg-primary/5 shadow-sm">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-primary" />
                <h4 className="font-medium text-sm">
                  Quick Fill with English Test Report
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
                          Upload test report to auto-fill
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
          <ExtractedDataPreview
            data={extractedSummary}
            title="Extracted English Test Information"
          />
        )}

        <section className=" border p-4 rounded-lg">
          {/* LANGUAGE AND CULTURAL DIVERSITY */}
          <section className="space-y-6">
            <div className="space-y-6">
              <div>
                <FormRadio
                  colMode={true}
                  name="is_aus_aboriginal_or_islander"
                  label="Are you of Australian Aboriginal and Torres Strait Islander origin? *"
                  options={[
                    {
                      label: "Yes, Aboriginal",
                      value: "1",
                    },
                    {
                      label: "Yes, Torres Strait Islander",
                      value: "2",
                    },
                    {
                      label: "Yes, Both Aboriginal and Torres Strait Islander",
                      value: "3",
                    },
                    {
                      label: "No",
                      value: "4",
                    },
                    {
                      label: "Not Stated",
                      value: "@",
                    },
                  ]}
                />
                <p className="text-xs text-muted-foreground mb-3">
                  For persons of both Australian Aboriginal and Torres Strait
                  Islander origin, mark both yes boxes.
                </p>
              </div>

              {/* Is English main language */}
              <div>
                <FormRadio
                  colMode={true}
                  name="is_english_main_language"
                  label="Is English your main language? *"
                  options={["Yes", "No"]}
                />
              </div>

              {/* Conditional: Main Language selection */}
              {isEnglishMain === "No" && (
                <div>
                  <FormSearchableSelect
                    name="main_language"
                    label="If No, What is your Main Language? *"
                    placeholder="Select Language..."
                    searchPlaceholder="Search languages..."
                    options={languageOptions}
                    emptyMessage="No language found."
                  />
                </div>
              )}

              {/* English speaking proficiency */}
              <div>
                <FormRadio
                  name="english_speaking_proficiency"
                  label="How well do you speak English? *"
                  options={[
                    "Very Well",
                    "Well",
                    "Not Well",
                    "Not at all",
                    "Not Stated",
                  ]}
                />
              </div>
            </div>
          </section>
        </section>

        <section className=" border p-4 rounded-lg">
          <div className="space-y-6">
            <h3 className="text-lg">English Language Proficiency</h3>

            <div className="space-y-6">
              {/* Previous studies */}
              <div>
                <p className="text-sm mb-3">
                  Was English the language of instruction in previous secondary
                  or tertiary studies?(Optional)
                </p>
                <FormRadio
                  name="english_instruction_previous_studies"
                  label=""
                  options={["Yes", "No"]}
                />
              </div>

              {/* Completed English test */}
              <div>
                <p className="text-sm mb-3">
                  Have you completed a test of English Language
                  Proficiency?(Optional)
                </p>
                <FormRadio
                  name="completed_english_test"
                  label=""
                  options={["Yes", "No"]}
                />
              </div>

              {/* English Test Section - Conditional */}
              {completedEnglishTest === "Yes" && (
                <div className="space-y-4">
                  <h4 className="text-sm">English Test</h4>

                  {/* Test Details Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left p-3 font-normal">
                              TEST TYPE <span className="text-red-500">*</span>
                            </th>
                            <th className="text-left p-3 font-normal">
                              DATE OF TEST{" "}
                              <span className="text-red-500">*</span>
                            </th>
                            <th className="text-left p-3 font-normal">
                              LISTENING <span className="text-red-500">*</span>
                            </th>
                            <th className="text-left p-3 font-normal">
                              WRITING <span className="text-red-500">*</span>
                            </th>
                            <th className="text-left p-3 font-normal">
                              READING <span className="text-red-500">*</span>
                            </th>
                            <th className="text-left p-3 font-normal">
                              SPEAKING <span className="text-red-500">*</span>
                            </th>
                            <th className="text-left p-3 font-normal">
                              OVERALL <span className="text-red-500">*</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-t">
                            <td className="p-3">
                              <FormSelect
                                name="english_test_type"
                                label=""
                                placeholder="Select test..."
                                options={testTypeOptions}
                              />
                            </td>
                            <td className="p-3">
                              <FormInput
                                name="english_test_date"
                                label=""
                                type="date"
                              />
                            </td>
                            <td className="p-3">
                              <FormInput
                                name="english_test_listening"
                                label=""
                                type="number"
                                placeholder="Enter score"
                              />
                            </td>
                            <td className="p-3">
                              <FormInput
                                name="english_test_writing"
                                label=""
                                type="number"
                                placeholder="Enter score"
                              />
                            </td>
                            <td className="p-3">
                              <FormInput
                                name="english_test_reading"
                                label=""
                                type="number"
                                placeholder="Enter score"
                              />
                            </td>
                            <td className="p-3">
                              <FormInput
                                name="english_test_speaking"
                                label=""
                                type="number"
                                placeholder="Enter score"
                              />
                            </td>
                            <td className="p-3">
                              <FormInput
                                name="english_test_overall"
                                label=""
                                type="number"
                                placeholder="Enter score"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <ApplicationStepHeader>
          <Button type="submit" disabled={languageMutation.isPending}>
            {languageMutation.isPending ? (
              "Saving..."
            ) : (
              <>
                Save & Continue <ChevronRight />
              </>
            )}
          </Button>
        </ApplicationStepHeader>
      </form>
    </FormProvider>
  );
};

export default LanguageDefaultForm;
