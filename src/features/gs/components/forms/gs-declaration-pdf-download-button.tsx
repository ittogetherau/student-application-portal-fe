"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";
import { Download } from "lucide-react";
import { useCallback, useState, type ComponentProps } from "react";
import { toast } from "react-hot-toast";
import type { GSScreeningFormValues } from "../../utils/gs-screening.validation";
import {
  generateGsDeclarationPdfBlob,
  getGsDeclarationPdfFilename,
} from "./gs-declaration-pdf";

type ButtonVariantProps = VariantProps<typeof buttonVariants>;
type ButtonLikeProps = ComponentProps<"button"> &
  ButtonVariantProps & { asChild?: boolean };

export function GSDeclarationPdfDownloadButton({
  data,
  applicationId,
  buttonText = "Download PDF",
  ...buttonProps
}: {
  data: GSScreeningFormValues | null | undefined;
  applicationId?: string;
  buttonText?: string;
} & Omit<ButtonLikeProps, "type" | "onClick" | "disabled" | "children">) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!data) {
      toast.error("No declaration data to export");
      return;
    }

    try {
      setIsDownloading(true);

      const blob = await generateGsDeclarationPdfBlob({ data });

      const url = URL.createObjectURL(blob);
      const anchor = window.document.createElement("a");
      anchor.href = url;
      anchor.download = getGsDeclarationPdfFilename(applicationId);
      window.document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsDownloading(false);
    }
  }, [applicationId, data]);

  return (
    <Button
      type="button"
      onClick={handleDownload}
      disabled={isDownloading || !data}
      {...buttonProps}
    >
      <Download />
      {isDownloading ? "Generating PDF..." : buttonText}
    </Button>
  );
}
