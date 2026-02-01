# GS Screening Form Schema

This document summarizes the validation schema defined in `src/app/dashboard/application/gs-form/_utils/gs-screening.validation.ts`. Use it when sending data to the backend or when mapping client-side fields to payloads. Fields marked as **Required** must be provided; **Optional** fields are only required when their parent condition is satisfied (see the “Conditional requirements” section). Fields that expect document references (e.g., filenames or URLs) are noted under **Document references**.

## Overview

- Schema builder: `z.object({...}).superRefine(...)`
- All yes/no radios use the `yesNoEnum` (`"yes"`/`"no"`) with additional validation in `superRefine`.
- Email must be valid and cannot be empty.
- Numerical inputs use `coerce.number` and require values ≥ 0.
- Conditional validation lives in `superRefine`. Only when a “yes” branch is selected does the associated detail field become required.

## Required fields (always)

| Field name | Type | Notes |
|------------|------|-------|
| `firstName` | string | Applicant given name(s) |
| `lastName` | string | Applicant family name |
| `dateOfBirth` | string (date) | DOB |
| `studentId` | string | Student ID / reference number |
| `passportNumber` | string | Passport number |
| `email` | string (email) | Valid email |
| `currentlyInAustralia` | `"yes"`/`"no"` | Indicates onshore status |
| `intendToApplyStudentVisa` | `"yes"`/`"no"` | Student visa intention |
| `visaRefusedOrCancelled` | `"yes"`/`"no"` | Visa refusal history |
| `familyVisaRefusedOrCancelled` | `"yes"`/`"no"` | Relative visa refusal history |
| `currentSituation` | string | Overview of current circumstances |
| `reasonsForCourse` | string | Why applicant chose course |
| `careerBenefits` | string | Career outcomes/benefits |
| `otherInformation` | string | Additional supporting info |
| `isMarried` | `"yes"`/`"no"` | Marital status |
| `hasChildren` | `"yes"`/`"no"` | Dependent children |
| `hasRelativesInAustralia` | `"yes"`/`"no"` | Relatives currently in Australia |
| `relationshipDetails` | string | Living/relationship arrangements |
| `campusLocation`, `intendedSuburb`, `knowledgeAboutAustralia` | string | Living-in-Australia details |
| `travelApplicant`, `travelFamily`, `tuitionApplicant`, `tuitionFamily`, `oshcApplicant`, `oshcFamily`, `livingExpensesApplicant`, `livingExpensesFamily` | number | Financial capacity numbers, ≥ 0 |
| `applicantFullName` | string | Declaration name |
| `applicantDate` | string (date) | Declaration date |
| `agentAgencyName`, `agentCounsellorName`, `agentDate` | string | Agent declaration details |

## Optional fields (base schema)

| Field name | Type | Condition |
|------------|------|-----------|
| `currentVisaDocument` | string | Required when `currentlyInAustralia === "yes"` |
| `visaRefusalExplanation` | string | Required when `visaRefusedOrCancelled === "yes"` |
| `visaRefusalDocument` | string | Same as above |
| `familyVisaRefusalDocument` | string | Required when `familyVisaRefusedOrCancelled === "yes"` |
| `marriageCertificate` | string | Required when `isMarried === "yes"` |
| `childrenBirthCertificates` | string | Required when `hasChildren === "yes"` |
| `relativesAreCitizens` | `"yes"`/`"no"` | Required when `hasRelativesInAustralia === "yes"` |
| `relativesRelationshipType` | string | Required when `hasRelativesInAustralia === "yes"` |
| `relativesVisaType` | string | Required when `hasRelativesInAustralia === "yes"` & `relativesAreCitizens === "no"` |
| `intendToLiveWithRelatives` | `"yes"`/`"no"` | Required when `hasRelativesInAustralia === "yes"` |
| `studyHistoryInAustralia` | string | Only shown/required when `onshoreGuidance === "yes"` |
| `reasonForStudentVisa` | string | Same as above |

## Document references

The following fields expect document references (file names, URLs, or other textual identifiers of the uploaded documents):

- `currentVisaDocument`
- `visaRefusalDocument`
- `familyVisaRefusalDocument`
- `marriageCertificate`
- `childrenBirthCertificates`
- Additional attachments mentioned in guidance (COEs, transcripts) are conveyed outside this schema but should reference the same documents as the relevant free-text answers where possible.

## Conditional requirements (superRefine logic)

1. **Onshore visa details** (`currentVisaDocument`): required only when applicant is onshore.
2. **Visa refusals**: explanation and document are required only if `visaRefusedOrCancelled === "yes"`.
3. **Family visa refusals**: document required only when `familyVisaRefusedOrCancelled === "yes"`.
4. **Marriage/children**: respective document fields only required for “yes” responses.
5. **Relatives in Australia**: citizenship status, relationship type, intent to live with relatives are required when the top-level question is “yes.” If the relatives are *not* citizens/permanent residents (`relativesAreCitizens === "no"`), `relativesVisaType` becomes mandatory.

Fields hidden due to “No” answers will not trigger schema errors because the optional base schema plus `superRefine` only enforces the linked requirements when the relevant condition holds.
