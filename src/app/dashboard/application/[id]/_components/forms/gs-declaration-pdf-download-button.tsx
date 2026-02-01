"use client";
import type { GSScreeningFormValues } from "@/app/dashboard/application/gs-form/_utils/gs-screening.validation";
import { Button, buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";
import { Download } from "lucide-react";
import { useCallback, useState, type ComponentProps } from "react";
import { toast } from "react-hot-toast";

type ButtonVariantProps = VariantProps<typeof buttonVariants>;
type ButtonLikeProps = ComponentProps<"button"> &
  ButtonVariantProps & { asChild?: boolean };

function getString(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function formatAnswer(answer: unknown): string {
  const raw = getString(answer).trim();
  if (!raw) return "";
  const lower = raw.toLowerCase();
  if (lower === "yes") return "Yes";
  if (lower === "no") return "No";
  return raw;
}

function formatMoney(value: unknown): string {
  const raw = typeof value === "number" ? value : parseFloat(getString(value));
  if (!Number.isFinite(raw)) return "";
  return raw.toFixed(2);
}

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

      const { Document, Page, Text, View, StyleSheet, pdf } = await import(
        "@react-pdf/renderer"
      );

      const styles = StyleSheet.create({
        page: {
          paddingTop: 32,
          paddingBottom: 28,
          paddingHorizontal: 32,
          fontSize: 10,
          color: "#0f172a",
          lineHeight: 1.35,
          fontFamily: "Helvetica",
        },
        header: {
          fontSize: 9,
          color: "#475569",
          textAlign: "right",
          marginBottom: 10,
        },
        title: {
          fontSize: 16,
          textAlign: "center",
          fontWeight: "bold",
          marginBottom: 6,
          textTransform: "uppercase",
        },
        subtitle: {
          fontSize: 10,
          textAlign: "center",
          marginBottom: 12,
        },
        paragraph: {
          marginBottom: 6,
        },
        sectionTitle: {
          fontSize: 11,
          fontWeight: "bold",
          marginTop: 8,
          marginBottom: 6,
          textTransform: "uppercase",
        },
        sectionDivider: {
          height: 1,
          backgroundColor: "#0f172a",
          marginBottom: 6,
        },
        fieldRow: {
          flexDirection: "row",
          gap: 10,
          marginBottom: 6,
        },
        fieldLabel: {
          width: 130,
          color: "#1f2937",
        },
        fieldValue: {
          flexGrow: 1,
          borderBottomWidth: 1,
          borderBottomColor: "#cbd5f5",
          paddingBottom: 2,
        },
        questionBlock: {
          marginBottom: 8,
        },
        questionLabel: {
          fontWeight: "bold",
          marginBottom: 2,
        },
        answerBox: {
          borderWidth: 1,
          borderColor: "#cbd5f5",
          minHeight: 24,
          padding: 6,
          marginBottom: 4,
        },
        checkboxRow: {
          flexDirection: "row",
          gap: 6,
          marginBottom: 4,
        },
        checkboxLabel: {
          flex: 1,
        },
        table: {
          borderWidth: 1,
          borderColor: "#cbd5f5",
          marginTop: 6,
        },
        tableRow: {
          flexDirection: "row",
          borderBottomWidth: 1,
          borderBottomColor: "#e2e8f0",
        },
        tableCell: {
          flex: 1,
          paddingVertical: 4,
          paddingHorizontal: 6,
          borderRightWidth: 1,
          borderRightColor: "#e2e8f0",
        },
        tableCellLast: {
          borderRightWidth: 0,
        },
        tableHeader: {
          backgroundColor: "#f1f5f9",
          fontWeight: "bold",
        },
        footerNote: {
          fontSize: 9,
          color: "#475569",
          marginTop: 8,
        },
        signatureLine: {
          marginTop: 10,
          borderBottomWidth: 1,
          borderBottomColor: "#0f172a",
        },
        documentLine: {
          fontSize: 9,
          color: "#1f2937",
          marginTop: 2,
        },
      });

      const renderHeader = (pageNumber: number) => (
        <Text style={styles.header}>
          {`Page | ${pageNumber} Churchill Institute of Higher Education Genuine Student (GS) Screening Form February 2026 CRICOS: 04082E`}
        </Text>
      );

      const FieldRow = ({
        label,
        value,
      }: {
        label: string;
        value: string;
      }) => (
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>{label}</Text>
          <Text style={styles.fieldValue}>{value || " "}</Text>
        </View>
      );

      const QuestionBlock = ({
        label,
        answer,
      }: {
        label: string;
        answer?: string;
      }) => (
        <View style={styles.questionBlock}>
          <Text style={styles.questionLabel}>{label}</Text>
          <View style={styles.answerBox}>
            <Text>{answer || " "}</Text>
          </View>
        </View>
      );

      const CheckboxRow = ({
        label,
        value,
      }: {
        label: string;
        value?: string;
      }) => (
        <View style={styles.checkboxRow}>
          <Text style={styles.checkboxLabel}>
            {label} {value ? `- ${value}` : "-"}
          </Text>
        </View>
      );

      const doc = (
        <Document>
          <Page size="A4" style={styles.page}>
            {renderHeader(1)}
            <Text style={styles.title}>GENUINE STUDENT (GS) SCREENING FORM</Text>
            <Text style={styles.subtitle}>
              Genuine Student (GS) Form - Student to Complete
            </Text>
            <Text style={styles.paragraph}>
              The Australian government has replaced the Genuine Temporary
              Entrant (GTE) requirement for student visas with a Genuine Student
              (GS) requirement. This is effective for student visa applications
              lodged on and after 23 March 2024.
            </Text>
            <Text style={styles.paragraph}>
              All applicants for a student visa must be a genuine applicant for
              entry to Australia for the purpose of studying and obtaining a
              qualification. They must be able to demonstrate that studying in
              Australia is the primary reason of their student visa. To be
              granted a student visa, all applicants must demonstrate they
              satisfy the genuine student criterion or the genuine student
              dependent criterion. More information regarding the Genuine
              Student requirement is available on the Department of Home
              Affairs website.
            </Text>
            <Text style={styles.paragraph}>
              International students applying to Churchill Institute of Higher
              Education (PRV14305 | CRICOS Provider: 04082E) must be genuine in
              their intention to study, must comply with student visa
              requirements, enrol into their degree at Churchill Institute and
              must successfully complete their course at Churchill Institute of
              Higher Education. Please complete the below questions to
              demonstrate you meet the GS criteria. You must complete this
              form; and limit your response to each question below to a maximum
              of 150 words and provide evidence to support your statements.
              Please refer to the Genuine Student criteria provided by the
              Department of Home Affairs and Ministerial Direction No 106 when
              responding to the above questions.
            </Text>
            <Text style={styles.paragraph}>
              Note: The Churchill Institute of Higher Education Genuine Student
              (GS) Checklist (Appendix A) must also be completed with this form
              as part of the application documents.
            </Text>

            <Text style={styles.sectionTitle}>SECTION A</Text>
            <View style={styles.sectionDivider} />
            <Text style={styles.sectionTitle}>1. Applicant details</Text>
            <FieldRow label="Given Name(s)" value={getString(data.firstName)} />
            <FieldRow label="Family Name" value={getString(data.lastName)} />
            <FieldRow
              label="Date of Birth (DOB)"
              value={getString(data.dateOfBirth)}
            />
            <FieldRow
              label="Student ID / Reference Number"
              value={getString(data.studentId)}
            />
            <FieldRow
              label="Passport Number"
              value={getString(data.passportNumber)}
            />
            <FieldRow label="Email" value={getString(data.email)} />

            <Text style={styles.sectionTitle}>
              2. Current location (in Australia or overseas)
            </Text>
            <CheckboxRow
              label="A. Are you currently onshore/living in Australia?"
              value={formatAnswer(data.currentlyInAustralia)}
            />
            {data.currentVisaDocument ? (
              <Text style={styles.documentLine}>
                {`Current visa document: ${getString(data.currentVisaDocument)}`}
              </Text>
            ) : null}
            <CheckboxRow
              label="B. Do you intend to apply for a student visa to study this course?"
              value={formatAnswer(data.intendToApplyStudentVisa)}
            />

            <Text style={styles.sectionTitle}>3. Immigration history</Text>
            <CheckboxRow
              label="A. Have you ever had a visa refused or cancelled in any country including Australia?"
              value={formatAnswer(data.visaRefusedOrCancelled)}
            />
            {data.visaRefusalExplanation ? (
              <Text style={styles.documentLine}>
                {`Explanation: ${getString(data.visaRefusalExplanation)}`}
              </Text>
            ) : null}
            {data.visaRefusalDocument ? (
              <Text style={styles.documentLine}>
                {`Visa refusal document: ${getString(data.visaRefusalDocument)}`}
              </Text>
            ) : null}
            <CheckboxRow
              label="B. Have any of your immediate family members ever had a visa refused or cancelled in any country including Australia?"
              value={formatAnswer(data.familyVisaRefusedOrCancelled)}
            />
            {data.familyVisaRefusalDocument ? (
              <Text style={styles.documentLine}>
                {`Family visa refusal document: ${getString(
                  data.familyVisaRefusalDocument,
                )}`}
              </Text>
            ) : null}
          </Page>

          <Page size="A4" style={styles.page}>
            {renderHeader(2)}
            <Text style={styles.sectionTitle}>
              4. Course information and personal circumstances
            </Text>
            <QuestionBlock
              label="A. Provide information about your current situation, such as your connections to family, community, work and economic circumstances."
              answer={getString(data.currentSituation)}
            />
            <QuestionBlock
              label="B. Briefly outline your reasons for choosing the course/s you applied for at Churchill Institute of Higher Education and your understanding of the course."
              answer={getString(data.reasonsForCourse)}
            />
            <QuestionBlock
              label="C. Explain how completing this course will be of benefit to your future career prospects."
              answer={getString(data.careerBenefits)}
            />
            <QuestionBlock
              label="D. Provide any other relevant information that you have not included in the above responses."
              answer={getString(data.otherInformation)}
            />
            <Text style={styles.paragraph}>
              If you are currently in Australia (onshore), complete Items E and
              F below.
            </Text>
            <QuestionBlock
              label="E. Provide details of your study history in Australia (include all courses studied, institution names and dates and previous visas held during this time). Attach copies of previous offer of admission letters, COEs, and academic transcripts."
              answer={getString(data.studyHistoryInAustralia)}
            />
            <QuestionBlock
              label="F. If you are holding a visa other than a student visa, provide reasons why you are now applying for a student visa. Include your study history while in Australia."
              answer={getString(data.reasonForStudentVisa)}
            />

            <Text style={styles.sectionTitle}>5. Family details</Text>
            <CheckboxRow
              label="Are you married?"
              value={formatAnswer(data.isMarried)}
            />
            {data.marriageCertificate ? (
              <Text style={styles.documentLine}>
                {`Marriage certificate: ${getString(data.marriageCertificate)}`}
              </Text>
            ) : null}
            <CheckboxRow
              label="Do you have children?"
              value={formatAnswer(data.hasChildren)}
            />
            {data.childrenBirthCertificates ? (
              <Text style={styles.documentLine}>
                {`Children birth certificates: ${getString(
                  data.childrenBirthCertificates,
                )}`}
              </Text>
            ) : null}
            <CheckboxRow
              label="A. Do you have any relatives (parents, brothers, sisters, aunties, uncles, cousins or in-laws) living in Australia?"
              value={formatAnswer(data.hasRelativesInAustralia)}
            />
            <CheckboxRow
              label="If Yes - are they a citizen/permanent resident of Australia?"
              value={formatAnswer(data.relativesAreCitizens)}
            />
            {data.relativesRelationshipType ? (
              <Text style={styles.documentLine}>
                {`Relationship details: ${getString(
                  data.relativesRelationshipType,
                )}`}
              </Text>
            ) : null}
            {data.relativesVisaType ? (
              <Text style={styles.documentLine}>
                {`Relatives visa type: ${getString(data.relativesVisaType)}`}
              </Text>
            ) : null}
            <CheckboxRow
              label="Do you intend to live with them while studying?"
              value={formatAnswer(data.intendToLiveWithRelatives)}
            />
            {data.relationshipDetails ? (
              <Text style={styles.documentLine}>
                {`Relationship details: ${getString(data.relationshipDetails)}`}
              </Text>
            ) : null}
          </Page>

          <Page size="A4" style={styles.page}>
            {renderHeader(3)}
            <Text style={styles.sectionTitle}>6. Living in Australia</Text>
            <QuestionBlock
              label="A. At which Churchill Institute of Higher Education campus will you study your course/s?"
              answer={getString(data.campusLocation)}
            />
            <QuestionBlock
              label="B. Name the specific suburb/city where you intend to live whilst studying (Include any family living in this location, your planned living and family arrangements, how you will commute to campus, etc.)"
              answer={getString(data.intendedSuburb)}
            />
            <QuestionBlock
              label="C. Explain your knowledge about living in Australia (e.g. accommodation details, cost of living and how you will commute to campus)"
              answer={getString(data.knowledgeAboutAustralia)}
            />

            <Text style={styles.sectionTitle}>
              SECTION B - FINANCIAL CAPACITY ASSESSMENT
            </Text>
            <Text style={styles.paragraph}>
              Check the Department of Home Affairs website (Subclass 500 Student
              visa) for the most updated information about the financial
              capacity requirements.
            </Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCell}> </Text>
                <Text style={styles.tableCell}>Applicant</Text>
                <Text style={[styles.tableCell, styles.tableCellLast]}>
                  Family Members
                </Text>
              </View>
              {[
                [
                  "Travel (return Airfares)",
                  data.travelApplicant,
                  data.travelFamily,
                ],
                [
                  "Tuition for first year of study",
                  data.tuitionApplicant,
                  data.tuitionFamily,
                ],
                [
                  "Overseas Health Cover (OSHC)",
                  data.oshcApplicant,
                  data.oshcFamily,
                ],
                [
                  "Living Expenses",
                  data.livingExpensesApplicant,
                  data.livingExpensesFamily,
                ],
                [
                  "TOTAL funding (Applicant + Family Members)",
                  (Number(data.travelApplicant || 0) +
                    Number(data.tuitionApplicant || 0) +
                    Number(data.oshcApplicant || 0) +
                    Number(data.livingExpensesApplicant || 0)).toFixed(2),
                  (Number(data.travelFamily || 0) +
                    Number(data.tuitionFamily || 0) +
                    Number(data.oshcFamily || 0) +
                    Number(data.livingExpensesFamily || 0)).toFixed(2),
                ],
              ].map(([label, applicantValue, familyValue]) => (
                <View key={label as string} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{label as string}</Text>
                  <Text style={styles.tableCell}>
                    ${formatMoney(applicantValue)}
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellLast]}>
                    ${formatMoney(familyValue)}
                  </Text>
                </View>
              ))}
            </View>
            <Text style={styles.footerNote}>
              Applicants must refer to the Churchill Institute of Higher
              Education Genuine Student (GS) Checklist (Appendix A) for
              prescribed supporting documentation required to evidence financial
              capacity, sponsorship arrangements, and family circumstances, as
              mandated under the Department of Home Affairs student visa
              requirements.
            </Text>
          </Page>

          <Page size="A4" style={styles.page}>
            {renderHeader(4)}
            <Text style={styles.sectionTitle}>Declarations</Text>
            <Text style={styles.sectionTitle}>
              Applicant (Student) declaration
            </Text>
            {[
              "By submitting this form, I accept and declare that the information provided in this form is true and correct.",
              "I acknowledge and accept that Churchill Institute of Higher Education may vary or cancel any decision made based on incorrect, incomplete, false or misleading information which I may have provided, or due to changes to Australian Government policy.",
              "I understand that the information provided will be used for the assessment of my application for admission and subsequent enrolment by Churchill Institute of Higher Education and may also be accessed and used by Churchill Institute of Higher Education (such as any third party contractors engaged by Churchill Institute of Higher Education as part of the assessment process) and by the Education Agent, contracted by Churchill Institute, who has assisted with your completion this form. I understand that provision of this information is voluntary, and failure to provide the requested information may result in my application for admission being refused.",
              "I authorise any institution or organisation named on any document provided as evidence of my qualifications or work experience or which are named in my application to release to Churchill Institute of Higher Education or Churchill Institute of Higher Education (including any third party contractor engaged by Churchill Institute of Higher Education or its subsidiaries as part of the assessment process) personal information which they may hold about me for the purpose of verification of my supporting documents.",
              "I agree to inform Churchill Institute of Higher Education or Churchill Institute of Higher Education Australia immediately if there is any change to the information I have provided.",
            ].map((item) => (
              <Text key={item} style={styles.paragraph}>
                {item}
              </Text>
            ))}
            <Text style={styles.paragraph}>Applicant Full Name</Text>
            <Text>{getString(data.applicantFullName)}</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.paragraph}>Applicant Signature</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.paragraph}>Date:</Text>
            <Text>{getString(data.applicantDate)}</Text>
            <View style={styles.signatureLine} />

            <Text style={styles.sectionTitle}>
              Education Agent declaration
            </Text>
            {[
              "I confirm that I have made reasonable enquiries to verify the information and documents provided to me by the student and, to the best of my knowledge and belief, the student is a Genuine Student for the purpose of studying in Australia. I understand that a GS is a person who satisfies the GS criterion for an Australian student visa as set out in Ministerial Direction Number 106.",
              "I confirm that I have sighted, and verified the authenticity of, the original Academic Transcripts, Graduation Certificate and/or Completion Certificate of the Student.",
              "I confirm that I have counselled the student on their student visa obligations, including work limitations, maintaining full-time study, holding Overseas Student Health Cover (OSHC), having and continuing to have sufficient financial resources to study and live in Australia and restrictions on deferring or suspending studies.",
              "I confirm that: I have sighted, and verified the authenticity of, original financial statements which show that the student has access to sufficient funds for tuition, OSHC, living expenses and other fees payable for the duration of the student's studies at Churchill Institute of Higher Education. I have counselled the student on the estimated cost of living in Australia and confirm that the student (and their dependents where applicable) will have sufficient funds to return to their country of citizenship or residence at the end of their studies. I have informed the student that they should notify Churchill Institute of Higher Education immediately if they encounter any financial difficulties during their studies, and that Churchill Institute cannot guarantee financial assistance; and I have informed the student that Churchill Institute of Higher Education reserves the right to ask for further documentation.",
            ].map((item) => (
              <Text key={item} style={styles.paragraph}>
                {item}
              </Text>
            ))}
            <Text style={styles.paragraph}>Agency name / Branch</Text>
            <Text>{getString(data.agentAgencyName)}</Text>
            <Text style={styles.paragraph}>Counsellor's name</Text>
            <Text>{getString(data.agentCounsellorName)}</Text>
            <Text style={styles.paragraph}>Date</Text>
            <Text>{getString(data.agentDate)}</Text>
          </Page>

          <Page size="A4" style={styles.page}>
            {renderHeader(5)}
            <Text style={styles.sectionTitle}>
              Appendix A: Application Checklist
            </Text>
            <Text style={styles.paragraph}>
              International Admissions Office - Churchill Institute of Higher
              Education (admissions@churchill.nsw.edu.au)
            </Text>
            <Text style={styles.sectionTitle}>
              Demonstration of Financial Capacity
            </Text>
            <Text style={styles.paragraph}>
              It is a requirement for Student visa applicants to demonstrate
              the financial capacity to meet the tuition, living and travel
              costs associated with their studies in Australia. Applicants must
              also show that they can support members of their family who will
              be accompanying them during their stay in the country. If you have
              been requested by Churchill Institute of Higher Education to
              demonstrate financial capacity, you will need to provide:
            </Text>
            <Text style={styles.paragraph}>
              A completed Demonstration of Financial Capacity - Declaration
              form. Documentary evidence that satisfies either Option (1) or
              Option (2) described below.
            </Text>
            <Text style={styles.sectionTitle}>
              Option 1 - Showing sufficient funds to meet 12-month of expenses
              in Australia
            </Text>
            <Text style={styles.paragraph}>
              The amount of funds you are required to demonstrate are as per the
              table below, by adding the items (a) + (b) + (c) respectively.
            </Text>

            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCell}> </Text>
                <Text style={styles.tableCell}>Primary Applicant</Text>
                <Text style={[styles.tableCell, styles.tableCellLast]}>
                  Secondary Applicant(s)
                </Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Student</Text>
                <Text style={styles.tableCell}>Spouse</Text>
                <Text style={[styles.tableCell, styles.tableCellLast]}>
                  Children
                </Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Tuition Fees and OSHC</Text>
                <Text style={styles.tableCell}>
                  Refer to your Offer of Admission for the annual tuition fee and
                  OSHC
                </Text>
                <Text style={[styles.tableCell, styles.tableCellLast]}>-</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Living Expenses</Text>
                <Text style={styles.tableCell}>AUD$29,710</Text>
                <Text style={[styles.tableCell, styles.tableCellLast]}>
                  add AUD$10,394 (spouse) / add AUD$4,449 per child. Add an
                  extra AUD$13,502 per child of schooling age (6 - 17 years).
                </Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Travel</Text>
                <Text style={styles.tableCell}>AUD$2,000</Text>
                <Text style={[styles.tableCell, styles.tableCellLast]}>
                  - $5,000 depending on country where the application is lodged
                </Text>
              </View>
            </View>
            <Text style={styles.footerNote}>
              These figures are for 12 months, as of 10 May 2024. They should
              only be used for the GS assessment and are not representative of
              all costs that could be incurred.
            </Text>
          </Page>

          <Page size="A4" style={styles.page}>
            {renderHeader(6)}
            <Text style={styles.sectionTitle}>GS Checklist</Text>
            <Text style={styles.paragraph}>
              The GS checklist must be completed and attached alongside the
              declaration form. Ensure all items are verified with supporting
              documentation.
            </Text>
            {[
              "Have you explained the academic entry requirements of the course to the applicant (refer to the Admission Policy / Guidelines)?",
              "Does the applicant meet the English Language Proficiency (ELP) requirements? (Refer to the Admissions Policy / Guidelines)",
              "Has the applicant been advised of the study details, including content, duration, tuition fees, campus location, and career opportunities on completion of the program(s)? Refer the course information on Churchill's website",
              "If the applicant is seeking advanced standing (credit) have the relevant course outlines been provided? Refer to the advanced standing information on Churchill's website",
              "Are you satisfied that the course the applicant has selected is linked to their previous educational background and/or future career aspirations? Has evidence been sighted to support this?",
              "Are there any gaps in the applicant's study or employment history? If yes, provide details with supporting documentation.",
              "Has the applicant ever been excluded from another institution? If yes, provide details with supporting documentation.",
              "Have you verified that the applicant is able to meet the full financial requirements of the program/package programs applied, including the associated living and travel expenses as specified by DHA?",
              "Have you explained to the applicant the financial evidence they must be able to demonstrate to secure a student visa to study in Australia?",
              "Has the applicant been advised regarding tuition fee payments and refunds based on Churchill's Student Fees Policy?",
              "Have the scholarship terms and conditions been explained to the applicant, if applicable?",
              "Is the applicant married or in de-facto relationship?",
              "Does the applicant have children?",
              "Does the applicant intend to travel to Australia with their spouse or other family members?",
              "Does the applicant have any relatives living in Australia?",
              "Have you explained to the applicant the Genuine Student requirements as defined by the DHA?",
              "Is the applicant aware that they may be interviewed by Australian immigration authorities to determine their status as a Genuine Student?",
              "Does the applicant (or accompanying family members) have any visa refusals for Australia or any other country? If yes, attach all visa decision records.",
              "Are you satisfied that the applicant is a Genuine Student and can meet the Genuine Student requirements?",
            ].map((item) => (
              <Text key={item} style={styles.paragraph}>
                {item}
              </Text>
            ))}
          </Page>
        </Document>
      );

      const blob = await pdf(doc).toBlob();

      const url = URL.createObjectURL(blob);
      const anchor = window.document.createElement("a");
      anchor.href = url;
      anchor.download = `gs-screening-form-${applicationId ?? "application"}.pdf`;
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
