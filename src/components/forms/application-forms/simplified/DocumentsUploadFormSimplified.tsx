"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { documentTypes } from "@/data/document-types.data";
import { Button } from "@/components/ui/button";
import ApplicationStepHeader from "../../../../app/dashboard/application/create/_components/application-step-header";
import { useApplicationFormContext } from "@/contexts/ApplicationFormContext";
import { Badge } from "@/components/ui/badge";

const ALLOWED_FILE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf"];
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"];

const isAllowedFileType = (file: File): boolean => {
  const fileName = file.name.toLowerCase();
  const hasAllowedExtension = ALLOWED_FILE_EXTENSIONS.some((ext) =>
    fileName.endsWith(ext)
  );
  const hasAllowedMime =
    !file.type || ALLOWED_MIME_TYPES.includes(file.type.toLowerCase());
  return hasAllowedExtension && hasAllowedMime;
};

/**
 * Simplified Documents Upload Form
 * Uses FileUploadField component for each document type
 */
export default function DocumentsUploadFormSimplified() {
  const { applicationId, markStepCompleted, goToNext } =
    useApplicationFormContext();
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, boolean>>({});

  const sortedDocumentTypes = [...documentTypes].sort(
    (a, b) => a.display_order - b.display_order
  );

  const mandatoryDocs = sortedDocumentTypes.filter((doc) => doc.is_mandatory);
  const allMandatoryUploaded = mandatoryDocs.every(
    (doc) => uploadedDocs[doc.id]
  );

  const handleUploadComplete = (documentTypeId: string) => {
    setUploadedDocs((prev) => ({
      ...prev,
      [documentTypeId]: true,
    }));
  };

  const handleContinue = () => {
    if (allMandatoryUploaded) {
      markStepCompleted(1);
      goToNext();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Upload Required Documents</h3>
        <p className="text-sm text-muted-foreground">
          Please upload all mandatory documents to continue
        </p>
      </div>

      <div className="space-y-4">
        {sortedDocumentTypes.map((docType) => (
          <div key={docType.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm">
                {docType.name}
                {docType.is_mandatory && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </h4>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Upload your {docType.name.toLowerCase()} document
            </p>
            {/* Placeholder for file upload - integrate with document.hook.ts */}
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  const files = Array.from(e.target.files);
                  const invalidFiles = files.filter((f) => !isAllowedFileType(f));
                  if (invalidFiles.length > 0) {
                    toast.error("Invalid file type. Only PDF, JPG, and PNG files are allowed.");
                    e.target.value = "";
                    return;
                  }
                  handleUploadComplete(docType.id);
                }
              }}
              className="text-sm"
            />
          </div>
        ))}
      </div>

      <ApplicationStepHeader className="mt-6">
        <div className="flex items-center gap-4">
          {!allMandatoryUploaded && (
            <Badge variant="outline" className="text-orange-600">
              {mandatoryDocs.length - Object.keys(uploadedDocs).length}{" "}
              mandatory documents remaining
            </Badge>
          )}
          <Button
            onClick={handleContinue}
            disabled={!allMandatoryUploaded || !applicationId}
          >
            Continue
          </Button>
        </div>
      </ApplicationStepHeader>
    </div>
  );
}
