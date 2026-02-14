export type ApplicationFormStep = {
  id: number;
  title: string;
  hidden?: boolean;
};

export const APPLICATION_FORM_STEPS: ApplicationFormStep[] = [
  { id: 0, title: "Enrollment" },
  { id: 1, title: "Personal Details" },
  { id: 2, title: "Emergency Contact" },
  { id: 3, title: "Health Cover", hidden: true },
  { id: 4, title: "Language & Culture" },
  { id: 5, title: "Disability" },
  { id: 6, title: "Schooling", hidden: true },
  { id: 7, title: "Qualifications" },
  { id: 8, title: "Employment", hidden: true },
  { id: 9, title: "USI" },
  { id: 10, title: "Additional Services", hidden: true },
  { id: 11, title: "Survey", hidden: true },
  { id: 12, title: "Documents" },
  { id: 13, title: "Review" },
];

export const HIDDEN_STEP_IDS = APPLICATION_FORM_STEPS.filter(
  (step) => step.hidden,
).map((step) => step.id);

export const VISIBLE_FORM_STEPS = APPLICATION_FORM_STEPS.filter(
  (step) => !step.hidden,
);
