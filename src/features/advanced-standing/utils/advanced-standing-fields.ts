/**
 * Single source of truth for the AcroForm field names emitted by the
 * Advanced Standing template (advanced-standing-template.tsx), consumed by the
 * pdf-lib fill util (advanced-standing-pdf.util.ts) and the pdfjs overlay
 * editor (advanced-standing-pdf-editor.tsx).
 *
 * Field names are load-bearing: renaming one here requires the template,
 * fill util, and editor to stay in sync — which is why they all import from
 * this module.
 */

// ─── Text fields: PDF field name → react-hook-form dotted path ──────────────

export const FIELD_MAP: Record<string, string> = {
  "Student Name": "studentName",
  "Date of Birth": "dateOfBirth",
  Mobile: "mobile",
  "Email Address": "email",
  "Churchill Course Name": "courseName",
  "Name of InstitutionRow1": "basisForCredit.0.institution",
  CountryRow1: "basisForCredit.0.country",
  "Course CodeRow1": "basisForCredit.0.courseCode",
  "Course NameRow1": "basisForCredit.0.courseName",
  "Name of InstitutionRow2": "basisForCredit.1.institution",
  CountryRow2: "basisForCredit.1.country",
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
  Date: "staffDate",
  "Credits Assessed By": "staffName",
};

// ─── Checkboxes (studentType) ────────────────────────────────────────────────

export const STUDENT_TYPE_CHECKBOXES = {
  "Future Student": "Future Student",
  "Currently Enrolled Student": "Currently Enrolled Student",
} as const;

// ─── Signature anchors ───────────────────────────────────────────────────────
// Read-only placeholder text fields whose widget rectangles mark where the
// rasterized signature images are drawn by the fill util.

export const SIGNATURE_ANCHOR_FIELDS = {
  student: "Student Signature",
  staff: "Signature",
  dean: "Signature_2", // present in the template, unused by the app
} as const;

// ─── Fields that exist in the template but are never filled by the app ──────

export const APP_UNUSED_FIELDS = [
  "Churchill Student ID",
  "Deans Approval",
  "Date_2",
] as const;

/** Every text-field name the generated template must contain. */
export const ALL_TEMPLATE_TEXT_FIELDS: string[] = [
  ...Object.keys(FIELD_MAP),
  ...Object.values(SIGNATURE_ANCHOR_FIELDS),
  ...APP_UNUSED_FIELDS,
];
