"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import {
  GlobalWorkerOptions,
  getDocument,
  type PDFDocumentProxy,
  type PageViewport,
} from "pdfjs-dist";
import type { AdvancedStandingFormValues } from "../utils/advanced-standing.validation";

const WORKER_SRC = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

if (GlobalWorkerOptions.workerSrc !== WORKER_SRC) {
  GlobalWorkerOptions.workerSrc = WORKER_SRC;
}

type PdfAnnotation = {
  fieldName?: string;
  fieldType?: string;
  rect?: number[];
};

type PdfPageData = {
  pageNumber: number;
  viewport: PageViewport;
  annotations: PdfAnnotation[];
};

type AdvancedStandingPdfEditorProps = {
  pdfBytes: ArrayBuffer;
  values: AdvancedStandingFormValues;
  isStaffMode: boolean;
  onFieldChange: (path: string, value: string) => void;
};

const fieldMap: Record<string, string> = {
  "Student Name": "studentName",
  "Date of Birth": "dateOfBirth",
  "Mobile": "mobile",
  "Email Address": "email",
  "Churchill Course Name": "courseName",
  "Name of InstitutionRow1": "basisForCredit.0.institution",
  "CountryRow1": "basisForCredit.0.country",
  "Course CodeRow1": "basisForCredit.0.courseCode",
  "Course NameRow1": "basisForCredit.0.courseName",
  "Name of InstitutionRow2": "basisForCredit.1.institution",
  "CountryRow2": "basisForCredit.1.country",
  "Course CodeRow2": "basisForCredit.1.courseCode",
  "Course NameRow2": "basisForCredit.1.courseName",
  "Unit code and nameRow1": "courseEquivalences.0.unitCodeAndName",
  "CIHE equivalent unit code and nameRow1": "courseEquivalences.0.ciheEquivalent",
  "Approved YNRow1": "courseEquivalences.0.approved",
  "Unit code and nameRow2": "courseEquivalences.1.unitCodeAndName",
  "CIHE equivalent unit code and nameRow2": "courseEquivalences.1.ciheEquivalent",
  "Approved YNRow2": "courseEquivalences.1.approved",
  "Unit code and nameRow3": "courseEquivalences.2.unitCodeAndName",
  "CIHE equivalent unit code and nameRow3": "courseEquivalences.2.ciheEquivalent",
  "Approved YNRow3": "courseEquivalences.2.approved",
  "Unit code and nameRow4": "courseEquivalences.3.unitCodeAndName",
  "CIHE equivalent unit code and nameRow4": "courseEquivalences.3.ciheEquivalent",
  "Approved YNRow4": "courseEquivalences.3.approved",
  "Unit code and nameRow5": "courseEquivalences.4.unitCodeAndName",
  "CIHE equivalent unit code and nameRow5": "courseEquivalences.4.ciheEquivalent",
  "Approved YNRow5": "courseEquivalences.4.approved",
  "Unit code and nameRow6": "courseEquivalences.5.unitCodeAndName",
  "CIHE equivalent unit code and nameRow6": "courseEquivalences.5.ciheEquivalent",
  "Approved YNRow6": "courseEquivalences.5.approved",
  "Unit code and nameRow7": "courseEquivalences.6.unitCodeAndName",
  "CIHE equivalent unit code and nameRow7": "courseEquivalences.6.ciheEquivalent",
  "Approved YNRow7": "courseEquivalences.6.approved",
  "Student Signature Date": "signatureDate",
  "Application received on": "staffDate",
  "Date": "staffDate",
  "Credits Assessed By": "staffName",
};

const lockedPaths = new Set([
  "studentName",
  "courseName",
  "dateOfBirth",
  "mobile",
  "email",
  "studentType",
]);

/** Staff may edit agent-/student-supplied content; identity fields stay read-only. */
const isStaffEditable = (path: string) => !lockedPaths.has(path);

const isAgentEditable = (path: string) =>
  !lockedPaths.has(path) &&
  !path.endsWith(".approved") &&
  path !== "staffName" &&
  path !== "staffDate";

const getValueByPath = (values: AdvancedStandingFormValues, path: string) => {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, values);
};

const getInputValue = (values: AdvancedStandingFormValues, path: string) => {
  const raw = getValueByPath(values, path);
  if (raw === null || raw === undefined) return "";
  return String(raw);
};

const getInputType = (path: string) => {
  if (path === "dateOfBirth" || path === "signatureDate" || path === "staffDate") {
    return "date";
  }
  return "text";
};

export default function AdvancedStandingPdfEditor({
  pdfBytes,
  values,
  isStaffMode,
  onFieldChange,
}: AdvancedStandingPdfEditorProps) {
  const [pages, setPages] = useState<PdfPageData[]>([]);
  const [isDocLoading, setIsDocLoading] = useState(false);
  const [pdfDocEpoch, setPdfDocEpoch] = useState(0);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);
  const canvasRefs = useRef(new Map<number, HTMLCanvasElement>());
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const lastWidthRef = useRef(0);

  const setCanvasRef = useCallback((pageNumber: number) => {
    return (element: HTMLCanvasElement | null) => {
      if (element) {
        canvasRefs.current.set(pageNumber, element);
      } else {
        canvasRefs.current.delete(pageNumber);
      }
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const nextWidth = Math.round(entry.contentRect.width);
        if (nextWidth > 0 && Math.abs(nextWidth - lastWidthRef.current) > 2) {
          lastWidthRef.current = nextWidth;
          setContainerWidth(nextWidth);
        }
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const loadDocument = async () => {
      setIsDocLoading(true);
      setPages([]);
      try {
        if (pdfRef.current) {
          pdfRef.current.destroy();
          pdfRef.current = null;
        }

        const dataCopy = pdfBytes.slice(0);
        const loadingTask = getDocument({ data: new Uint8Array(dataCopy) });
        const pdfDoc = await loadingTask.promise;
        if (isCancelled) {
          pdfDoc.destroy();
          return;
        }

        pdfRef.current = pdfDoc;
        setPdfDocEpoch((n) => n + 1);
      } catch (error) {
        console.error("Failed to load PDF preview", error);
        setPages([]);
      } finally {
        if (!isCancelled) {
          setIsDocLoading(false);
        }
      }
    };

    loadDocument();

    return () => {
      isCancelled = true;
      if (pdfRef.current) {
        pdfRef.current.destroy();
        pdfRef.current = null;
      }
    };
  }, [pdfBytes]);

  useEffect(() => {
    let cancelled = false;
    const pdfDoc = pdfRef.current;
    if (!pdfDoc || pdfDocEpoch === 0) return;

    const rebuildPages = async () => {
      try {
        const nextPages: PdfPageData[] = [];
        let fitScale = 1;

        if (containerWidth > 0) {
          const firstPage = await pdfDoc.getPage(1);
          const baseViewport = firstPage.getViewport({ scale: 1 });
          const padding = 32;
          fitScale = Math.min(1, (containerWidth - padding) / baseViewport.width);
        }

        for (let pageNumber = 1; pageNumber <= pdfDoc.numPages; pageNumber += 1) {
          const page = await pdfDoc.getPage(pageNumber);
          const viewport = page.getViewport({ scale: fitScale });
          const annotations = (await page.getAnnotations({
            intent: "display",
          })) as PdfAnnotation[];

          nextPages.push({ pageNumber, viewport, annotations });
        }

        if (!cancelled) {
          setPages(nextPages);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to build PDF page layout", error);
        }
      }
    };

    rebuildPages();

    return () => {
      cancelled = true;
    };
  }, [pdfDocEpoch, containerWidth]);

  useEffect(() => {
    let cancelled = false;
    const renderTasks: Array<{ cancel: () => void }> = [];

    const renderPages = async () => {
      if (!pdfRef.current) return;
      await Promise.all(
        pages.map(async (pageData) => {
          const canvas = canvasRefs.current.get(pageData.pageNumber);
          if (!canvas) return;

          const page = await pdfRef.current?.getPage(pageData.pageNumber);
          if (!page) return;

          const viewport = pageData.viewport;
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          try {
            const task = page.render({ canvasContext: ctx, viewport });
            renderTasks.push(task);
            await task.promise;
          } catch (error) {
            if (cancelled) return;
            if ((error as { name?: string }).name === "RenderingCancelledException") return;
            console.error("Failed to render PDF page", error);
          }
        })
      );
    };

    renderPages();

    return () => {
      cancelled = true;
      renderTasks.forEach((task) => task.cancel());
    };
  }, [pages]);

  const renderFields = useCallback(
    (pageData: PdfPageData) => {
      return pageData.annotations
        .filter((annotation) =>
          annotation.fieldName && fieldMap[annotation.fieldName]
        )
        .map((annotation) => {
          const fieldName = annotation.fieldName as string;
          const fieldPath = fieldMap[fieldName];
          if (!annotation.rect || !fieldPath) return null;

          const [x1, y1, x2, y2] = pageData.viewport.convertToViewportRectangle(
            annotation.rect
          );
          const left = Math.min(x1, x2);
          const top = Math.min(y1, y2);
          const width = Math.abs(x2 - x1);
          const height = Math.abs(y2 - y1);

          const value = getInputValue(values, fieldPath);
          const inputType = getInputType(fieldPath);
          const editable = isStaffMode
            ? isStaffEditable(fieldPath)
            : isAgentEditable(fieldPath);

          const commonProps = {
            className:
              "absolute border border-primary/40 rounded-[3px] bg-white/80 text-[10px] px-1 py-0.5 text-black shadow-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:text-black disabled:opacity-100",
            style: {
              left,
              top,
              width,
              height,
            },
            disabled: !editable,
            onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
              onFieldChange(fieldPath, event.target.value);
            },
            value,
          };

          if (fieldPath.endsWith(".approved")) {
            return (
              <select
                key={`${pageData.pageNumber}-${fieldName}`}
                {...commonProps}
                className={`${commonProps.className} text-[9px]`}
              >
                <option value=""></option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            );
          }

          return (
            <input
              key={`${pageData.pageNumber}-${fieldName}`}
              type={inputType}
              {...commonProps}
            />
          );
        });
    },
    [values, isStaffMode, onFieldChange]
  );

  const showBusyOverlay =
    isDocLoading || (pdfDocEpoch > 0 && pages.length === 0);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-auto [scrollbar-gutter:stable]"
    >
      {showBusyOverlay && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 text-muted-foreground">
          <div className="text-xs">Loading editable preview...</div>
        </div>
      )}
      <div className="space-y-6 p-4">
        {pages.map((page) => (
          <div
            key={page.pageNumber}
            className="relative mx-auto bg-white shadow-lg border"
            style={{
              width: page.viewport.width,
              height: page.viewport.height,
            }}
          >
            <canvas ref={setCanvasRef(page.pageNumber)} />
            <div className="absolute inset-0">
              {renderFields(page)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
