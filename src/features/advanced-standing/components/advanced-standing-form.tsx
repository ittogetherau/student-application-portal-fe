"use client";

import React, { useState, useEffect } from "react";
import { useFieldArray, useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Plus, Trash, FileText, Loader2, PenTool, RefreshCw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FormInput } from "@/components/forms/form-input";
import { FormRadio } from "@/components/forms/form-radio";
import { useUploadDocument, useDocumentTypesQuery } from "@/shared/hooks/document.hook";
import { useApplicationGetQuery } from "@/shared/hooks/use-applications";
import SignatureModal from "@/features/gs/components/signature-modal";

import {
  advancedStandingSchema,
  AdvancedStandingFormValues,
} from "../utils/advanced-standing.validation";
import { generateAdvancedStandingPdf } from "../utils/advanced-standing-pdf.util";

type AdvancedStandingFormProps = {
  applicationId: string;
  onSuccess?: () => void;
};

export default function AdvancedStandingForm({
  applicationId,
  onSuccess,
}: AdvancedStandingFormProps) {
  const { data: appData, isLoading: isLoadingApp } =
    useApplicationGetQuery(applicationId);
  
  const { data: docTypesResponse } = useDocumentTypesQuery();
  const uploadMutation = useUploadDocument();
  
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const methods = useForm<AdvancedStandingFormValues>({
    resolver: zodResolver(advancedStandingSchema),
    defaultValues: {
      studentType: "Future Student",
      studentIdAndName: "",
      dateOfBirth: "",
      mobile: "",
      email: "",
      courseName: "",
      basisForCredit: [{ institution: "", country: "", courseCode: "", courseName: "" }],
      courseEquivalences: [{ unitCodeAndName: "", ciheEquivalent: "" }],
      studentSignatureSvg: "",
      signatureDate: new Date().toISOString().split("T")[0],
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
        studentIdAndName: `${appData.data.tracking_code || ""} ${personal?.given_name || ""} ${personal?.family_name || ""}`.trim(),
        dateOfBirth: personal?.date_of_birth || "",
        mobile: personal?.phone || "",
        email: personal?.email || "",
        courseName: enrollment?.course_name || "",
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
      const loadingToast = toast.loading("Generating PDF...");
      
      // Generate the PDF file (leaves staff boxes editable!)
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

      // Upload it to the backend as a new document
      uploadMutation.mutate(
        {
          application_id: applicationId,
          document_type_id: otherType.id,
          file: pdfFile,
          document_name: "Advanced Standing Form",
        },
        {
          onSuccess: () => {
            toast.success("Advanced Standing form submitted successfully!", { id: loadingToast });
            onSuccess?.();
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
        <div className="flex items-center gap-3">
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={handleGeneratePreview}
            disabled={isPreviewLoading}
            className="text-muted-foreground hover:text-primary"
          >
            {isPreviewLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh Preview
          </Button>
          <Button 
            type="button" 
            form="advanced-standing-form"
            disabled={uploadMutation.isPending}
            className="font-bold px-8 shadow-lg shadow-primary/20"
          >
            {uploadMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Submit Application"}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Form Scroll Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-muted/5">
          <div className="max-w-3xl mx-auto space-y-12 pb-20">
            <FormProvider {...methods}>
              <form id="advanced-standing-form" onSubmit={handleSubmit(onSubmit)} className="space-y-12">
                
                {/* Section 1: Student Details */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold text-sm">1</span>
                    <h3 className="text-lg font-bold">Student Identification</h3>
                  </div>
                  
                  <div className="bg-card p-6 rounded-xl border shadow-sm space-y-6">
                    <FormRadio
                      name="studentType"
                      label="Application Category"
                      options={[
                        { label: "Future Student", value: "Future Student" },
                        { label: "Currently Enrolled Student", value: "Currently Enrolled Student" },
                      ]}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormInput name="studentIdAndName" label="Student ID & Full Name" placeholder="Enter ID and Name" />
                      <FormInput name="courseName" label="Churchill Course Name" placeholder="Target Course" />
                      <FormInput name="dateOfBirth" label="Date of Birth" type="date" />
                      <FormInput name="mobile" label="Mobile Phone" placeholder="+61..." />
                      <div className="md:col-span-2">
                        <FormInput name="email" label="Official Email Address" placeholder="email@example.com" />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Section 2: Basis for Credit */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold text-sm">2</span>
                      <h3 className="text-lg font-bold">Basis for Credit / RPL</h3>
                    </div>
                    {basisFields.length < 2 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => appendBasis({ institution: "", country: "", courseCode: "", courseName: "" })} className="rounded-full">
                        <Plus className="h-4 w-4 mr-1" /> Add Institution
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {basisFields.map((field, index) => (
                      <div key={field.id} className="bg-card p-6 rounded-xl border shadow-sm relative group hover:border-primary/50 transition-colors">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormInput name={`basisForCredit.${index}.institution`} label="Institution Name" placeholder="University / College" />
                          <FormInput name={`basisForCredit.${index}.country`} label="Country of Study" placeholder="Australia, etc." />
                          <FormInput name={`basisForCredit.${index}.courseCode`} label="Previous Course Code" placeholder="e.g. BSB50420" />
                          <FormInput name={`basisForCredit.${index}.courseName`} label="Previous Course Name" placeholder="e.g. Diploma of Leadership" />
                        </div>
                        {index > 0 && (
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
                  </div>
                </div>

                <Separator />

                {/* Section 3: Course Equivalence */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold text-sm">3</span>
                      <h3 className="text-lg font-bold">Course Equivalence Mapping</h3>
                    </div>
                    {equivalenceFields.length < 7 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => appendEquivalence({ unitCodeAndName: "", ciheEquivalent: "" })} className="rounded-full">
                        <Plus className="h-4 w-4 mr-1" /> Add Mapping
                      </Button>
                    )}
                  </div>

                  <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                    <div className="grid grid-cols-12 bg-muted/50 p-3 border-b text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      <div className="col-span-5 px-2">Previous Unit Details</div>
                      <div className="col-span-6 px-2">Churchill Equivalent Unit</div>
                      <div className="col-span-1"></div>
                    </div>
                    <div className="divide-y">
                      {equivalenceFields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-12 gap-4 p-4 items-start group hover:bg-muted/30 transition-colors">
                          <div className="col-span-5">
                            <FormInput name={`courseEquivalences.${index}.unitCodeAndName`} label="" placeholder="Code & Title" />
                          </div>
                          <div className="col-span-6">
                            <FormInput name={`courseEquivalences.${index}.ciheEquivalent`} label="" placeholder="CIHE Unit Title" />
                          </div>
                          <div className="col-span-1 pt-2">
                            {index > 0 && (
                              <Button type="button" variant="ghost" size="icon" onClick={() => removeEquivalence(index)} className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Signature Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold text-sm">4</span>
                    <h3 className="text-lg font-bold">Declaration & Digital Signature</h3>
                  </div>

                  <div className="bg-primary/5 p-6 rounded-xl border border-primary/20 space-y-6">
                    <div className="text-xs text-muted-foreground leading-relaxed italic">
                      I declare that the information provided in this application is true and correct. I authorize Churchill Institute of Higher Education to verify any information provided in this application.
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="md:col-span-2 space-y-2">
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
                                    <Button type="button" variant="secondary" size="sm" onClick={() => setSignatureModalOpen(true)} className="font-bold shadow-xl">
                                      <PenTool className="h-4 w-4 mr-2" /> Redraw Signature
                                    </Button>
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
                      <div className="flex flex-col justify-end">
                        <FormInput name="signatureDate" label="Signature Date" type="date" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pt-8">
                  <Button 
                    type="submit" 
                    size="lg" 
                    disabled={uploadMutation.isPending}
                    className="w-full max-w-sm h-14 text-lg font-bold shadow-xl shadow-primary/30 hover:scale-[1.02] transition-transform"
                  >
                    {uploadMutation.isPending ? (
                      <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                    ) : (
                      <Sparkles className="mr-3 h-5 w-5" />
                    )}
                    Submit Final Application
                  </Button>
                </div>
              </form>
            </FormProvider>
          </div>
        </div>

        {/* Right Side: PDF Preview */}
        <div className="hidden lg:block w-[450px] border-l bg-muted/20 relative">
          <div className="absolute inset-0 flex flex-col">
            <div className="p-3 border-b bg-card text-[10px] font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Document Preview</span>
              {isPreviewLoading && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
            </div>
            <div className="flex-1 overflow-hidden">
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
          </div>
        </div>
      </div>

      <SignatureModal
        open={signatureModalOpen}
        onOpenChange={setSignatureModalOpen}
        onConfirm={(svg) => {
          setValue("studentSignatureSvg", svg, { shouldValidate: true });
          setSignatureModalOpen(false);
          // Refresh preview after signing
          setTimeout(handleGeneratePreview, 100);
        }}
      />
    </div>
  );
}
