import { PDFDocument, rgb, StandardFonts, PDFTextField } from "pdf-lib";
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
        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/png"));
      } else {
        reject(new Error("Could not get canvas context"));
      }
    };

    img.onerror = (err) => reject(err);

    // Convert SVG string to data URL
    const svgDataUrl = `data:image/svg+xml;base64,${btoa(svgString)}`;
    img.src = svgDataUrl;
  });
}

/**
 * Takes the React Hook Form data, loads the blank PDF template,
 * fills in the fields, and returns a File object ready to be uploaded.
 */
export async function generateAdvancedStandingPdf(
  data: AdvancedStandingFormValues,
  applicationId: string,
  options?: { flatten?: boolean }
): Promise<File> {
  // 1. Fetch the blank PDF template from the public folder
  const url = "/docs/advanced_standing_form.pdf";
  const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());

  // 2. Load the PDF into pdf-lib
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const form = pdfDoc.getForm();
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  // 3. Helper to safely fill text fields
  const fillField = (fieldName: string, value?: string) => {
    try {
      const field = form.getTextField(fieldName);
      field.setText(value ?? "");
    } catch (error) {
      // console.warn(`Could not find or fill field: ${fieldName}`);
    }
  };

  // --- SECTION 1: Student Details ---
  fillField("Student Name", data.studentName);
  fillField("Date of Birth", data.dateOfBirth);
  fillField("Mobile", data.mobile);
  fillField("Email Address", data.email);
  fillField("Churchill Course Name", data.courseName);
  
  // User requested: Churchill Student ID leave blank, write only Student Name
  try {
    // Clear the field so it doesn't duplicate into the ID section
    const combinedField = form.getTextField("Churchill Student ID Student Name");
    combinedField.setText("");
    
    // Draw the name directly over the "Student Name" section of the page
    firstPage.drawText(data.studentName || "", {
      x: 365,
      y: 520,
      size: 11,
      color: rgb(0, 0, 0),
    });
  } catch (e) {
    // Fallback to separate fields if they exist
    fillField("Student Name", data.studentName);
    fillField("Churchill Student ID", "");
  }

  // Handle the "studentType" checkbox by drawing an "X" directly
  try {
    if (data.studentType === "Future Student") {
      firstPage.drawText("X", { x: 151, y: 566, size: 12, color: rgb(0, 0, 0) });
    } else if (data.studentType === "Currently Enrolled Student") {
      firstPage.drawText("X", { x: 234, y: 566, size: 12, color: rgb(0, 0, 0) });
    }
  } catch (e) { /* ignore */ }

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

    const approved =
      item.approved ||
      data.staffAssessments?.[index]?.approved ||
      "";
    try {
      const radioGroup = form.getRadioGroup(`Approved YNRow${rowNum}`);
      if (approved === "Yes") radioGroup.select("Yes");
      else if (approved === "No") radioGroup.select("No");
      else {
        try {
          radioGroup.clear();
        } catch {
          fillField(`Approved YNRow${rowNum}`, "");
        }
      }
    } catch {
      fillField(`Approved YNRow${rowNum}`, approved);
    }
  });

  // --- SIGNATURE & DATE ---
  fillField("Student Signature Date", data.signatureDate);

  // Draw the Student Signature Image
  if (data.studentSignatureSvg) {
    try {
      const pngDataUrl = await svgToPng(data.studentSignatureSvg);
      const pngImage = await pdfDoc.embedPng(pngDataUrl);
      
      const targetPage = pages.length > 1 ? pages[1] : pages[0];
      
      // Draw signature on the correct page, just left of the Date field (y=552)
      try {
        const sigField = form.getTextField("Student Signature");
        targetPage.drawImage(pngImage, {
          x: 100,
          y: 545,
          width: 150,
          height: 40,
        });
      } catch (e) {
        // Fallback drawing if field not found
        targetPage.drawImage(pngImage, {
          x: 120,
          y: 545, // Moved up to be next to the Date field
          width: 150,
          height: 40,
        });
      }
    } catch (error) {
      console.error("Failed to render signature onto PDF:", error);
    }
  }

  // --- OFFICE USE ONLY: Staff Assessment Fields ---
  if ("staffDate" in data && data.staffDate) {
    fillField("Application received on", data.staffDate as string);
    fillField("Date", data.staffDate as string);
  }
  if ("staffName" in data && data.staffName) {
    fillField("Credits Assessed By", data.staffName as string);
  }

  // Draw Staff Signature Image onto Page 2
  if (data.staffSignatureSvg) {
    try {
      const staffPngDataUrl = await svgToPng(data.staffSignatureSvg);
      const staffPngImage = await pdfDoc.embedPng(staffPngDataUrl);
      const targetPage = pages.length > 1 ? pages[1] : pages[0];

      targetPage.drawImage(staffPngImage, {
        x: 110,
        y: 435,
        width: 150,
        height: 40,
      });
    } catch (error) {
      console.error("Failed to render staff signature onto PDF:", error);
    }
  }
  
  // Update all fields to use the standard font and force font size 11
  // to avoid auto-sizing which makes the text too big.
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  form.getFields().forEach(field => {
    if (field instanceof PDFTextField) {
      field.setFontSize(11);
      (field as { setTextColor?: (color: ReturnType<typeof rgb>) => void }).setTextColor?.(rgb(0, 0, 0));
    }
  });

  form.updateFieldAppearances(helveticaFont);
  if (options?.flatten ?? true) {
    form.flatten();
  }

  // 4. Serialize the PDF Document to bytes
  const pdfBytes = await pdfDoc.save();

  // 5. Create a standard JavaScript File object
  const fileName = `Advanced_Standing_Form_${data.studentName.replace(/[^a-z0-9]/gi, '_')}.pdf`;
  return new File([pdfBytes.buffer as ArrayBuffer], fileName, { type: "application/pdf" });
}
