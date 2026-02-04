"use client";

import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type ThreadAttachmentInputProps = {
  attachments: File[];
  onChange: (next: File[]) => void;
  disabled?: boolean;
};

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "tiff",
  "tif",
  "bmp",
  "gif",
]);
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/tiff",
  "image/x-tiff",
  "image/bmp",
  "image/gif",
]);

const ThreadAttachmentInput = ({
  attachments,
  onChange,
  disabled,
}: ThreadAttachmentInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const urls = attachments.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [attachments]);

  const isAllowedImage = (file: File) => {
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    return (
      ALLOWED_EXTENSIONS.has(extension) ||
      ALLOWED_MIME_TYPES.has(file.type.toLowerCase())
    );
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const validImages = Array.from(files).filter((file) => {
      const isValid = isAllowedImage(file) && file.size <= MAX_FILE_SIZE_BYTES;
      return isValid;
    });

    if (validImages.length !== files.length) {
      toast.error(
        "Only JPG, JPEG, PNG, TIFF, TIF, BMP, or GIF images up to 2MB each are allowed."
      );
    }

    if (validImages.length === 0) return;
    onChange([...attachments, ...validImages]);
  };

  const handleRemove = (index: number) => {
    const next = attachments.filter((_, idx) => idx !== index);
    onChange(next);
  };

  const attachmentCountLabel =
    attachments.length === 0
      ? "Add image"
      : attachments.length === 1
      ? "1 image added"
      : `${attachments.length} images added`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }}
        disabled={disabled}
      />

      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        aria-label="Add image attachment"
      >
        <Plus className="h-4 w-4" />
      </Button>

      <p className="text-[11px] text-muted-foreground">
        {attachmentCountLabel}
      </p>

      {previews.map((src, index) => (
        <div
          key={`${src}-${index}`}
          className="relative h-12 w-12 overflow-hidden rounded-md border"
        >
          <Image
            width={50}
            height={50}
            quality={50}
            src={src}
            alt={attachments[index]?.name || `Attachment ${index + 1}`}
            className="h-full w-full object-cover"
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background shadow"
            onClick={() => handleRemove(index)}
            disabled={disabled}
            aria-label="Remove attachment"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  );
};

export default ThreadAttachmentInput;
