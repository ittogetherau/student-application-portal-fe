"use client";

import { useRef } from "react";
import { useFormContext } from "react-hook-form";
import { Upload } from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";

const ACCEPT = ".pdf,.jpg,.jpeg,.png";
const MAX_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXT = [".pdf", ".jpg", ".jpeg", ".png"];
const ALLOWED_MIME = ["application/pdf", "image/jpeg", "image/png"];

function isAllowed(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    ALLOWED_EXT.some((ext) => name.endsWith(ext)) &&
    (!file.type || ALLOWED_MIME.includes(file.type))
  );
}

export interface DeclarationDocumentUploadProps {
  /** Form field name (e.g. "currentVisaDocument") */
  name: string;
  /** Label above the upload area */
  label: string;
  /** Optional short hint below the label */
  description?: string;
  /** Current file (controlled by parent) */
  file: File | null;
  /** Called when user selects or clears a file */
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
}

/**
 * Reusable document upload for GS declaration forms.
 * Same look as documents-tab: dashed border, drop/click, PDF/JPG/PNG, 10MB.
 * Integrates with react-hook-form via name; sends the actual File on submit (parent adds to FormData).
 */
export function DeclarationDocumentUpload({
  name,
  label,
  description,
  file,
  onFileChange,
  disabled = false,
}: DeclarationDocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { setValue, watch } = useFormContext();
  const formValue = watch(name) as string | undefined;
  const hasFile = !!file || !!(formValue && String(formValue).trim());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.files?.[0];
    if (!next) {
      onFileChange(null);
      setValue(name, "", { shouldValidate: true });
      return;
    }
    if (!isAllowed(next)) {
      toast.error("Invalid file type. Only PDF, JPG, and PNG are allowed.");
      e.target.value = "";
      return;
    }
    if (next.size > MAX_BYTES) {
      toast.error("File is too large. Max 10MB.");
      e.target.value = "";
      return;
    }
    onFileChange(next);
    setValue(name, next.name, { shouldValidate: true });
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4">
        <input
          ref={inputRef}
          id={`decl-doc-upload-${name}`}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={handleChange}
          disabled={disabled}
        />
        <label
          htmlFor={`decl-doc-upload-${name}`}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background px-4 py-6 text-center text-xs text-muted-foreground transition hover:border-primary/60 hover:text-foreground ${
            disabled ? "pointer-events-none opacity-50" : ""
          }`}
        >
          <Upload className="h-6 w-6" />
          <span className="text-sm font-medium text-foreground">
            {hasFile
              ? file
                ? `Replace file (${file.name})`
                : "Replace file"
              : "Drop file here or click to upload"}
          </span>
          <span>Accepted: PDF, JPG, PNG. Max 10MB.</span>
        </label>
      </div>
    </div>
  );
}
