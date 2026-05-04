"use client";

import React, { useState, useEffect } from "react";
import { useFieldArray, useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Plus, Trash, FileText, Loader2, PenTool, RefreshCw, Sparkles, Eye, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { FormInput } from "@/components/forms/form-input";
import { FormRadio } from "@/components/forms/form-radio";
import { cn } from "@/shared/lib/utils";
import { useUploadDocument, useDocumentTypesQuery } from "@/shared/hooks/document.hook";
import { useApplicationGetQuery, useApplicationUpdateMutation } from "@/shared/hooks/use-applications";
import SignatureModal from "@/features/gs/components/signature-modal";

import {
  advancedStandingSchema,
  AdvancedStandingFormValues,
} from "../utils/advanced-standing.validation";
import { generateAdvancedStandingPdf } from "../utils/advanced-standing-pdf.util";

type AdvancedStandingFormProps = {
  applicationId: string;
  onSuccess?: () => void;
  isStaffMode?: boolean;
};

export default function AdvancedStandingForm({
  applicationId,
  onSuccess,
  isStaffMode = false,
}: AdvancedStandingFormProps) {
  const { data: appData, isLoading: isLoadingApp } =
    useApplicationGetQuery(applicationId);

  const { data: docTypesResponse } = useDocumentTypesQuery();
  const uploadMutation = useUploadDocument();
  const updateApplication = useApplicationUpdateMutation(applicationId);

  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [staffSignatureModalOpen, setStaffSignatureModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  const methods = useForm<AdvancedStandingFormValues>({
    resolver: zodResolver(advancedStandingSchema),
    defaultValues: {
      studentType: "Future Student",
      studentName: "",
      dateOfBirth: "",
      mobile: "",
      email: "",
      courseName: "",
      basisForCredit: [{ institution: "", country: "", courseCode: "", courseName: "" }],
      courseEquivalences: [{ unitCodeAndName: "", ciheEquivalent: "", approved: "" }],
      studentSignatureSvg: "",
      signatureDate: new Date().toISOString().split("T")[0],
      staffName: "",
      staffSignatureSvg: "",
      staffDate: new Date().toISOString().split("T")[0],
    },
  });

  const { control, handleSubmit, reset, getValues, setValue, watch } = methods;

  // Watch for changes to trigger preview updates
  const watchedValues = watch();

  const handleGeneratePreview = async () => {
    try {
      setIsPreviewLoading(true);
      const values = getValues();
      const pdfFile = await generateAdvancedStandingPdf(values, applicationId);
      const url = URL.createObjectURL(pdfFile);

      // Revoke old URL to avoid memory leaks
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);

      setPdfUrl(url);
    } catch (error) {
      console.error("Failed to generate PDF preview:", error);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // Pre-fill form when application data is available
  useEffect(() => {
    if (appData?.data) {
      const personal = appData.data.personal_details;
      const enrollment = appData.data.enrollment_data;

      reset({
        ...getValues(),
        // User requested: only write on student name, leave ID blank.
        // So we only pre-fill the name part.
        studentName: `${personal?.given_name || ""} ${personal?.family_name || ""}`.trim(),
        dateOfBirth: personal?.date_of_birth || "",
        mobile: personal?.phone || "",
        email: personal?.email || "",
        courseName: enrollment?.course_name || "",
        // If there's existing form data in enrollment_data, we should pre-fill it here
        ...(enrollment?.advanced_standing_data as any || {}),
      });

      // Initial preview generation
      setTimeout(handleGeneratePreview, 100);
    }
  }, [appData, reset]); // Only depend on appData and reset to avoid loops

  // Clean up URL on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  const {
    fields: basisFields,
    append: appendBasis,
    remove: removeBasis,
  } = useFieldArray({
    control,
    name: "basisForCredit",
  });

  const {
    fields: equivalenceFields,
    append: appendEquivalence,
    remove: removeEquivalence,
  } = useFieldArray({
    control,
    name: "courseEquivalences",
  });

  const onSubmit = async (values: AdvancedStandingFormValues) => {
    try {
      const loadingToast = toast.loading(isStaffMode ? "Finalizing assessment..." : "Submitting application...");

      // Generate the PDF file
      const pdfFile = await generateAdvancedStandingPdf(values, applicationId);

      toast.loading("Uploading document...", { id: loadingToast });

      // Find the ID for "OTHER" document type or similar
      const otherType = docTypesResponse?.data?.find(
        (t) => t.code === "OTHER" || t.name.toLowerCase().includes("other")
      );

      if (!otherType) {
        toast.error("Document type 'OTHER' not found. Please contact support.", { id: loadingToast });
        return;
      }

      // Upload it to the backend
      uploadMutation.mutate(
        {
          application_id: applicationId,
          document_type_id: otherType.id,
          file: pdfFile,
          document_name: isStaffMode ? "Advanced Standing Form (Assessed)" : "Advanced Standing Form",
        },
        {
          onSuccess: () => {
            // After upload, update application metadata to track form status
            const currentEnrollmentData = (appData?.data?.enrollment_data || {}) as Record<string, unknown>;
            
            updateApplication.mutate({
              enrollment_data: {
                ...currentEnrollmentData,
                advanced_standing_submitted: true,
                advanced_standing_status: isStaffMode ? "Approved" : "Pending",
                advanced_standing_data: values, // Save raw data for re-editing
              }
            }, {
              onSuccess: () => {
                toast.success(isStaffMode ? "Assessment finalized!" : "Form submitted successfully!", { id: loadingToast });
                onSuccess?.();
              },
              onError: (error) => {
                toast.error("Form uploaded but status update failed.", { id: loadingToast });
              }
            });
          },
          onError: (error) => {
            toast.error(error.message || "Failed to upload document.", { id: loadingToast });
          },
        }
      );
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while preparing the document.");
    }
  };

  const handleReject = () => {
    if (!confirm("Are you sure you want to reject this Advanced Standing application?")) return;
    const currentEnrollmentData = (appData?.data?.enrollment_data || {}) as Record<string, unknown>;
    const loadingToast = toast.loading("Rejecting application...");
    updateApplication.mutate({
      enrollment_data: {
        ...currentEnrollmentData,
        advanced_standing_status: "Rejected",
      }
    }, {
      onSuccess: () => {
        toast.success("Advanced Standing rejected.", { id: loadingToast });
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to reject.", { id: loadingToast });
      }
    });
  };

  if (isLoadingApp) {
    return <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto h-8 w-8 text-primary" /></div>;
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b flex justify-between items-center bg-card shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="text-primary h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Advanced Standing Application</h2>
            <p className="text-sm text-muted-foreground">
              Course Credit / Recognition of Prior Learning (RPL)
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-muted/5">
        <div className="max-w-4xl mx-auto p-8 space-y-8 pb-24">
          <FormProvider {...methods}>
            <form id="advanced-standing-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Section 1: Student Details */}
              <Card className="border-primary/10 shadow-md">
                <CardHeader className="bg-primary/5 border-b border-primary/10">
                  <CardTitle className="text-lg flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold text-sm shadow-sm">1</span>
                    Student Identification
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-6 space-y-6">
                  <FormRadio
                    name="studentType"
                    label="Application Category"
                    options={[
                      { label: "Future Student", value: "Future Student" },
                      { label: "Currently Enrolled Student", value: "Currently Enrolled Student" },
                    ]}
                    disabled={isStaffMode}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput name="studentName" label="Student Full Name" placeholder="Enter Full Name" disabled={isStaffMode} />
                    <FormInput name="courseName" label="Churchill Course Name" placeholder="Target Course" disabled={isStaffMode} />
                    <FormInput name="dateOfBirth" label="Date of Birth" type="date" disabled={isStaffMode} />
                    <FormInput name="mobile" label="Mobile Phone" placeholder="+61..." disabled={isStaffMode} />
                    <div className="md:col-span-2">
                      <FormInput name="email" label="Official Email Address" placeholder="email@example.com" disabled={isStaffMode} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Section 2: Basis for Credit */}
              <Card className="border-primary/10 shadow-md">
                <CardHeader className="bg-primary/5 border-b border-primary/10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold text-sm shadow-sm">2</span>
                      Basis for Credit / RPL
                    </CardTitle>
                    {basisFields.length < 2 && !isStaffMode && (
                      <Button type="button" variant="outline" size="sm" onClick={() => appendBasis({ institution: "", country: "", courseCode: "", courseName: "" })} className="rounded-full bg-background">
                        <Plus className="h-4 w-4 mr-1" /> Add Institution
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-6 space-y-4">
                  {basisFields.map((field, index) => (
                    <div key={field.id} className="p-6 rounded-xl border bg-card/50 relative group hover:border-primary/50 transition-colors">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput name={`basisForCredit.${index}.institution`} label="Institution Name" placeholder="University / College" disabled={isStaffMode} />
                        <FormInput name={`basisForCredit.${index}.country`} label="Country of Study" placeholder="Australia, etc." disabled={isStaffMode} />
                        <FormInput name={`basisForCredit.${index}.courseCode`} label="Previous Course Code" placeholder="e.g. BSB50420" disabled={isStaffMode} />
                        <FormInput name={`basisForCredit.${index}.courseName`} label="Previous Course Name" placeholder="e.g. Diploma of Leadership" disabled={isStaffMode} />
                      </div>
                      {index > 0 && !isStaffMode && (
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="icon" 
                          onClick={() => removeBasis(index)} 
                          className="absolute -top-2 -right-2 h-7 w-7 rounded-full shadow-md"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Section 3: Course Equivalence */}
              <Card className="border-primary/10 shadow-md">
                <CardHeader className="bg-primary/5 border-b border-primary/10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold text-sm shadow-sm">3</span>
                      Course Equivalence Mapping
                    </CardTitle>
                    {equivalenceFields.length < 7 && !isStaffMode && (
                      <Button type="button" variant="outline" size="sm" onClick={() => appendEquivalence({ unitCodeAndName: "", ciheEquivalent: "" })} className="rounded-full bg-background">
                        <Plus className="h-4 w-4 mr-1" /> Add Mapping
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-12 bg-muted/30 p-3 border-b text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-6">
                    <div className="col-span-4 px-2">Previous Unit Details</div>
                    <div className="col-span-5 px-2">Churchill Equivalent Unit</div>
                    <div className="col-span-3 px-2 text-center">Approved (Y/N)</div>
                  </div>
                  <div className="divide-y px-6">
                    {equivalenceFields.map((field, index) => (
                      <div key={field.id} className="grid grid-cols-12 gap-4 py-4 items-start group">
                        <div className="col-span-4">
                          <FormInput name={`courseEquivalences.${index}.unitCodeAndName`} label="" placeholder="Code & Title" disabled={isStaffMode} />
                        </div>
                        <div className="col-span-5">
                          <FormInput name={`courseEquivalences.${index}.ciheEquivalent`} label="" placeholder="CIHE Unit Title" disabled={isStaffMode} />
                        </div>
                        <div className="col-span-3 flex items-center justify-center gap-2 pt-2">
                          {isStaffMode ? (
                            <FormRadio
                              name={`courseEquivalences.${index}.approved`}
                              label=""
                              options={[
                                { label: "Yes", value: "Yes" },
                                { label: "No", value: "No" },
                              ]}
                            />
                          ) : (
                            <div className="text-[10px] text-muted-foreground italic">Office Use</div>
                          )}
                          {!isStaffMode && index > 0 && (
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeEquivalence(index)} className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                              <Trash className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Signature Section */}
              <Card className="border-primary/10 shadow-md">
                <CardHeader className="bg-primary/5 border-b border-primary/10">
                  <CardTitle className="text-lg flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold text-sm shadow-sm">4</span>
                    Declaration & Digital Signature
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-6 space-y-6">
                  <div className="text-xs text-muted-foreground leading-relaxed italic bg-primary/5 p-4 rounded-lg border border-primary/10">
                    I declare that the information provided in this application is true and correct. I authorize Churchill Institute of Higher Education to verify any information provided in this application.
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1 space-y-2 min-w-0">
                      <Label className="text-xs font-bold uppercase tracking-wide">Student Signature</Label>
                      <Controller
                        control={control}
                        name="studentSignatureSvg"
                        render={({ field: { value } }) => (
                          <div className="relative">
                            {value ? (
                              <div className="border-2 border-primary/30 rounded-xl p-4 bg-white shadow-inner flex justify-center items-center h-32 group">
                                <img src={`data:image/svg+xml;base64,${btoa(value)}`} className="h-full object-contain" alt="Signature" />
                                <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl backdrop-blur-[2px]">
                                  {!isStaffMode && (
                                    <Button type="button" variant="secondary" size="sm" onClick={() => setSignatureModalOpen(true)} className="font-bold shadow-xl">
                                      <PenTool className="h-4 w-4 mr-2" /> Redraw Signature
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <Button 
                                type="button" 
                                variant="outline" 
                                className="w-full h-32 border-2 border-dashed border-primary/30 rounded-xl hover:border-primary hover:bg-primary/5 transition-all group" 
                                onClick={() => setSignatureModalOpen(true)}
                              >
                                <div className="flex flex-col items-center gap-2">
                                  <PenTool className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                                  <span className="text-sm font-bold text-primary">Click here to sign</span>
                                  <span className="text-[10px] text-muted-foreground">Legally binding digital signature</span>
                                </div>
                              </Button>
                            )}
                          </div>
                        )}
                      />
                    </div>
                    <div className="flex flex-col justify-end w-full md:w-56 shrink-0">
                      <FormInput name="signatureDate" label="Signature Date" type="date" disabled={isStaffMode} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Section 5: Office Use Only (Staff Mode) */}
              {isStaffMode && (
                <Card className="border-amber-500/20 shadow-md bg-amber-50/30">
                  <CardHeader className="bg-amber-500/10 border-b border-amber-500/20">
                    <CardTitle className="text-lg flex items-center gap-3 text-amber-900">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-600 text-white font-bold text-sm shadow-sm">5</span>
                      Office Use Only — Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormInput name="staffName" label="Credits Assessed By" placeholder="Staff Full Name" />
                      <FormInput name="staffDate" label="Application Received On / Signature Date" type="date" />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wide text-amber-900">Staff Signature</Label>
                      <Controller
                        control={control}
                        name="staffSignatureSvg"
                        render={({ field: { value } }) => (
                          <div className="relative">
                            {value ? (
                              <div className="border-2 border-amber-500/30 rounded-xl p-4 bg-white shadow-inner flex justify-center items-center h-32 group">
                                <img src={`data:image/svg+xml;base64,${btoa(value)}`} className="h-full object-contain" alt="Staff Signature" />
                                <div className="absolute inset-0 bg-amber-500/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl backdrop-blur-[2px]">
                                  <Button type="button" variant="secondary" size="sm" onClick={() => setStaffSignatureModalOpen(true)} className="font-bold shadow-xl">
                                    <PenTool className="h-4 w-4 mr-2" /> Redraw Signature
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full h-32 border-2 border-dashed border-amber-500/30 rounded-xl hover:border-amber-600 hover:bg-amber-50 transition-all group"
                                onClick={() => setStaffSignatureModalOpen(true)}
                              >
                                <div className="flex flex-col items-center gap-2">
                                  <PenTool className="h-6 w-6 text-amber-600 group-hover:scale-110 transition-transform" />
                                  <span className="text-sm font-bold text-amber-700">Click here to sign</span>
                                  <span className="text-[10px] text-muted-foreground">Staff assessment signature</span>
                                </div>
                              </Button>
                            )}
                          </div>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Form Footer Actions */}
              <div className={cn(
                "flex items-center justify-center gap-4 pt-8 border-t bg-card/50 p-6 rounded-b-xl -mx-8 -mb-8",
                isStaffMode ? "flex-col" : "flex-col sm:flex-row"
              )}>
                <Button 
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    handleGeneratePreview();
                    setPreviewDialogOpen(true);
                  }}
                  className={cn(
                    "h-12 flex items-center justify-center gap-2 font-semibold",
                    isStaffMode ? "w-full sm:w-64" : "w-full sm:w-auto min-w-[160px]"
                  )}
                >
                  {isPreviewLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                  View Form
                </Button>

                {isStaffMode && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="lg"
                    disabled={updateApplication.isPending}
                    onClick={handleReject}
                    className="w-full sm:w-64 h-12 flex items-center justify-center gap-2 font-bold"
                  >
                    <X className="h-5 w-5" />
                    Reject Application
                  </Button>
                )}

                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={uploadMutation.isPending || updateApplication.isPending}
                  className={cn(
                    "h-12 text-base font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2",
                    isStaffMode ? "w-full sm:w-64" : "w-full sm:w-auto min-w-[200px]"
                  )}
                >
                  {uploadMutation.isPending || updateApplication.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    ""
                  )}
                  {isStaffMode ? "Approve & Finalize" : "Submit Application"}
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-5xl h-[90vh] p-0 overflow-auto flex flex-col border-none">
          <DialogHeader className="p-4 border-b bg-card shrink-0">
            <VisuallyHidden>
              <DialogTitle>Advanced Standing Form Preview</DialogTitle>
            </VisuallyHidden>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Advanced Standing Form Preview
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleGeneratePreview}
                  disabled={isPreviewLoading}
                >
                  {isPreviewLoading ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <RefreshCw className="h-3 w-3 mr-2" />}
                  Refresh
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 bg-muted/20 relative overflow-hidden">
            {pdfUrl ? (
              <iframe 
                src={pdfUrl + "#toolbar=0&navpanes=0&view=FitH"} 
                className="w-full h-full border-none"
                title="PDF Preview"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                  <FileText className="h-10 w-10 opacity-20" />
                </div>
                <h4 className="font-bold text-foreground mb-2">Generating Preview</h4>
                <p className="text-xs">Your document is being prepared with the latest information...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <SignatureModal
        open={signatureModalOpen}
        onOpenChange={setSignatureModalOpen}
        onConfirm={(svg) => {
          setValue("studentSignatureSvg", svg, { shouldValidate: true });
          setSignatureModalOpen(false);
          setTimeout(handleGeneratePreview, 100);
        }}
      />

      {/* Staff Signature Modal */}
      <SignatureModal
        open={staffSignatureModalOpen}
        onOpenChange={setStaffSignatureModalOpen}
        onConfirm={(svg) => {
          setValue("staffSignatureSvg", svg, { shouldValidate: true });
          setStaffSignatureModalOpen(false);
          setTimeout(handleGeneratePreview, 100);
        }}
      />
    </div>
  );
}
