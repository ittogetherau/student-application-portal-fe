"use client";

import documentService, { type OcrResult } from "@/service/document.service";
import {
  MAX_FILE_SIZE_BYTES,
  isAllowedFileType,
} from "@/shared/lib/document-file-helpers";
import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";

type UploadDocumentParams = {
  application_id: string;
  document_type_id: string;
  file: File;
  process_ocr?: boolean;
};

type UploadDocumentMutationLike = {
  mutateAsync: (params: UploadDocumentParams) => Promise<unknown>;
};

export type OcrProcessResult<TSummary extends Record<string, unknown>> = {
  isComplete: boolean;
  summary?: TSummary;
  fieldsPopulated?: number;
};

type UseOcrAutofillUploadOptions<TSummary extends Record<string, unknown>> = {
  applicationId?: string;
  documentTypeId?: string;
  uploadDocument: UploadDocumentMutationLike;
  onProcessOcrData: (ocrData: OcrResult) => OcrProcessResult<TSummary>;
  startSuccessMessage: string;
  extractedWithFieldsMessage: (count: number) => string;
  extractedWithoutFieldsMessage: string;
  uploadFailureMessage: string;
  extractionFailureMessage: string;
  processingTimeoutMessage: string;
  appNotReadyMessage?: string;
  pollIntervalMs?: number;
  maxAttempts?: number;
};

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

export const useOcrAutofillUpload = <
  TSummary extends Record<string, unknown> = Record<string, unknown>,
>({
  applicationId,
  documentTypeId,
  uploadDocument,
  onProcessOcrData,
  startSuccessMessage,
  extractedWithFieldsMessage,
  extractedWithoutFieldsMessage,
  uploadFailureMessage,
  extractionFailureMessage,
  processingTimeoutMessage,
  appNotReadyMessage = "Application not ready for upload",
  pollIntervalMs = 2000,
  maxAttempts = 15,
}: UseOcrAutofillUploadOptions<TSummary>) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [extractedSummary, setExtractedSummary] = useState<TSummary | null>(
    null,
  );

  const handleRemoveFile = useCallback(() => {
    setUploadedFile(null);
    setUploadSuccess(false);
    setExtractedSummary(null);
  }, []);

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!applicationId || !documentTypeId) {
        toast.error(appNotReadyMessage);
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
          document_type_id: documentTypeId,
          file,
          process_ocr: true,
        });

        toast.success(startSuccessMessage);

        let sawOcrPayload = false;

        for (let attempts = 1; attempts <= maxAttempts; attempts++) {
          await delay(pollIntervalMs);

          try {
            const ocrResponse =
              await documentService.getOcrResults(applicationId);

            if (ocrResponse.success && ocrResponse.data) {
              sawOcrPayload = true;
              const result = onProcessOcrData(ocrResponse.data);

              if (result.isComplete) {
                setExtractedSummary(result.summary ?? null);
                setUploadSuccess(true);
                setIsUploading(false);

                if ((result.fieldsPopulated ?? 0) > 0) {
                  toast.success(
                    extractedWithFieldsMessage(result.fieldsPopulated ?? 0),
                  );
                } else {
                  toast.success(extractedWithoutFieldsMessage);
                }
                return;
              }
            }
          } catch {
            // keep polling until max attempts
          }
        }

        setUploadSuccess(false);
        setIsUploading(false);
        toast.error(
          sawOcrPayload ? processingTimeoutMessage : extractionFailureMessage,
        );
      } catch {
        setUploadedFile(null);
        setIsUploading(false);
        toast.error(uploadFailureMessage);
      }
    },
    [
      appNotReadyMessage,
      applicationId,
      documentTypeId,
      extractedWithFieldsMessage,
      extractedWithoutFieldsMessage,
      extractionFailureMessage,
      maxAttempts,
      onProcessOcrData,
      pollIntervalMs,
      processingTimeoutMessage,
      startSuccessMessage,
      uploadDocument,
      uploadFailureMessage,
    ],
  );

  return {
    uploadedFile,
    isUploading,
    uploadSuccess,
    extractedSummary,
    handleFileUpload,
    handleRemoveFile,
  };
};

