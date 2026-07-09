"use client";

import {
  Checkbox,
  Document,
  Image as PdfImage,
  Page,
  Text,
  TextInput,
  View,
  pdf,
} from "@react-pdf/renderer";

import { SIGNATURE_ANCHOR_FIELDS } from "../utils/advanced-standing-fields";



async function svgToPngDataUrl(svgText: string): Promise<string> {
  const blob = new Blob([svgText], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load SVG"));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.width || 800;
    canvas.height = img.height || 200;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  const reader = new FileReader();
  return await new Promise<string>((resolve, reject) => {
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.readAsDataURL(blob);
  });
}

async function loadImageDataUrl(path: string): Promise<string | null> {
  try {
    const response = await fetch(path, { cache: "force-cache" });
    if (!response.ok) return null;
    const blob = await response.blob();
    const isSvg =
      blob.type.includes("svg") ||
      (await blob.slice(0, 200).text()).includes("<svg");
    if (isSvg) {
      const svgText = await blob.text();
      return await svgToPngDataUrl(svgText);
    }
    return await blobToDataUrl(blob);
  } catch {
    return null;
  }
}

// ─── geometry ────────────────────────────────────────────────────────────────

const PAGE_W = 595.5;
const PAGE_H = 842;

/** Table border colour of the original template (rgb 190,144,0). */
const GOLD = "#BE9000";
/** Link colour of the original template (rgb 5,98,193). */
const BLUE = "#0562C1";
const LINE = 0.7;

type Rect = readonly [number, number, number, number]; // x1, y1, x2, y2 in PDF coords

/** Absolute style for a PDF-coordinate rectangle. */
const abs = (r: Rect) =>
  ({
    position: "absolute",
    left: r[0],
    top: PAGE_H - r[3],
    width: r[2] - r[0],
    height: r[3] - r[1],
  }) as const;

/** Absolute style anchoring a text run at its original baseline. */
const textAt = (x: number, baseline: number, size: number) =>
  ({
    position: "absolute",
    left: x,
    top: PAGE_H - baseline - size * 0.78,
    fontSize: size,
    lineHeight: 1,
  }) as const;

const HLine = ({ x1, x2, y }: { x1: number; x2: number; y: number }) => (
  <View
    style={{
      position: "absolute",
      left: x1,
      top: PAGE_H - y - LINE / 2,
      width: x2 - x1,
      height: LINE,
      backgroundColor: GOLD,
    }}
  />
);

const VLine = ({ x, y1, y2 }: { x: number; y1: number; y2: number }) => (
  <View
    style={{
      position: "absolute",
      left: x - LINE / 2,
      top: PAGE_H - y2,
      width: LINE,
      height: y2 - y1,
      backgroundColor: GOLD,
    }}
  />
);

/**
 * Table grid: horizontal lines at every `rows` boundary (full width) and
 * vertical lines at every `cols` boundary. `verticalSpan` restricts the
 * vertical lines to a sub-range (used when a title band has no dividers).
 */
const Grid = ({
  cols,
  rows,
  verticalSpan,
}: {
  cols: number[];
  rows: number[];
  verticalSpan?: readonly [number, number];
}) => {
  const [vBottom, vTop] = verticalSpan ?? [rows[rows.length - 1], rows[0]];
  return (
    <>
      {rows.map((y) => (
        <HLine key={`h${y}`} x1={cols[0]} x2={cols[cols.length - 1]} y={y} />
      ))}
      {cols.map((x) => (
        <VLine key={`v${x}`} x={x} y1={vBottom} y2={vTop} />
      ))}
    </>
  );
};

const Label = ({
  text,
  x,
  y,
  size = 10,
  bold = false,
}: {
  text: string;
  x: number;
  y: number;
  size?: number;
  bold?: boolean;
}) => (
  <Text
    style={{
      ...textAt(x, y, size),
      fontFamily: bold ? "Helvetica-Bold" : "Helvetica",
      color: "#000000",
    }}
  >
    {text}
  </Text>
);

/** Column-header text centred between two column boundaries. */
const CellHeader = ({
  x1,
  x2,
  y,
  size,
  text,
}: {
  x1: number;
  x2: number;
  y: number;
  size: number;
  text: string;
}) => (
  <View
    style={{
      position: "absolute",
      left: x1,
      top: PAGE_H - y - size * 0.78,
      width: x2 - x1,
    }}
  >
    <Text style={{ fontSize: size, textAlign: "center", lineHeight: 1 }}>{text}</Text>
  </View>
);

const Field = ({
  name,
  rect,
  readOnly = false,
}: {
  name: string;
  rect: Rect;
  readOnly?: boolean;
}) => <TextInput name={name} readOnly={readOnly} fontSize={11} style={abs(rect)} />;

// ─── column boundaries shared by the tables ─────────────────────────────────

const TABLE_L = 63;
const TABLE_R = 532.5;
// Section 2: Name of Institution | Country | Course Code | Course Name
const S2_COLS = [TABLE_L, 184.4, 274.5, 418.5, TABLE_R];
// Section 3 (and its page-2 continuation): Unit | CIHE equivalent | Approved
const S3_COLS = [TABLE_L, 184.4, 418.5, TABLE_R];

// Section 3 data rows, top to bottom (row 1 → row 7): [yBottom, yTop] bands.
const S3_ROW_BOUNDS = [255, 231.1, 207.1, 183.4, 159.6, 135.6, 111.9, 87.9];

// ─── document ────────────────────────────────────────────────────────────────

function AdvancedStandingTemplateDocument({
  letterheadDataUrl,
}: {
  letterheadDataUrl: string | null;
}) {
  const pageBackground = letterheadDataUrl ? (
    <PdfImage
      style={{ position: "absolute", top: 0, left: 0, width: PAGE_W, height: PAGE_H }}
      src={letterheadDataUrl}
    />
  ) : null;

  return (
    <Document title="Advanced Standing Application Form">
      {/* ─── Page 1 ─────────────────────────────────────────────────────── */}
      <Page size={[PAGE_W, PAGE_H]} style={{ fontFamily: "Helvetica", color: "#000000" }}>
        {pageBackground}

        <Label text="ADVANCED STANDING APPLICATION FORM" x={72} y={709.2} size={12} bold />

        {/* ABOUT THIS FORM */}
        <View
          style={{
            ...abs([62.3, 648.1, 530.3, 691.6]),
            borderWidth: LINE,
            borderColor: GOLD,
            paddingTop: 4,
            paddingHorizontal: 7,
          }}
        >
          <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", marginBottom: 2 }}>
            ABOUT THIS FORM
          </Text>
          <Text style={{ fontSize: 10, lineHeight: 1.15 }}>
            This form is used to apply for advanced standing or credit transfer by students who
            wish to enrol into Churchill Institute of Higher Education or transfer between courses
            within the Institute.
          </Text>
        </View>

        {/* INSTRUCTIONS */}
        <View
          style={{
            ...abs([62.3, 587.4, 531, 635.4]),
            borderWidth: LINE,
            borderColor: GOLD,
            paddingTop: 4,
            paddingHorizontal: 7,
          }}
        >
          <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", marginBottom: 3 }}>
            INSTRUCTIONS
          </Text>
          <Text style={{ fontSize: 10, lineHeight: 1.3 }}>
            Students who wish to apply for advanced standing must fill and sign this form and
            submit it to Admissions Team in person or via email at{" "}
            <Text
              style={{
                color: BLUE,
                fontFamily: "Helvetica-Bold",
                textDecoration: "underline",
              }}
            >
              admissions@churchill.edu.au
            </Text>
          </Text>
        </View>

        {/* I am applying as a: [] Future Student [] Currently Enrolled Student */}
        <View style={{ ...abs([TABLE_L, 559.9, TABLE_R, 580.7]), borderWidth: LINE, borderColor: GOLD }} />
        <Label text="I am applying as a:" x={67.3} y={566.9} />
        <Checkbox
          name="Future Student"
          xMark
          borderColor="#000000"
          backgroundColor="#ffffff"
          style={abs([148, 563.9, 158, 573.9])}
        />
        <Label text="Future Student" x={161.8} y={566.9} />
        <Checkbox
          name="Currently Enrolled Student"
          xMark
          borderColor="#000000"
          backgroundColor="#ffffff"
          style={abs([231.5, 563.9, 241.5, 573.9])}
        />
        <Label text="Currently Enrolled Student" x={247.6} y={566.9} />

        {/* Section 1: Student Details */}
        <Grid cols={[TABLE_L, TABLE_R]} rows={[558.9, 538.9, 516.2, 493.9, 471.4, 448.7, 425.9]} />
        <VLine x={295.2} y1={516.2} y2={538.9} />
        <Label text="Section 1: Student Details" x={67.3} y={545.4} bold />
        <Label text="Churchill Student ID:" x={68.3} y={523.6} size={9.5} />
        <Field name="Churchill Student ID" rect={[155.4, 517.8, 294.3, 538.5]} />
        <Label text="Student Name:" x={296.1} y={523.6} size={9.5} />
        <Field name="Student Name" rect={[361.2, 516.7, 532.1, 537.4]} />
        <Label text="Date of Birth:" x={68.3} y={501.9} />
        <Field name="Date of Birth" rect={[123.2, 495, 532.1, 515.4]} />
        <Label text="Mobile:" x={67.3} y={479.6} />
        <Field name="Mobile" rect={[98.6, 472.2, 532.1, 493.6]} />
        <Label text="Email Address:" x={68.3} y={456.9} size={9.5} />
        <Field name="Email Address" rect={[128.8, 449.4, 532.1, 470.9]} />
        <Label text="Churchill Course Name:" x={68.3} y={434.1} />
        <Field name="Churchill Course Name" rect={[168.5, 426.7, 532.1, 448.1]} />

        {/* Section 2: Basis for Credit */}
        <Grid
          cols={S2_COLS}
          rows={[425.9, 403.6, 380.5, 358.9, 335.2]}
          verticalSpan={[335.2, 403.6]}
        />
        <Label text="Section 2: Basis for Credit" x={67.3} y={411.6} bold />
        <CellHeader x1={S2_COLS[0]} x2={S2_COLS[1]} y={388.1} size={10} text="Name of Institution" />
        <CellHeader x1={S2_COLS[1]} x2={S2_COLS[2]} y={388.1} size={10} text="Country" />
        <CellHeader x1={S2_COLS[2]} x2={S2_COLS[3]} y={388.1} size={10} text="Course Code" />
        <CellHeader x1={S2_COLS[3]} x2={S2_COLS[4]} y={388.1} size={10} text="Course Name" />
        <Field name="Name of InstitutionRow1" rect={[63.7, 359.6, 183.5, 379.1]} />
        <Field name="CountryRow1" rect={[185.3, 359.6, 273.5, 379.1]} />
        <Field name="Course CodeRow1" rect={[275.4, 359.6, 417.6, 379.1]} />
        <Field name="Course NameRow1" rect={[419.4, 359.6, 532.1, 379.1]} />
        <Field name="Name of InstitutionRow2" rect={[63.8, 335.9, 183.4, 358.2]} />
        <Field name="CountryRow2" rect={[185.4, 335.9, 273.4, 358.2]} />
        <Field name="Course CodeRow2" rect={[275.5, 335.9, 417.5, 358.2]} />
        <Field name="Course NameRow2" rect={[419.5, 335.9, 532, 358.2]} />

        {/* Certified-documents notice */}
        <View style={{ position: "absolute", left: 68.3, top: PAGE_H - 318.6 - 8, width: 464 }}>
          <Text style={{ fontSize: 10, lineHeight: 1.16, fontFamily: "Helvetica-Oblique" }}>
            *An application for advanced standing for previous studies, will NOT be considered
            unless official/certified copies of Academic transcript and detailed unit/subject
            outlines are attached with this form.
          </Text>
        </View>

        {/* Section 3: Course Equivalence for Advanced Standing */}
        <Grid
          cols={S3_COLS}
          rows={[303.4, 281.9, ...S3_ROW_BOUNDS]}
          verticalSpan={[S3_ROW_BOUNDS[S3_ROW_BOUNDS.length - 1], 281.9]}
        />
        <Label text="Section 3: Course Equivalence for Advanced Standing" x={68.3} y={285.8} bold />
        <CellHeader x1={S3_COLS[0]} x2={S3_COLS[1]} y={260.8} size={9} text="Unit code and name" />
        <CellHeader
          x1={S3_COLS[1]}
          x2={S3_COLS[2]}
          y={260.8}
          size={9}
          text="CIHE equivalent unit code and name"
        />
        <CellHeader x1={S3_COLS[2]} x2={S3_COLS[3]} y={260.8} size={10} text="Approved (Y/N)" />
        {S3_ROW_BOUNDS.slice(1).map((yBottom, index) => {
          const yTop = S3_ROW_BOUNDS[index];
          const row = index + 1;
          const inset = 0.8;
          return (
            <View key={row}>
              <Field
                name={`Unit code and nameRow${row}`}
                rect={[63.8, yBottom + inset, 183.4, yTop - inset]}
              />
              <Field
                name={`CIHE equivalent unit code and nameRow${row}`}
                rect={[185.4, yBottom + inset, 417.5, yTop - inset]}
              />
              <Field
                name={`Approved YNRow${row}`}
                rect={[419.5, yBottom + inset, 532, yTop - inset]}
              />
            </View>
          );
        })}
      </Page>

      {/* ─── Page 2 ─────────────────────────────────────────────────────── */}
      <Page size={[PAGE_W, PAGE_H]} style={{ fontFamily: "Helvetica", color: "#000000" }}>
        {pageBackground}

        {/* Empty continuation of the Section 3 table (visual only, no fields) */}
        <Grid cols={S3_COLS} rows={[722, 698.25, 681.25, 664.45, 647.45]} />

        {/* Declaration */}
        <View style={{ position: "absolute", left: 68.3, top: PAGE_H - 624.9 - 8, width: 464 }}>
          <Text style={{ fontSize: 10, lineHeight: 1.16 }}>
            I declare that the information supplied in this form (and attachments) is correct and
            complete. I acknowledge that incomplete information may result in my application being
            returned to me. I recognize that it is my responsibility to provide all necessary
            documentary evidence of my qualifications and I declare that the Official Statement of
            Academic Records provided are a true record of my academic results.
          </Text>
        </View>

        {/* Student signature row */}
        <View style={{ ...abs([TABLE_L, 552, TABLE_R, 580.8]), borderWidth: LINE, borderColor: GOLD }} />
        <Label text="Student Signature:" x={68.3} y={565.7} size={9.5} />
        <Field
          name={SIGNATURE_ANCHOR_FIELDS.student}
          rect={[148, 553.5, 276, 579.5]}
          readOnly
        />
        <Label text="Date:" x={280.6} y={565.7} />
        <Field name="Student Signature Date" rect={[303.5, 553, 531.1, 579.8]} />

        {/* OFFICE USE ONLY */}
        <Grid
          cols={[TABLE_L, TABLE_R]}
          rows={[525.9, 506.9, 483.65, 460.2, 436.85, 413.35, 391.85]}
        />
        <VLine x={289.35} y1={436.85} y2={460.2} />
        <VLine x={289.35} y1={391.85} y2={413.35} />
        <Label text="OFFICE USE ONLY" x={69.3} y={513.1} bold />
        <Label text="Application received on:" x={69.3} y={491.6} size={9.5} />
        <Field name="Application received on" rect={[177.6, 484, 531.1, 505.8]} />
        <Label text="Credits Assessed By:" x={69.3} y={468.4} size={9.5} />
        <Field name="Credits Assessed By" rect={[164.9, 460.4, 531.1, 482.6]} />
        <Label text="Signature:" x={69.3} y={444.9} />
        <Field name={SIGNATURE_ANCHOR_FIELDS.staff} rect={[113.6, 437.2, 288.5, 459.1]} readOnly />
        <Label text="Date:" x={295.1} y={444.9} />
        <Field name="Date" rect={[318.5, 437.2, 531.1, 459.1]} />
        <Label text="Dean's Approval:" x={69.3} y={421.6} bold />
        <Field name="Deans Approval" rect={[145.7, 413.6, 531.1, 435.8]} />
        <Label text="Signature:" x={69.3} y={398.9} />
        <Field name={SIGNATURE_ANCHOR_FIELDS.dean} rect={[113.6, 392.2, 288.5, 412.3]} readOnly />
        <Label text="Date:" x={295.1} y={398.9} />
        <Field name="Date_2" rect={[318.5, 392.2, 531.1, 412.3]} />
      </Page>
    </Document>
  );
}

// ─── template generation (memoized) ─────────────────────────────────────────

async function buildTemplatePdf(): Promise<Uint8Array> {
  // Letterhead extracted from the original advanced standing PDF (logo +
  // grey wave header, hexagon watermark, footer with campus details).
  const letterheadDataUrl = await loadImageDataUrl(
    "/images/advanced-standing-letterhead.png"
  );
  const blob = await pdf(
    <AdvancedStandingTemplateDocument letterheadDataUrl={letterheadDataUrl} />
  ).toBlob();
  return new Uint8Array(await blob.arrayBuffer());
}

let templatePromise: Promise<Uint8Array> | null = null;

/**
 * Generates the blank Advanced Standing template (with live AcroForm fields).
 * Memoized per session: the template is a pure function of code, so repeated
 * preview refills only pay the pdf-lib fill cost, not react-pdf rendering.
 */
export function generateAdvancedStandingTemplatePdf(): Promise<Uint8Array> {
  if (!templatePromise) {
    templatePromise = buildTemplatePdf().catch((error) => {
      templatePromise = null;
      throw error;
    });
  }
  // Hand out a copy — pdf-lib and pdf.js may detach/transfer the buffer.
  return templatePromise.then((bytes) => bytes.slice());
}
