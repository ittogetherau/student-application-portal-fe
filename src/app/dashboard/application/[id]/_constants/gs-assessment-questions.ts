export interface StageQuestion {
  id: string;
  question: string;
}

export const STAGE_1_QUESTIONS: StageQuestion[] = [
  {
    id: "q1",
    question:
      "Have you explained the academic entry requirements of the applied program/package programs to the applicant?",
  },
  {
    id: "q2",
    question:
      "Does the applicant meet the English Language Proficiency (ELP) requirements?",
  },
  {
    id: "q3",
    question:
      "Has the applicant been advised of the study details, including content, duration, tuition fees, campus location, and career opportunities on completion of the program(s)?",
  },
  {
    id: "q4",
    question:
      "If the applicant is seeking credit/recognition of previous learning (RPL), have the relevant course outlines been provided?",
  },
  {
    id: "q5",
    question:
      "Are you satisfied that the program the applicant has selected is linked to their previous educational background and/or future career aspirations? Has evidence been sighted to support this?",
  },
  {
    id: "q6",
    question:
      "Are there any gaps in the applicant's study or employment history? If yes, provide details with supporting documentation.",
  },
  {
    id: "q7",
    question:
      "Has the applicant ever been excluded from another institution? If yes, provide details with supporting documentation.",
  },
];

export const STAGE_2_QUESTIONS: StageQuestion[] = [
  {
    id: "s2q1",
    question:
      "Has the student provided a signed letter of offer issued by the provider?",
  },
  {
    id: "s2q2",
    question: "Did the student submit other supporting documents?",
  },
  {
    id: "s2q3",
    question:
      "Do the financial documents submitted by the student, including all supporting documents, meet the CIHE GS requirement?",
  },
  {
    id: "s2q4",
    question:
      "Has the student provided proof of relationship for all financial sponsors?",
  },
  {
    id: "s2q5",
    question:
      "Has the student been interviewed by the admission team of Churchill Institute of Higher Education?",
  },
  {
    id: "s2q6",
    question: "Student fee payment has been verified",
  },
];
