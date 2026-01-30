# GS Assessment API (Frontend Guide)

This document explains how the frontend should drive a **full GS assessment** workflow. The backend now initializes the GS assessment automatically whenever a staff user moves an application into `ApplicationStage.GS_ASSESSMENT`, so the UI only needs to:

1. Transition the application to the GS assessment stage.
2. Walk through the document, declaration, interview, and staff-assessment steps using the remaining REST endpoints.

⚠️ All `/gs-assessment` endpoints require an authenticated user and most of them assume a staff role. Declaration save/submit routes can also be used directly by agents/students, but review/decision endpoints are staff-only.

## 1. Triggering GS assessment creation

Use the staff transition endpoint so the GS assessment records, documents, declarations, and timeline entries are created in the same transaction:

```
PATCH /api/v1/staff/applications/{application_id}/transition
{
  "to_stage": "GS_ASSESSMENT",
  "notes": "Moving to GS assessment"
}
```

Calling this endpoint:

* Validates the stage transition.
* Creates the `GsAssessment` record.
* Seeds document placeholders, declaration rows, staff assessment, and timeline entries.
* Returns the updated application stage with helpful metadata.

If the application is already in `GS_ASSESSMENT`, you can skip the transition—existing GS assessment data is reused.

## 2. Stage-by-stage endpoints

| Stage | Action | Endpoint | Notes |
|-------|--------|----------|-------|
| **Stage 1 (Documents)** | List document placeholders | `GET /api/v1/gs-assessment/{application_id}/documents` | Returns all 9 documents + summary counts. |
|  | Upload a document | `POST /api/v1/gs-assessment/{application_id}/documents/{document_number}/upload` | Multipart `file`. Marks status `UPLOADED`. |
|  | Review/approve/reject | `PATCH /api/v1/gs-assessment/{application_id}/documents/{document_number}/status` | Body: `{ "status": "APPROVED" | "REJECTED" | ... , "review_notes": "..." }`. Marks reviewer/timestamps. |
|  | Auto-complete all docs (staff only) | `POST /api/v1/gs-assessment/{application_id}/documents/auto-complete` | Sets every doc to `APPROVED` (or another status) in one call. |
|  | Complete the stage | `PATCH /api/v1/gs-assessment/{application_id}/stage` | Body: `{ "stage_to_complete": 1 }`. Requires every document approved. |
| **Stage 2 (Declarations)** | Get/save/submit student declaration | `GET/POST` variants under `/student-declaration` | `save` keeps DRAFT, `submit` flips `SUBMITTED`. |
|  | Get/save/submit agent declaration | `/agent-declaration` similarly. |
|  | Declaration status summary | `GET /api/v1/gs-assessment/{application_id}/stage-2/status` | Returns both actor statuses. |
|  | Review (staff only) | `POST /api/v1/gs-assessment/{application_id}/declarations/{student|agent}/review` | Body: `{ "status": "APPROVED" | "REJECTED", "review_notes": "..." }`. |
|  | Complete the stage | `PATCH /api/v1/gs-assessment/{application_id}/stage` with `{ "stage_to_complete": 2 }`. |
| **Stage 3 (Interview scheduling)** | Complete the stage | `PATCH /api/v1/gs-assessment/{application_id}/stage` with `{ "stage_to_complete": 3 }` once at least one non-cancelled `GSMeeting` exists. |
| **Stage 4 (Interview process)** | Complete the stage | `{ "stage_to_complete": 4 }` once interview recordings/notes are done. |
| **Stage 5 (Staff assessment)** | Get staff assessment | `GET /api/v1/gs-assessment/{application_id}/staff-assessment` |
|  | Save progress | `POST /api/v1/gs-assessment/{application_id}/staff-assessment/save` | Partial payload for question answers. |
|  | Submit final staff assessment | `POST /api/v1/gs-assessment/{application_id}/staff-assessment/submit` | Marks status `SUBMITTED`. |
|  | Final decision (staff only) | `PATCH /api/v1/gs-assessment/{application_id}/staff-assessment/decision` | Body `{"final_decision": "APPROVED"|"REJECTED","decision_rationale":"..." }`. |
| **Meta** | List all assessments | `GET /api/v1/gs-assessment/list?skip=0&limit=50` | Staff-only index view. |
|  | Progress summary (for student/agent UI) | `GET /api/v1/gs-assessment/{application_id}/progress` | Returns current stage, overall status, completion % (0-100). |

### Stage completion notes

* Document stage (1) requires all 9 documents approved.
* Declaration stage (2) requires both student and agent declarations approved.
* Interview stage (3) requires at least one non-canceled `GSMeeting`. The meeting scheduling is handled elsewhere (e.g., `/gs-meetings`), but once scheduled the frontend can call stage update 3 to mark progress.
* Stage numbers align with the `GsStage` enum (1–5). Use `StageUpdateRequest` with `stage_to_complete` to move the assessment forward, and the response includes timestamps for every stage plus the recalculated `current_stage`.

## 3. Typical front-end sequence

1. **Staff transition**: Staff triggers `PATCH /staff/applications/{application_id}/transition` -> sets application stage to `GS_ASSESSMENT` and the system auto-creates GS records.
2. **Document upload/review**: Upload files and approve/reject until `GET /documents` reports all `APPROVED`, then call `{stage_to_complete:1}`.
3. **Declarations**: Both student and agent `submit` declarations. Staff reviews each via `/declarations/.../review`. Call `{stage_to_complete:2}`.
4. **Schedule interview**: Use the GS meeting scheduler to create a meeting, then call `{stage_to_complete:3}`.
5. **Interview process**: After the interview/recording, mark stage 4 complete with stage update.
6. **Staff assessment**: Staff saves/ submits the assessment and then makes the final decision via `/staff-assessment/decision`. The staff assessment logic (Stage 5) automatically updates `current_stage` to `STAFF_ASSESSMENT`, and once the final decision is set the GS overall status changes to `APPROVED`/`NOT_APPROVED`.

## 4. Useful implementation tips

- Always check the response from `GET /gs-assessment/{application_id}` (via `get_assessment`) to understand current stage, document statuses, declaration statuses, and timeline events.
- Use `progress` to populate UI progress bars (gives `completion_percentage`).
- Any stage completion failure returns `400` with an explanatory message; guard UI buttons accordingly.
- The GS assessment service writes timeline entries, so you don’t have to create them manually.
- If you need to display staff assessment details for the student/agent view, the detail endpoint exposes `documents`, `student_declaration`, `agent_declaration`, and the staff assessment payload.

## 5. Security / roles

- Document updates, reviews, and stage completions require a staff token.
- Agents/students can read/save/submit their own declarations and view the progress summary.
- Final staff assessment decision and listing endpoints remain staff-only.
