import { PDFDocument, PDFTextField, rgb, StandardFonts } from "pdf-lib";

import { generateAdvancedStandingTemplatePdf } from "../components/advanced-standing-template";
import { SIGNATURE_ANCHOR_FIELDS } from "./advanced-standing-fields";
import { AdvancedStandingFormValues } from "./advanced-standing.validation";

/**
 * Converts an SVG string to a PNG data URL using a hidden canvas.
 */
async function svgToPng(svgString: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    // Set dimensions for signature - adjust as needed for the PDF space
    canvas.width = 400;
    canvas.height = 150;

    img.onload = () => {
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/png"));
      } else {
        reject(new Error("Could not get canvas context"));
      }
    };

    img.onerror = (err) => reject(err);

    const svgDataUrl = `data:image/svg+xml;base64,${btoa(svgString)}`;
    img.src = svgDataUrl;
  });
}

/**
 * Takes the React Hook Form data, generates the blank template with
 * @react-pdf/renderer, fills in the AcroForm fields with pdf-lib, and returns
 * a File object ready to be uploaded.
 *
 * Pass `flatten: false` to keep the form fields live (editable in PDF readers
 * and re-loadable by pdf-lib after upload).
 */
export async function generateAdvancedStandingPdf(
  data: AdvancedStandingFormValues,
  applicationId: string,
  options?: { flatten?: boolean }
): Promise<File> {
  // 1. Generate the blank template (memoized per session)
  const templateBytes = await generateAdvancedStandingTemplatePdf();

  // 2. Load it into pdf-lib
  const pdfDoc = await PDFDocument.load(templateBytes);
  const form = pdfDoc.getForm();

  // 3. Helper to safely fill text fields
  const fillField = (fieldName: string, value?: string) => {
    try {
      form.getTextField(fieldName).setText(value ?? "");
    } catch {
      // Field not present in the template — ignore.
    }
  };

  /**
   * Draws a rasterized signature SVG into the widget rectangle of its named
   * read-only anchor field, on whichever page holds the widget.
   */
  const drawSignature = async (fieldName: string, signatureSvg: string) => {
    try {
      const pngDataUrl = await svgToPng(signatureSvg);
      const pngImage = await pdfDoc.embedPng(pngDataUrl);

      const widget = form.getTextField(fieldName).acroField.getWidgets()[0];
      if (!widget) return;
      const rect = widget.getRectangle();
      const pageRef = widget.P();
      const page =
        pdfDoc.getPages().find((p) => p.ref === pageRef) ??
        pdfDoc.getPages()[pdfDoc.getPageCount() - 1];

      const inset = 2;
      page.drawImage(pngImage, {
        x: rect.x + inset,
        y: rect.y + inset,
        width: rect.width - inset * 2,
        height: rect.height - inset * 2,
      });
    } catch (error) {
      console.error(`Failed to render signature onto PDF (${fieldName}):`, error);
    }
  };

  // --- SECTION 1: Student Details ---
  // Churchill Student ID intentionally left blank; only the name is written.
  fillField("Student Name", data.studentName);
  fillField("Date of Birth", data.dateOfBirth);
  fillField("Mobile", data.mobile);
  fillField("Email Address", data.email);
  fillField("Churchill Course Name", data.courseName);

  // studentType — real checkboxes in the generated template
  try {
    const checkbox = form.getCheckBox(data.studentType);
    checkbox.check();
  } catch {
    // Checkbox not present — ignore.
  }

  // --- SECTION 2: Basis for Credit ---
  data.basisForCredit.forEach((item, index) => {
    const rowNum = index + 1; // Row1, Row2
    fillField(`Name of InstitutionRow${rowNum}`, item.institution);
    fillField(`CountryRow${rowNum}`, item.country);
    fillField(`Course CodeRow${rowNum}`, item.courseCode);
    fillField(`Course NameRow${rowNum}`, item.courseName);
  });

  // --- SECTION 3: Course Equivalence ---
  data.courseEquivalences.forEach((item, index) => {
    const rowNum = index + 1; // Row1 to Row7
    fillField(`Unit code and nameRow${rowNum}`, item.unitCodeAndName);
    fillField(`CIHE equivalent unit code and nameRow${rowNum}`, item.ciheEquivalent);

    const approved = item.approved || data.staffAssessments?.[index]?.approved || "";
    fillField(`Approved YNRow${rowNum}`, approved);
  });

  // --- SIGNATURE & DATE ---
  fillField("Student Signature Date", data.signatureDate);
  if (data.studentSignatureSvg) {
    await drawSignature(SIGNATURE_ANCHOR_FIELDS.student, data.studentSignatureSvg);
  }

  // --- OFFICE USE ONLY: Staff Assessment Fields ---
  if (data.staffDate) {
    fillField("Application received on", data.staffDate);
    fillField("Date", data.staffDate);
  }
  if (data.staffName) {
    fillField("Credits Assessed By", data.staffName);
  }
  if (data.staffSignatureSvg) {
    await drawSignature(SIGNATURE_ANCHOR_FIELDS.staff, data.staffSignatureSvg);
  }

  // Update all fields to use the standard font and force font size 11
  // to avoid auto-sizing which makes the text too big.
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  form.getFields().forEach((field) => {
    if (field instanceof PDFTextField) {
      // pdfkit-produced fields carry no /DA entry, which makes setFontSize
      // throw — seed a default appearance (Helvetica, black) first.
      if (!field.acroField.getDefaultAppearance()) {
        field.acroField.setDefaultAppearance("/Helv 0 Tf 0 g");
      }
      field.setFontSize(11);
      (
        field as { setTextColor?: (color: ReturnType<typeof rgb>) => void }
      ).setTextColor?.(rgb(0, 0, 0));
    }
  });

  form.updateFieldAppearances(helveticaFont);
  if (options?.flatten ?? true) {
    form.flatten();
  }

  // 4. Serialize the PDF Document to bytes
  const pdfBytes = await pdfDoc.save();

  // 5. Create a standard JavaScript File object
  const fileName = `Advanced_Standing_Form_${data.studentName.replace(/[^a-z0-9]/gi, "_")}.pdf`;
  return new File([pdfBytes.buffer as ArrayBuffer], fileName, {
    type: "application/pdf",
  });
}
