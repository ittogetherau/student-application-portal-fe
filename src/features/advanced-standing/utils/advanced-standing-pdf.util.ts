import { PDFDocument } from "pdf-lib";
import { AdvancedStandingFormValues } from "./advanced-standing.validation";

/**
 * Takes the React Hook Form data, loads the blank PDF template,
 * fills in the fields, and returns a File object ready to be uploaded.
 */
export async function generateAdvancedStandingPdf(
  data: AdvancedStandingFormValues,
  applicationId: string
): Promise<File> {
  // 1. Fetch the blank PDF template from the public folder
  const url = "/docs/advanced_standing_form.pdf";
  const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());

  // 2. Load the PDF into pdf-lib
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const form = pdfDoc.getForm();

  // 3. Helper to safely fill text fields
  const fillField = (fieldName: string, value?: string) => {
    try {
      const field = form.getTextField(fieldName);
      if (value) field.setText(value);
    } catch (error) {
      console.warn(`Could not find or fill field: ${fieldName}`);
    }
  };

  // --- SECTION 1: Student Details (These will be autofilled in the UI) ---
  fillField("Date of Birth", data.dateOfBirth);
  fillField("Mobile", data.mobile);
  fillField("Email Address", data.email);
  fillField("Churchill Course Name", data.courseName);
  fillField("Churchill Student ID Student Name", data.studentIdAndName);

  // Handle the "studentType" checkbox/textfield weirdness
  try {
    const typeField = form.getTextField("I am applying as a Future Student Currently Enrolled Student");
    typeField.setText(data.studentType);
  } catch (e) {
    // ignore
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
  });

  // --- SIGNATURE & DATE ---
  fillField("Student Signature Date", data.signatureDate);

  // For the actual signature SVG, we would draw it onto the PDF canvas here.
  // Because placing SVGs directly into pdf-lib requires paths mapping or drawing an image,
  // we will add the signature image drawing logic if required.
  if (data.studentSignatureSvg) {
    // To properly stamp an SVG string onto a PDF using pdf-lib, we usually need to
    // convert the SVG to a PNG first, or parse the SVG paths.
    // For now, we are skipping the complex SVG drawing logic just for this step,
    // but the data is safely passed!
  }

  // We purposefully DO NOT flatten the form here.
  // This allows the Staff to open the PDF later, check the "Approved Y/N" 
  // boxes, and sign it before final flattening.
  // form.flatten();

  // 4. Serialize the PDF Document to bytes
  const pdfBytes = await pdfDoc.save();

  // 5. Create a standard JavaScript File object
  const fileName = `Advanced_Standing_Form_${data.studentIdAndName.replace(/[^a-z0-9]/gi, '_')}.pdf`;
  return new File([pdfBytes.buffer as ArrayBuffer], fileName, { type: "application/pdf" });
}
