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

// ─── Row capacities ──────────────────────────────────────────────────────────

/**
 * Course-equivalence rows the PDF can display: 5 on page 1 (rows 6-7 were
 * dropped there because they overlapped the letterhead footer) + 10 on the
 * page-2 continuation table.
 */
export const PAGE1_EQUIVALENCE_ROWS = 5;
export const PAGE2_EQUIVALENCE_ROWS = 10;
export const MAX_COURSE_EQUIVALENCES =
  PAGE1_EQUIVALENCE_ROWS + PAGE2_EQUIVALENCE_ROWS;

// ─── Text fields: PDF field name → react-hook-form dotted path ──────────────

const courseEquivalenceEntries: Record<string, string> = {};
for (let row = 1; row <= MAX_COURSE_EQUIVALENCES; row++) {
  const index = row - 1;
  courseEquivalenceEntries[`Unit code and nameRow${row}`] =
    `courseEquivalences.${index}.unitCodeAndName`;
  courseEquivalenceEntries[`CIHE equivalent unit code and nameRow${row}`] =
    `courseEquivalences.${index}.ciheEquivalent`;
  courseEquivalenceEntries[`Approved YNRow${row}`] =
    `courseEquivalences.${index}.approved`;
}

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
  ...courseEquivalenceEntries,
  "Student Signature Date": "signatureDate",
  "Application received by": "receivedBy",
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
