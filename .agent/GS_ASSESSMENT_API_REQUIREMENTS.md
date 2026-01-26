# GS Assessment API Requirements
## Churchill University Student Application Management System

**Version:** 1.0  
**Date:** January 21, 2026  
**Backend:** FastAPI (Python)  
**Frontend:** React + TypeScript + Next.js

---

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Data Models](#data-models)
4. [API Endpoints](#api-endpoints)
5. [Workflow Logic](#workflow-logic)
6. [Validation Rules](#validation-rules)
7. [Error Handling](#error-handling)
8. [Security & Authentication](#security--authentication)
9. [File Upload Handling](#file-upload-handling)
10. [Email Notifications](#email-notifications)

---

## Overview

The GS Assessment system is a 5-stage sequential workflow for evaluating international student applications at Churchill University. Each stage must be completed before the next stage unlocks.

### Five Stages:

1. **Stage 1: Document Collection** - Collect and verify 9 required documents
2. **Stage 2: Declaration Forms** - Student and Agent declaration form submissions
3. **Stage 3: Interview Scheduling** - Schedule video interview with student
4. **Stage 4: Interview Process** - Conduct and record video interview
5. **Stage 5: Final Staff Assessment** - Comprehensive staff evaluation and decision

---

## System Architecture

### Technology Stack

- **Backend Framework:** FastAPI 0.104+
- **Database:** PostgreSQL 15+
- **ORM:** SQLAlchemy 2.0+
- **File Storage:** AWS S3 or local filesystem with secure access
- **Authentication:** JWT tokens
- **Email Service:** SMTP or SendGrid
- **Video Platform:** Zoom API integration

### Database Schema Relationships

```
applications (1) ──────── (1) gs_assessments
                               │
                               ├──── (9) gs_documents
                               ├──── (1) gs_student_declaration
                               ├──── (1) gs_agent_declaration
                               ├──── (1) gs_interview
                               └──── (1) gs_staff_assessment
```

---

## Data Models

### 1. GS Assessment Main Table

**Table:** `gs_assessments`

```python
{
  "id": "uuid",
  "application_id": "uuid (FK to applications)",
  "current_stage": "integer (1-5)",
  "stage_1_completed": "boolean",
  "stage_1_completed_at": "datetime (nullable)",
  "stage_2_completed": "boolean",
  "stage_2_completed_at": "datetime (nullable)",
  "stage_3_completed": "boolean",
  "stage_3_completed_at": "datetime (nullable)",
  "stage_4_completed": "boolean",
  "stage_4_completed_at": "datetime (nullable)",
  "stage_5_completed": "boolean",
  "stage_5_completed_at": "datetime (nullable)",
  "overall_status": "enum ('in_progress', 'approved', 'not_approved', 'on_hold')",
  "final_decision": "enum (nullable) ('approved', 'not_approved')",
  "final_decision_by": "uuid (nullable, FK to users)",
  "final_decision_at": "datetime (nullable)",
  "notes": "text (nullable)",
  "created_at": "datetime",
  "updated_at": "datetime",
  "created_by": "uuid (FK to users)",
  "updated_by": "uuid (FK to users)"
}
```

**Indexes:**
- `application_id` (unique)
- `current_stage`
- `overall_status`

---

### 2. GS Documents

**Table:** `gs_documents`

```python
{
  "id": "uuid",
  "gs_assessment_id": "uuid (FK to gs_assessments)",
  "document_number": "integer (1-9)",
  "document_name": "string",
  "status": "enum ('not_started', 'pending', 'completed')",
  "file_url": "string (nullable)",
  "file_name": "string (nullable)",
  "file_size": "integer (nullable, bytes)",
  "file_type": "string (nullable, mime type)",
  "uploaded_by": "uuid (nullable, FK to users)",
  "uploaded_at": "datetime (nullable)",
  "reviewed_by": "uuid (nullable, FK to users)",
  "reviewed_at": "datetime (nullable)",
  "review_notes": "text (nullable)",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Document Numbers:**
1. Passport Copy
2. Academic Transcripts
3. English Proficiency Test Results
4. Certificate of Qualification
5. Financial Documents
6. Health Insurance (OSHC)
7. Previous Visa History
8. Statement of Purpose
9. CV/Resume

**Indexes:**
- `gs_assessment_id`
- `document_number`
- `status`

---

### 3. GS Student Declaration Form

**Table:** `gs_student_declarations`

```python
{
  "id": "uuid",
  "gs_assessment_id": "uuid (FK to gs_assessments)",
  "application_id": "uuid (FK to applications)",
  
  # Section A.1 - Applicant Details
  "first_name": "string",
  "last_name": "string",
  "date_of_birth": "date",
  "student_id": "string",
  
  # Section A.2 - Current Location
  "currently_in_australia": "boolean",
  "current_visa_document_url": "string (nullable)",
  "intend_to_apply_student_visa": "boolean",
  
  # Section A.3 - Immigration History
  "visa_refused_or_cancelled": "boolean",
  "visa_refusal_explanation": "text (nullable)",
  "visa_refusal_document_url": "string (nullable)",
  "family_visa_refused_or_cancelled": "boolean",
  "family_visa_refusal_document_url": "string (nullable)",
  
  # Section A.4 - Course Information
  "current_situation": "text",
  "reasons_for_course": "text",
  "career_benefits": "text",
  "other_information": "text (nullable)",
  "study_history_in_australia_url": "string (nullable)",
  "reason_for_student_visa": "text",
  
  # Section A.5 - Family Details
  "is_married": "boolean",
  "marriage_certificate_url": "string (nullable)",
  "has_children": "boolean",
  "children_birth_certificates_url": "string (nullable)",
  "has_relatives_in_australia": "boolean",
  "relatives_are_citizens": "boolean (nullable)",
  "relatives_visa_type": "string (nullable)",
  "relationship_details": "text (nullable)",
  "intend_to_live_with_relatives": "boolean (nullable)",
  
  # Section A.6 - Living in Australia
  "campus_location": "string",
  "intended_suburb": "string",
  "knowledge_about_australia": "text",
  
  # Section B - Financial Capacity (all in AUD)
  "travel_applicant": "decimal(10,2)",
  "travel_family": "decimal(10,2) (nullable)",
  "tuition_applicant": "decimal(10,2)",
  "tuition_family": "decimal(10,2) (nullable)",
  "oshc_applicant": "decimal(10,2)",
  "oshc_family": "decimal(10,2) (nullable)",
  "living_expenses_applicant": "decimal(10,2)",
  "living_expenses_family": "decimal(10,2) (nullable)",
  
  # Declaration
  "applicant_full_name": "string",
  "applicant_signature_date": "date",
  
  # Metadata
  "status": "enum ('draft', 'submitted', 'reviewed', 'approved', 'rejected')",
  "submitted_at": "datetime (nullable)",
  "reviewed_by": "uuid (nullable, FK to users)",
  "reviewed_at": "datetime (nullable)",
  "review_notes": "text (nullable)",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Indexes:**
- `gs_assessment_id` (unique)
- `application_id`
- `status`

---

### 4. GS Agent Declaration Form

**Table:** `gs_agent_declarations`

```python
{
  "id": "uuid",
  "gs_assessment_id": "uuid (FK to gs_assessments)",
  "application_id": "uuid (FK to applications)",
  
  # All fields from Student Declaration (same structure)
  # ... (inherits all student declaration fields)
  
  # Additional Agent-specific fields
  "agent_agency_name": "string",
  "agent_counsellor_name": "string",
  "agent_signature_date": "date",
  "agent_comments": "text (nullable)",
  
  # Verification
  "student_declaration_verified": "boolean",
  "verification_notes": "text (nullable)",
  
  # Metadata
  "status": "enum ('draft', 'submitted', 'reviewed', 'approved', 'rejected')",
  "submitted_at": "datetime (nullable)",
  "reviewed_by": "uuid (nullable, FK to users)",
  "reviewed_at": "datetime (nullable)",
  "review_notes": "text (nullable)",
  "filled_by": "uuid (FK to users)",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Indexes:**
- `gs_assessment_id` (unique)
- `application_id`
- `status`
- `filled_by`

---

### 5. GS Interview

**Table:** `gs_interviews`

```python
{
  "id": "uuid",
  "gs_assessment_id": "uuid (FK to gs_assessments)",
  "application_id": "uuid (FK to applications)",
  
  # Scheduling Information
  "interview_title": "string",
  "interview_date": "date",
  "interview_time": "time",
  "interview_datetime": "datetime",
  "timezone": "string (default 'Australia/Melbourne')",
  "duration_minutes": "integer (default 30)",
  
  # Meeting Details
  "meeting_platform": "string (default 'Zoom')",
  "meeting_link": "string (nullable)",
  "meeting_id": "string (nullable)",
  "meeting_password": "string (nullable)",
  
  # Participants
  "interviewer_id": "uuid (FK to users)",
  "interviewer_name": "string",
  "student_email": "string",
  "student_name": "string",
  
  # Status Tracking
  "status": "enum ('scheduled', 'rescheduled', 'in_progress', 'completed', 'cancelled', 'no_show')",
  "email_sent": "boolean (default false)",
  "email_sent_at": "datetime (nullable)",
  "reminder_sent": "boolean (default false)",
  "reminder_sent_at": "datetime (nullable)",
  
  # Interview Recording & Notes
  "recording_url": "string (nullable)",
  "interview_notes": "text (nullable)",
  "student_attended": "boolean (nullable)",
  "completed_at": "datetime (nullable)",
  
  # Rescheduling
  "reschedule_count": "integer (default 0)",
  "reschedule_reason": "text (nullable)",
  "original_datetime": "datetime (nullable)",
  
  # Metadata
  "scheduled_by": "uuid (FK to users)",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Indexes:**
- `gs_assessment_id` (unique)
- `application_id`
- `interview_datetime`
- `status`
- `interviewer_id`

---

### 6. GS Staff Assessment

**Table:** `gs_staff_assessments`

```python
{
  "id": "uuid",
  "gs_assessment_id": "uuid (FK to gs_assessments)",
  "application_id": "uuid (FK to applications)",
  
  # Applicant Details (Pre-filled from application)
  "given_name": "string",
  "family_name": "string",
  "date_of_birth": "date",
  "reference_number": "string",
  "passport_number": "string",
  "email": "string",
  
  # Stage 1: Pre-interview Questions (7 questions)
  "stage1_questions": "jsonb",  # Array of question objects
  
  # Stage 2: Interview Assessment (6 questions)
  "stage2_questions": "jsonb",  # Array of question objects
  
  # Final Comments & Decision
  "additional_comments": "text (nullable)",
  "recommendation": "enum ('approved', 'not_approved', 'conditional_approval')",
  "conditions": "text (nullable)",
  "risk_level": "enum (nullable) ('low', 'medium', 'high')",
  
  # Decision Tracking
  "final_decision": "enum (nullable) ('approved', 'not_approved')",
  "decision_rationale": "text (nullable)",
  "decision_made_by": "uuid (nullable, FK to users)",
  "decision_made_at": "datetime (nullable)",
  
  # Metadata
  "status": "enum ('draft', 'submitted', 'under_review', 'completed')",
  "completed_by": "uuid (nullable, FK to users)",
  "completed_at": "datetime (nullable)",
  "reviewed_by": "uuid (nullable, FK to users)",
  "reviewed_at": "datetime (nullable)",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Stage 1 Questions JSONB Structure:**

```json
[
  {
    "id": "q1",
    "question": "Have you explained the academic entry requirements of the applied program/package programs to the applicant?",
    "answer": "yes|no",
    "evidence_verified": true,
    "notes": "Optional additional notes"
  },
  {
    "id": "q2",
    "question": "Does the applicant meet the English Language Proficiency (ELP) requirements?",
    "answer": "yes|no",
    "evidence_verified": true,
    "notes": ""
  },
  {
    "id": "q3",
    "question": "Has the applicant been advised of the study details, including content, duration, tuition fees, campus location, and career opportunities on completion of the program(s)?",
    "answer": "yes|no",
    "evidence_verified": false,
    "notes": ""
  },
  {
    "id": "q4",
    "question": "If the applicant is seeking credit/recognition of previous learning (RPL), have the relevant course outlines been provided?",
    "answer": "yes|no",
    "evidence_verified": true,
    "notes": ""
  },
  {
    "id": "q5",
    "question": "Are you satisfied that the program the applicant has selected is linked to their previous educational background and/or future career aspirations? Has evidence been sighted to support this?",
    "answer": "yes|no",
    "evidence_verified": true,
    "notes": ""
  },
  {
    "id": "q6",
    "question": "Are there any gaps in the applicant's study or employment history? If yes, provide details with supporting documentation.",
    "answer": "yes|no",
    "evidence_verified": false,
    "notes": "Gap between 2020-2021 explained"
  },
  {
    "id": "q7",
    "question": "Has the applicant ever been excluded from another institution? If yes, provide details with supporting documentation.",
    "answer": "yes|no",
    "evidence_verified": false,
    "notes": ""
  }
]
```

**Stage 2 Questions JSONB Structure:**

```json
[
  {
    "id": "s2q1",
    "question": "Has the student provided a signed letter of offer issued by the provider?",
    "answer": "yes|no",
    "evidence_verified": true,
    "approval_status": "approved|not_approved|not_applicable",
    "notes": ""
  },
  {
    "id": "s2q2",
    "question": "Have you assessed the student's understanding of course requirements and outcomes?",
    "answer": "yes|no",
    "evidence_verified": true,
    "approval_status": "approved|not_approved|not_applicable",
    "notes": ""
  },
  {
    "id": "s2q3",
    "question": "Has the student demonstrated sufficient financial capacity?",
    "answer": "yes|no",
    "evidence_verified": true,
    "approval_status": "approved|not_approved|not_applicable",
    "notes": ""
  },
  {
    "id": "s2q4",
    "question": "Are you satisfied with the student's genuine temporary entrant (GTE) intentions?",
    "answer": "yes|no",
    "evidence_verified": true,
    "approval_status": "approved|not_approved|not_applicable",
    "notes": ""
  },
  {
    "id": "s2q5",
    "question": "Has the student's immigration history been thoroughly reviewed?",
    "answer": "yes|no",
    "evidence_verified": false,
    "approval_status": "approved|not_approved|not_applicable",
    "notes": ""
  },
  {
    "id": "s2q6",
    "question": "Overall interview assessment - Is the student suitable for the program?",
    "answer": "yes|no",
    "evidence_verified": true,
    "approval_status": "approved|not_approved|not_applicable",
    "notes": ""
  }
]
```

**Indexes:**
- `gs_assessment_id` (unique)
- `application_id`
- `status`
- `recommendation`
- `completed_by`

---

## API Endpoints

### Base URL

```
{BASE_API_URL}/api/v1/gs-assessment
```

### Authentication

All endpoints require JWT authentication:

```
Authorization: Bearer {jwt_token}
```

---

## 1. GS Assessment - Core Endpoints

### 1.1 Initialize GS Assessment

**Endpoint:** `POST /gs-assessment/initialize`

**Description:** Creates a new GS Assessment record for an application

**Request Body:**

```json
{
  "application_id": "uuid"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "application_id": "uuid",
    "current_stage": 1,
    "overall_status": "in_progress",
    "stage_1_completed": false,
    "stage_2_completed": false,
    "stage_3_completed": false,
    "stage_4_completed": false,
    "stage_5_completed": false,
    "created_at": "2026-01-21T10:30:00Z",
    "created_by": "uuid"
  },
  "message": "GS Assessment initialized successfully"
}
```

**Error Responses:**

- `400 Bad Request` - Application not found or already has GS Assessment
- `403 Forbidden` - User not authorized
- `500 Internal Server Error`

---

### 1.2 Get GS Assessment

**Endpoint:** `GET /gs-assessment/{application_id}`

**Description:** Retrieves complete GS Assessment data for an application

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "application_id": "uuid",
    "current_stage": 3,
    "overall_status": "in_progress",
    "stage_1_completed": true,
    "stage_1_completed_at": "2026-01-15T14:20:00Z",
    "stage_2_completed": true,
    "stage_2_completed_at": "2026-01-18T09:15:00Z",
    "stage_3_completed": false,
    "stage_3_completed_at": null,
    "stage_4_completed": false,
    "stage_5_completed": false,
    "final_decision": null,
    "notes": "",
    "documents": [...],
    "student_declaration": {...},
    "agent_declaration": {...},
    "interview": {...},
    "staff_assessment": {...},
    "created_at": "2026-01-10T08:00:00Z",
    "updated_at": "2026-01-18T09:15:00Z"
  }
}
```

---

### 1.3 Update Current Stage

**Endpoint:** `PATCH /gs-assessment/{application_id}/stage`

**Description:** Advances to next stage or updates current stage status

**Request Body:**

```json
{
  "stage_to_complete": 1,
  "notes": "Optional completion notes"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "current_stage": 2,
    "stage_1_completed": true,
    "stage_1_completed_at": "2026-01-21T10:45:00Z",
    "updated_at": "2026-01-21T10:45:00Z"
  },
  "message": "Stage 1 completed. Moved to Stage 2."
}
```

**Validation:**
- Cannot skip stages
- Must meet completion criteria for current stage
- Only authorized staff can advance stages

---

## 2. Documents Management (Stage 1)

### 2.1 Get All Documents

**Endpoint:** `GET /gs-assessment/{application_id}/documents`

**Description:** Retrieves all 9 documents with their statuses

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "id": "uuid",
        "document_number": 1,
        "document_name": "Passport Copy",
        "status": "completed",
        "file_url": "https://s3.../passport.pdf",
        "file_name": "passport_john_doe.pdf",
        "file_size": 1024000,
        "file_type": "application/pdf",
        "uploaded_by": "uuid",
        "uploaded_at": "2026-01-10T09:00:00Z",
        "reviewed_by": "uuid",
        "reviewed_at": "2026-01-10T10:30:00Z",
        "review_notes": "Valid passport"
      },
      {
        "id": "uuid",
        "document_number": 2,
        "document_name": "Academic Transcripts",
        "status": "pending",
        "file_url": "https://s3.../transcript.pdf",
        "uploaded_at": "2026-01-11T14:00:00Z",
        "reviewed_by": null,
        "reviewed_at": null,
        "review_notes": null
      },
      {
        "id": "uuid",
        "document_number": 3,
        "document_name": "English Proficiency Test Results",
        "status": "not_started",
        "file_url": null,
        "uploaded_at": null
      }
      // ... remaining 6 documents
    ],
    "summary": {
      "total": 9,
      "completed": 3,
      "pending": 2,
      "not_started": 4,
      "progress_percentage": 33
    }
  }
}
```

---

### 2.2 Upload Document

**Endpoint:** `POST /gs-assessment/{application_id}/documents/{document_number}/upload`

**Description:** Uploads a document file

**Request:** `multipart/form-data`

```
file: <binary data>
notes: "Optional upload notes"
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "document_number": 1,
    "status": "pending",
    "file_url": "https://s3.../passport_abc123.pdf",
    "file_name": "passport_john_doe.pdf",
    "file_size": 1024000,
    "file_type": "application/pdf",
    "uploaded_by": "uuid",
    "uploaded_at": "2026-01-21T11:00:00Z"
  },
  "message": "Document uploaded successfully"
}
```

**Validation:**
- File size max: 10MB
- Allowed types: PDF, JPG, PNG, DOCX
- Document number must be 1-9

---

### 2.3 Update Document Status

**Endpoint:** `PATCH /gs-assessment/{application_id}/documents/{document_number}/status`

**Description:** Updates document review status (staff only)

**Request Body:**

```json
{
  "status": "completed",
  "review_notes": "Document verified and approved"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "document_number": 1,
    "status": "completed",
    "reviewed_by": "uuid",
    "reviewed_at": "2026-01-21T11:15:00Z",
    "review_notes": "Document verified and approved"
  },
  "message": "Document status updated"
}
```

---

### 2.4 Auto-complete All Documents (Testing Only)

**Endpoint:** `POST /gs-assessment/{application_id}/documents/auto-complete`

**Description:** Marks all documents as completed (for testing purposes)

**Request Body:**

```json
{
  "confirm": true
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "All 9 documents marked as completed",
  "data": {
    "completed_count": 9,
    "stage_1_auto_completed": true
  }
}
```

---

## 3. Student Declaration Form (Stage 2)

### 3.1 Get Student Declaration

**Endpoint:** `GET /gs-assessment/{application_id}/student-declaration`

**Description:** Retrieves student declaration form data

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "submitted",
    "first_name": "John",
    "last_name": "Doe",
    "date_of_birth": "1998-05-15",
    "student_id": "STU-2024-001",
    "currently_in_australia": true,
    "current_visa_document_url": "https://s3.../visa.pdf",
    "intend_to_apply_student_visa": true,
    // ... all other fields
    "applicant_full_name": "John Doe",
    "applicant_signature_date": "2026-01-15",
    "submitted_at": "2026-01-15T10:30:00Z",
    "reviewed_by": null,
    "reviewed_at": null,
    "created_at": "2026-01-14T09:00:00Z",
    "updated_at": "2026-01-15T10:30:00Z"
  }
}
```

---

### 3.2 Save Student Declaration (Draft)

**Endpoint:** `POST /gs-assessment/{application_id}/student-declaration/save`

**Description:** Saves student declaration as draft (can be partial)

**Request Body:**

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "date_of_birth": "1998-05-15",
  "currently_in_australia": true,
  "visa_refused_or_cancelled": false,
  "current_situation": "Currently working in home country",
  "reasons_for_course": "To advance my career in IT",
  // ... partial or complete data
  "status": "draft"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "draft",
    "updated_at": "2026-01-21T11:30:00Z"
  },
  "message": "Student declaration saved as draft"
}
```

---

### 3.3 Submit Student Declaration

**Endpoint:** `POST /gs-assessment/{application_id}/student-declaration/submit`

**Description:** Submits completed student declaration form

**Request Body:**

```json
{
  // All required fields (complete form data)
  "first_name": "John",
  "last_name": "Doe",
  "date_of_birth": "1998-05-15",
  "student_id": "STU-2024-001",
  "currently_in_australia": true,
  "current_visa_document_url": "https://s3.../visa.pdf",
  "intend_to_apply_student_visa": true,
  "visa_refused_or_cancelled": false,
  "current_situation": "Currently working as software developer",
  "reasons_for_course": "To pursue Master's in Computer Science",
  "career_benefits": "Career advancement and specialization",
  "reason_for_student_visa": "To study full-time in Australia",
  "campus_location": "Melbourne",
  "intended_suburb": "Carlton",
  "knowledge_about_australia": "Researched extensively about Melbourne",
  "travel_applicant": 2000.00,
  "travel_family": 0.00,
  "tuition_applicant": 35000.00,
  "tuition_family": 0.00,
  "oshc_applicant": 600.00,
  "oshc_family": 0.00,
  "living_expenses_applicant": 21041.00,
  "living_expenses_family": 0.00,
  "applicant_full_name": "John Doe",
  "applicant_signature_date": "2026-01-21"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "submitted",
    "submitted_at": "2026-01-21T11:45:00Z"
  },
  "message": "Student declaration submitted successfully"
}
```

**Validation:**
- All required fields must be present
- Valid data formats (dates, decimals, booleans)
- Files must be uploaded before submission
- Applicant signature date cannot be future date

---

### 3.4 Upload Declaration Document

**Endpoint:** `POST /gs-assessment/{application_id}/student-declaration/upload/{field_name}`

**Description:** Uploads supporting documents for declaration form

**Path Parameters:**
- `field_name`: One of: `current_visa_document`, `visa_refusal_document`, `family_visa_refusal_document`, `study_history_in_australia`, `marriage_certificate`, `children_birth_certificates`

**Request:** `multipart/form-data`

```
file: <binary data>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "field_name": "current_visa_document",
    "file_url": "https://s3.../visa_document_abc123.pdf",
    "file_name": "visa_grant_notice.pdf",
    "file_size": 512000,
    "uploaded_at": "2026-01-21T12:00:00Z"
  },
  "message": "Document uploaded successfully"
}
```

---

## 4. Agent Declaration Form (Stage 2)

### 4.1 Get Agent Declaration

**Endpoint:** `GET /gs-assessment/{application_id}/agent-declaration`

**Description:** Retrieves agent declaration form data

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "submitted",
    // ... all student declaration fields
    "agent_agency_name": "Global Education Services",
    "agent_counsellor_name": "Sarah Smith",
    "agent_signature_date": "2026-01-16",
    "agent_comments": "Student is well-prepared and motivated",
    "student_declaration_verified": true,
    "verification_notes": "All information cross-checked",
    "filled_by": "uuid",
    "submitted_at": "2026-01-16T14:30:00Z"
  }
}
```

---

### 4.2 Save Agent Declaration (Draft)

**Endpoint:** `POST /gs-assessment/{application_id}/agent-declaration/save`

**Description:** Saves agent declaration as draft

**Request Body:**

```json
{
  // All student declaration fields + agent fields
  "first_name": "John",
  "last_name": "Doe",
  // ... all required fields
  "agent_agency_name": "Global Education Services",
  "agent_counsellor_name": "Sarah Smith",
  "agent_comments": "Student shows strong motivation",
  "student_declaration_verified": true,
  "status": "draft"
}
```

**Response:** `200 OK`

---

### 4.3 Submit Agent Declaration

**Endpoint:** `POST /gs-assessment/{application_id}/agent-declaration/submit`

**Description:** Submits completed agent declaration form

**Request Body:**

```json
{
  // Complete form data including agent fields
  "agent_agency_name": "Global Education Services",
  "agent_counsellor_name": "Sarah Smith",
  "agent_signature_date": "2026-01-21",
  "agent_comments": "Student is well-prepared",
  "student_declaration_verified": true,
  "verification_notes": "All details verified with student",
  // ... all other required fields
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "submitted",
    "submitted_at": "2026-01-21T13:00:00Z"
  },
  "message": "Agent declaration submitted successfully"
}
```

**Validation:**
- All student declaration validations apply
- Agent-specific fields must be filled
- Must verify student declaration

---

### 4.4 Check Stage 2 Completion

**Endpoint:** `GET /gs-assessment/{application_id}/stage-2/status`

**Description:** Checks if both declarations are complete

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "student_declaration_completed": true,
    "agent_declaration_completed": true,
    "stage_2_ready_for_completion": true,
    "student_declaration_submitted_at": "2026-01-15T10:30:00Z",
    "agent_declaration_submitted_at": "2026-01-16T14:30:00Z"
  }
}
```

---

## 5. Interview Scheduling (Stage 3)

### 5.1 Get Interview Details

**Endpoint:** `GET /gs-assessment/{application_id}/interview`

**Description:** Retrieves interview scheduling information

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "interview_title": "GS Assessment Interview - John Doe",
    "interview_date": "2026-01-25",
    "interview_time": "14:00:00",
    "interview_datetime": "2026-01-25T14:00:00+11:00",
    "timezone": "Australia/Melbourne",
    "duration_minutes": 30,
    "meeting_platform": "Zoom",
    "meeting_link": "https://zoom.us/j/123456789",
    "meeting_id": "123 456 789",
    "meeting_password": "gs2024",
    "interviewer_id": "uuid",
    "interviewer_name": "Dr. Jane Wilson",
    "student_email": "john.doe@email.com",
    "student_name": "John Doe",
    "status": "scheduled",
    "email_sent": true,
    "email_sent_at": "2026-01-20T15:00:00Z",
    "scheduled_by": "uuid",
    "created_at": "2026-01-20T14:50:00Z"
  }
}
```

---

### 5.2 Schedule Interview

**Endpoint:** `POST /gs-assessment/{application_id}/interview/schedule`

**Description:** Creates interview appointment and sends email to student

**Request Body:**

```json
{
  "interview_title": "GS Assessment Interview - John Doe",
  "interview_date": "2026-01-25",
  "interview_time": "14:00",
  "duration_minutes": 30,
  "interviewer_id": "uuid",
  "timezone": "Australia/Melbourne",
  "send_email": true
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "interview_title": "GS Assessment Interview - John Doe",
    "interview_datetime": "2026-01-25T14:00:00+11:00",
    "meeting_link": "https://zoom.us/j/123456789",
    "meeting_id": "123 456 789",
    "meeting_password": "gs2024",
    "status": "scheduled",
    "email_sent": true,
    "email_sent_at": "2026-01-21T14:00:00Z"
  },
  "message": "Interview scheduled successfully. Email sent to student."
}
```

**Post-Actions:**
1. Create Zoom meeting (via Zoom API)
2. Send email to student with meeting details
3. Send calendar invite (.ics file)
4. Complete Stage 3 automatically
5. Advance to Stage 4

**Validation:**
- Interview date must be in future
- Interviewer must be valid staff member
- Stage 2 must be completed first

---

### 5.3 Reschedule Interview

**Endpoint:** `PATCH /gs-assessment/{application_id}/interview/reschedule`

**Description:** Reschedules existing interview

**Request Body:**

```json
{
  "new_date": "2026-01-26",
  "new_time": "10:00",
  "reason": "Student requested different time",
  "send_notification": true
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "interview_datetime": "2026-01-26T10:00:00+11:00",
    "status": "rescheduled",
    "reschedule_count": 1,
    "reschedule_reason": "Student requested different time",
    "original_datetime": "2026-01-25T14:00:00+11:00"
  },
  "message": "Interview rescheduled. Notification sent to student."
}
```

---

### 5.4 Cancel Interview

**Endpoint:** `DELETE /gs-assessment/{application_id}/interview`

**Description:** Cancels scheduled interview

**Request Body:**

```json
{
  "reason": "Application withdrawn",
  "notify_student": true
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Interview cancelled successfully"
}
```

---

## 6. Interview Process (Stage 4)

### 6.1 Start Interview

**Endpoint:** `POST /gs-assessment/{application_id}/interview/start`

**Description:** Marks interview as in progress

**Request Body:**

```json
{
  "started_at": "2026-01-25T14:05:00+11:00"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "status": "in_progress",
    "started_at": "2026-01-25T14:05:00+11:00"
  },
  "message": "Interview started"
}
```

---

### 6.2 Complete Interview

**Endpoint:** `POST /gs-assessment/{application_id}/interview/complete`

**Description:** Marks interview as completed and records outcome

**Request Body:**

```json
{
  "student_attended": true,
  "interview_notes": "Student showed strong understanding of course requirements...",
  "recording_url": "https://zoom.us/rec/share/abc123...",
  "completed_at": "2026-01-25T14:35:00+11:00"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "status": "completed",
    "student_attended": true,
    "completed_at": "2026-01-25T14:35:00+11:00",
    "stage_4_completed": true
  },
  "message": "Interview completed. Stage 4 finished. Moved to Stage 5."
}
```

**Post-Actions:**
1. Complete Stage 4 automatically
2. Advance to Stage 5 (Staff Assessment)
3. Log activity in timeline

---

### 6.3 Mark No-Show

**Endpoint:** `POST /gs-assessment/{application_id}/interview/no-show`

**Description:** Records that student did not attend

**Request Body:**

```json
{
  "notes": "Student did not join the meeting",
  "reschedule_offered": true
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "status": "no_show",
    "student_attended": false
  },
  "message": "Interview marked as no-show"
}
```

---

## 7. Staff Assessment Form (Stage 5)

### 7.1 Get Staff Assessment

**Endpoint:** `GET /gs-assessment/{application_id}/staff-assessment`

**Description:** Retrieves staff assessment form data

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "given_name": "John",
    "family_name": "Doe",
    "date_of_birth": "1998-05-15",
    "reference_number": "APP-2024-001",
    "passport_number": "P12345678",
    "email": "john.doe@email.com",
    "stage1_questions": [
      {
        "id": "q1",
        "question": "Have you explained the academic entry requirements...",
        "answer": "yes",
        "evidence_verified": true,
        "notes": "Discussed in detail during pre-assessment"
      }
      // ... 7 questions total
    ],
    "stage2_questions": [
      {
        "id": "s2q1",
        "question": "Has the student provided a signed letter of offer...",
        "answer": "yes",
        "evidence_verified": true,
        "approval_status": "approved",
        "notes": "Letter verified"
      }
      // ... 6 questions total
    ],
    "additional_comments": "Student demonstrates strong commitment...",
    "recommendation": "approved",
    "conditions": null,
    "risk_level": "low",
    "status": "completed",
    "completed_by": "uuid",
    "completed_at": "2026-01-26T16:00:00Z"
  }
}
```

---

### 7.2 Save Staff Assessment (Draft)

**Endpoint:** `POST /gs-assessment/{application_id}/staff-assessment/save`

**Description:** Saves staff assessment as draft

**Request Body:**

```json
{
  "stage1_questions": [
    {
      "id": "q1",
      "answer": "yes",
      "evidence_verified": true,
      "notes": "Requirements explained"
    },
    {
      "id": "q2",
      "answer": "yes",
      "evidence_verified": true,
      "notes": "IELTS 7.0 overall"
    }
    // ... can be partial
  ],
  "stage2_questions": [],
  "additional_comments": "",
  "status": "draft"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "draft",
    "updated_at": "2026-01-26T10:30:00Z"
  },
  "message": "Staff assessment saved as draft"
}
```

---

### 7.3 Submit Staff Assessment

**Endpoint:** `POST /gs-assessment/{application_id}/staff-assessment/submit`

**Description:** Submits complete staff assessment with final decision

**Request Body:**

```json
{
  "stage1_questions": [
    {
      "id": "q1",
      "answer": "yes",
      "evidence_verified": true,
      "notes": "Academic requirements thoroughly explained"
    },
    {
      "id": "q2",
      "answer": "yes",
      "evidence_verified": true,
      "notes": "IELTS 7.0 overall - meets requirements"
    },
    {
      "id": "q3",
      "answer": "yes",
      "evidence_verified": true,
      "notes": "Study details, fees, and career paths discussed"
    },
    {
      "id": "q4",
      "answer": "no",
      "evidence_verified": false,
      "notes": "Not applicable - no RPL requested"
    },
    {
      "id": "q5",
      "answer": "yes",
      "evidence_verified": true,
      "notes": "Computer Science background aligns with Master's program"
    },
    {
      "id": "q6",
      "answer": "no",
      "evidence_verified": true,
      "notes": "No gaps - continuous employment"
    },
    {
      "id": "q7",
      "answer": "no",
      "evidence_verified": true,
      "notes": "No previous exclusions"
    }
  ],
  "stage2_questions": [
    {
      "id": "s2q1",
      "answer": "yes",
      "evidence_verified": true,
      "approval_status": "approved",
      "notes": "Signed offer letter on file"
    },
    {
      "id": "s2q2",
      "answer": "yes",
      "evidence_verified": true,
      "approval_status": "approved",
      "notes": "Strong understanding demonstrated in interview"
    },
    {
      "id": "s2q3",
      "answer": "yes",
      "evidence_verified": true,
      "approval_status": "approved",
      "notes": "Financial documents verify $60,000+ capacity"
    },
    {
      "id": "s2q4",
      "answer": "yes",
      "evidence_verified": true,
      "approval_status": "approved",
      "notes": "Clear GTE intentions - return to home country after studies"
    },
    {
      "id": "s2q5",
      "answer": "yes",
      "evidence_verified": true,
      "approval_status": "approved",
      "notes": "No previous visa issues"
    },
    {
      "id": "s2q6",
      "answer": "yes",
      "evidence_verified": true,
      "approval_status": "approved",
      "notes": "Highly suitable candidate"
    }
  ],
  "additional_comments": "Excellent candidate with strong academic background and clear study intentions. Recommended for approval.",
  "recommendation": "approved",
  "conditions": null,
  "risk_level": "low",
  "final_decision": "approved",
  "decision_rationale": "All assessment criteria met. Strong GTE case."
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "completed",
    "recommendation": "approved",
    "final_decision": "approved",
    "completed_by": "uuid",
    "completed_at": "2026-01-26T16:00:00Z",
    "stage_5_completed": true,
    "gs_assessment_completed": true
  },
  "message": "Staff assessment submitted. GS Assessment completed with APPROVED status."
}
```

**Post-Actions:**
1. Complete Stage 5
2. Update main GS Assessment status
3. Update application status to 'gs_assessment_completed'
4. Trigger offer letter generation workflow
5. Send notification to student (if approved)
6. Log activity in timeline

**Validation:**
- All 7 Stage 1 questions must be answered
- All 6 Stage 2 questions must be answered
- All Stage 2 questions must have approval_status
- Recommendation must be provided
- Final decision must match recommendation (or have override reason)

---

### 7.4 Update Staff Assessment Decision

**Endpoint:** `PATCH /gs-assessment/{application_id}/staff-assessment/decision`

**Description:** Updates final decision (for revisions or manager overrides)

**Request Body:**

```json
{
  "final_decision": "not_approved",
  "decision_rationale": "Insufficient financial capacity demonstrated",
  "override_reason": "Manager review - additional documentation required"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "final_decision": "not_approved",
    "decision_made_by": "uuid",
    "decision_made_at": "2026-01-27T09:00:00Z",
    "updated_at": "2026-01-27T09:00:00Z"
  },
  "message": "Staff assessment decision updated"
}
```

---

## 8. Complete Workflow & Status Endpoints

### 8.1 Get Complete GS Assessment Progress

**Endpoint:** `GET /gs-assessment/{application_id}/progress`

**Description:** Retrieves detailed progress of all stages

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "application_id": "uuid",
    "current_stage": 5,
    "overall_status": "approved",
    "overall_progress_percentage": 100,
    "stages": [
      {
        "stage_number": 1,
        "stage_name": "Document Collection",
        "status": "completed",
        "completed_at": "2026-01-15T14:20:00Z",
        "progress": {
          "documents_completed": 9,
          "documents_total": 9,
          "percentage": 100
        }
      },
      {
        "stage_number": 2,
        "stage_name": "Declaration Forms",
        "status": "completed",
        "completed_at": "2026-01-18T09:15:00Z",
        "progress": {
          "student_declaration": "submitted",
          "agent_declaration": "submitted"
        }
      },
      {
        "stage_number": 3,
        "stage_name": "Interview Scheduling",
        "status": "completed",
        "completed_at": "2026-01-20T15:00:00Z",
        "progress": {
          "interview_scheduled": true,
          "interview_date": "2026-01-25"
        }
      },
      {
        "stage_number": 4,
        "stage_name": "Interview Process",
        "status": "completed",
        "completed_at": "2026-01-25T14:35:00Z",
        "progress": {
          "interview_completed": true,
          "student_attended": true
        }
      },
      {
        "stage_number": 5,
        "stage_name": "Staff Assessment",
        "status": "completed",
        "completed_at": "2026-01-26T16:00:00Z",
        "progress": {
          "assessment_submitted": true,
          "recommendation": "approved",
          "final_decision": "approved"
        }
      }
    ],
    "final_outcome": {
      "decision": "approved",
      "decided_by": "Dr. Jane Wilson",
      "decided_at": "2026-01-26T16:00:00Z",
      "next_action": "Generate offer letter"
    }
  }
}
```

---

### 8.2 Get All GS Assessments (Staff Dashboard)

**Endpoint:** `GET /gs-assessment/list`

**Description:** Lists all GS assessments with filtering

**Query Parameters:**
- `status` (optional): Filter by overall_status
- `current_stage` (optional): Filter by current stage (1-5)
- `date_from` (optional): Filter created after date
- `date_to` (optional): Filter created before date
- `page` (default: 1)
- `limit` (default: 20)
- `sort_by` (default: created_at)
- `sort_order` (default: desc)

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "assessments": [
      {
        "id": "uuid",
        "application_id": "uuid",
        "reference_number": "APP-2024-001",
        "student_name": "John Doe",
        "current_stage": 5,
        "overall_status": "approved",
        "created_at": "2026-01-10T08:00:00Z",
        "updated_at": "2026-01-26T16:00:00Z"
      }
      // ... more assessments
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 20,
      "total_pages": 8
    },
    "summary": {
      "in_progress": 45,
      "approved": 80,
      "not_approved": 20,
      "on_hold": 5
    }
  }
}
```

---

### 8.3 Get GS Assessment Statistics

**Endpoint:** `GET /gs-assessment/statistics`

**Description:** Returns statistical data for dashboards

**Query Parameters:**
- `date_from` (optional)
- `date_to` (optional)

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "total_assessments": 150,
    "by_status": {
      "in_progress": 45,
      "approved": 80,
      "not_approved": 20,
      "on_hold": 5
    },
    "by_stage": {
      "stage_1": 15,
      "stage_2": 10,
      "stage_3": 8,
      "stage_4": 7,
      "stage_5": 5,
      "completed": 105
    },
    "average_completion_time_days": 12.5,
    "approval_rate_percentage": 80.0,
    "interviews_scheduled_this_month": 25,
    "pending_staff_assessments": 5
  }
}
```

---

## Workflow Logic

### Stage Progression Rules

#### Stage 1 → Stage 2

**Trigger:** All 9 documents marked as "completed"

**Automatic Actions:**
1. Set `stage_1_completed = true`
2. Set `stage_1_completed_at = NOW()`
3. Set `current_stage = 2`
4. Create notification: "Stage 1 complete. Please proceed to Declaration Forms."

---

#### Stage 2 → Stage 3

**Trigger:** Both student AND agent declarations submitted

**Manual Action:** Staff clicks "Complete Stage 2" button

**Validation:**
- `student_declaration.status = 'submitted'`
- `agent_declaration.status = 'submitted'`

**Actions:**
1. Set `stage_2_completed = true`
2. Set `stage_2_completed_at = NOW()`
3. Set `current_stage = 3`
4. Create notification: "Declarations complete. Schedule interview."

---

#### Stage 3 → Stage 4

**Trigger:** Interview scheduled with valid date/time

**Automatic Actions:**
1. Set `stage_3_completed = true`
2. Set `stage_3_completed_at = NOW()`
3. Set `current_stage = 4`
4. Send interview invitation email to student
5. Create Zoom meeting
6. Create notification: "Interview scheduled for [DATE]"

---

#### Stage 4 → Stage 5

**Trigger:** Interview marked as "completed" with notes

**Automatic Actions:**
1. Set `stage_4_completed = true`
2. Set `stage_4_completed_at = NOW()`
3. Set `current_stage = 5`
4. Create notification: "Interview complete. Begin staff assessment."

---

#### Stage 5 → Completion

**Trigger:** Staff assessment submitted with final decision

**Automatic Actions:**
1. Set `stage_5_completed = true`
2. Set `stage_5_completed_at = NOW()`
3. Set `overall_status = final_decision` ('approved' or 'not_approved')
4. Update main application status
5. If approved:
   - Trigger offer letter generation
   - Send congratulations email to student
6. If not approved:
   - Send rejection notification (if configured)
7. Create notification: "GS Assessment completed: [DECISION]"

---

### Stage Navigation Rules

**Frontend Stage Navigation:**

Users can click on previous stages to review, but cannot:
- Skip ahead to locked stages
- Edit completed stages (view-only)
- Complete stages out of order

**Backend Validation:**

```python
def can_access_stage(current_stage: int, requested_stage: int) -> bool:
    # Can always view current or previous stages
    if requested_stage <= current_stage:
        return True
    
    # Cannot access future locked stages
    return False

def can_complete_stage(stage: int, assessment: GSAssessment) -> tuple[bool, str]:
    # Must complete stages in order
    if stage != assessment.current_stage:
        return False, "Can only complete the current active stage"
    
    # Stage-specific validation
    if stage == 1:
        if not all_documents_completed():
            return False, "All 9 documents must be completed"
    
    elif stage == 2:
        if not student_declaration_submitted():
            return False, "Student declaration not submitted"
        if not agent_declaration_submitted():
            return False, "Agent declaration not submitted"
    
    elif stage == 3:
        if not interview_scheduled():
            return False, "Interview must be scheduled"
    
    elif stage == 4:
        if not interview_completed():
            return False, "Interview must be completed"
    
    elif stage == 5:
        if not staff_assessment_submitted():
            return False, "Staff assessment must be submitted"
    
    return True, "Stage can be completed"
```

---

## Validation Rules

### Document Upload Validation

```python
ALLOWED_FILE_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def validate_document_upload(file):
    if file.size > MAX_FILE_SIZE:
        raise ValidationError("File size exceeds 10MB limit")
    
    if file.content_type not in ALLOWED_FILE_TYPES:
        raise ValidationError("File type not allowed")
    
    # Scan for viruses (integrate with antivirus service)
    if not virus_scan_clean(file):
        raise ValidationError("File failed security scan")
    
    return True
```

---

### Student Declaration Validation

**Required Fields:**

```python
REQUIRED_STUDENT_DECLARATION_FIELDS = [
    'first_name',
    'last_name',
    'date_of_birth',
    'student_id',
    'currently_in_australia',
    'intend_to_apply_student_visa',
    'visa_refused_or_cancelled',
    'current_situation',
    'reasons_for_course',
    'career_benefits',
    'reason_for_student_visa',
    'campus_location',
    'intended_suburb',
    'knowledge_about_australia',
    'travel_applicant',
    'tuition_applicant',
    'oshc_applicant',
    'living_expenses_applicant',
    'applicant_full_name',
    'applicant_signature_date'
]

# Conditional Required Fields
if currently_in_australia == True:
    REQUIRED_FIELDS.append('current_visa_document_url')

if visa_refused_or_cancelled == True:
    REQUIRED_FIELDS.extend(['visa_refusal_explanation', 'visa_refusal_document_url'])

if is_married == True:
    REQUIRED_FIELDS.append('marriage_certificate_url')

if has_children == True:
    REQUIRED_FIELDS.append('children_birth_certificates_url')

if has_relatives_in_australia == True:
    REQUIRED_FIELDS.extend([
        'relatives_are_citizens',
        'relationship_details',
        'intend_to_live_with_relatives'
    ])
```

**Data Type Validation:**

```python
def validate_student_declaration(data: dict) -> bool:
    # Date validations
    if data['date_of_birth'] > date.today():
        raise ValidationError("Date of birth cannot be in the future")
    
    if data['applicant_signature_date'] > date.today():
        raise ValidationError("Signature date cannot be in the future")
    
    # Age validation (must be 18+)
    age = calculate_age(data['date_of_birth'])
    if age < 18:
        raise ValidationError("Applicant must be 18 years or older")
    
    # Financial validation (must be positive numbers)
    financial_fields = [
        'travel_applicant', 'tuition_applicant',
        'oshc_applicant', 'living_expenses_applicant'
    ]
    for field in financial_fields:
        if data.get(field, 0) < 0:
            raise ValidationError(f"{field} cannot be negative")
    
    # Total financial capacity check
    total_capacity = sum([
        data.get('travel_applicant', 0),
        data.get('tuition_applicant', 0),
        data.get('oshc_applicant', 0),
        data.get('living_expenses_applicant', 0)
    ])
    
    if total_capacity < 21041:  # Minimum per DHA requirements
        raise ValidationError("Total financial capacity below minimum requirement")
    
    return True
```

---

### Agent Declaration Validation

All student declaration validations apply, plus:

```python
ADDITIONAL_AGENT_FIELDS = [
    'agent_agency_name',
    'agent_counsellor_name',
    'agent_signature_date',
    'student_declaration_verified'
]

def validate_agent_declaration(data: dict) -> bool:
    # Run student validation first
    validate_student_declaration(data)
    
    # Agent-specific validation
    if not data.get('student_declaration_verified'):
        raise ValidationError("Agent must verify student declaration")
    
    if data['agent_signature_date'] > date.today():
        raise ValidationError("Agent signature date cannot be in the future")
    
    return True
```

---

### Interview Scheduling Validation

```python
def validate_interview_scheduling(data: dict) -> bool:
    interview_datetime = datetime.combine(
        data['interview_date'],
        data['interview_time']
    )
    
    # Must be in future
    if interview_datetime <= datetime.now():
        raise ValidationError("Interview must be scheduled for future date/time")
    
    # Must be during business hours (9 AM - 5 PM Melbourne time)
    melbourne_tz = pytz.timezone('Australia/Melbourne')
    interview_local = interview_datetime.astimezone(melbourne_tz)
    
    if interview_local.hour < 9 or interview_local.hour >= 17:
        raise ValidationError("Interview must be during business hours (9 AM - 5 PM)")
    
    # Cannot be on weekend
    if interview_local.weekday() >= 5:  # Saturday = 5, Sunday = 6
        raise ValidationError("Interview cannot be scheduled on weekends")
    
    # Check interviewer availability
    if not is_interviewer_available(data['interviewer_id'], interview_datetime):
        raise ValidationError("Interviewer not available at this time")
    
    return True
```

---

### Staff Assessment Validation

```python
def validate_staff_assessment(data: dict) -> bool:
    # Validate Stage 1 Questions (7 required)
    stage1_questions = data.get('stage1_questions', [])
    if len(stage1_questions) != 7:
        raise ValidationError("All 7 Stage 1 questions must be answered")
    
    for q in stage1_questions:
        if not q.get('answer'):
            raise ValidationError(f"Question {q['id']} must be answered")
        if q['answer'] not in ['yes', 'no']:
            raise ValidationError(f"Question {q['id']} answer must be yes or no")
    
    # Validate Stage 2 Questions (6 required)
    stage2_questions = data.get('stage2_questions', [])
    if len(stage2_questions) != 6:
        raise ValidationError("All 6 Stage 2 questions must be answered")
    
    for q in stage2_questions:
        if not q.get('answer'):
            raise ValidationError(f"Question {q['id']} must be answered")
        if not q.get('approval_status'):
            raise ValidationError(f"Question {q['id']} must have approval status")
        if q['approval_status'] not in ['approved', 'not_approved', 'not_applicable']:
            raise ValidationError(f"Invalid approval status for {q['id']}")
    
    # Validate recommendation
    if not data.get('recommendation'):
        raise ValidationError("Recommendation is required")
    if data['recommendation'] not in ['approved', 'not_approved', 'conditional_approval']:
        raise ValidationError("Invalid recommendation value")
    
    # Validate final decision matches recommendation (unless override)
    if data.get('final_decision') and data['final_decision'] != data['recommendation']:
        if not data.get('decision_rationale'):
            raise ValidationError("Decision rationale required when overriding recommendation")
    
    # If conditional approval, conditions must be specified
    if data['recommendation'] == 'conditional_approval' and not data.get('conditions'):
        raise ValidationError("Conditions must be specified for conditional approval")
    
    return True
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "date_of_birth",
        "message": "Date of birth cannot be in the future"
      },
      {
        "field": "travel_applicant",
        "message": "Travel cost cannot be negative"
      }
    ]
  },
  "timestamp": "2026-01-21T12:00:00Z",
  "request_id": "req_abc123xyz"
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request data validation failed |
| `NOT_FOUND` | 404 | Resource not found |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `CONFLICT` | 409 | Resource state conflict |
| `STAGE_LOCKED` | 423 | Stage is locked |
| `STAGE_ORDER_ERROR` | 400 | Stages must be completed in order |
| `INCOMPLETE_STAGE` | 400 | Current stage not complete |
| `FILE_TOO_LARGE` | 413 | File exceeds size limit |
| `INVALID_FILE_TYPE` | 415 | File type not allowed |
| `INTERVIEW_CONFLICT` | 409 | Interview time conflict |
| `INTERNAL_ERROR` | 500 | Server error |

### Error Handling Examples

```python
# Stage locked error
{
  "success": false,
  "error": {
    "code": "STAGE_LOCKED",
    "message": "Cannot access Stage 4. Complete Stage 3 first.",
    "details": {
      "current_stage": 3,
      "requested_stage": 4,
      "stage_3_completed": false
    }
  }
}

# File upload error
{
  "success": false,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "File size exceeds 10MB limit",
    "details": {
      "file_size": 15728640,
      "max_size": 10485760,
      "size_exceeded_by": 5242880
    }
  }
}

# Interview conflict error
{
  "success": false,
  "error": {
    "code": "INTERVIEW_CONFLICT",
    "message": "Interviewer already has meeting at this time",
    "details": {
      "requested_time": "2026-01-25T14:00:00+11:00",
      "conflicting_interview": "APP-2024-055",
      "interviewer": "Dr. Jane Wilson"
    }
  }
}
```

---

## Security & Authentication

### JWT Authentication

**Required Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Payload:**

```json
{
  "user_id": "uuid",
  "email": "staff@churchill.edu.au",
  "role": "gs_staff",
  "permissions": ["gs_assessment:read", "gs_assessment:write"],
  "exp": 1706745600,
  "iat": 1706659200
}
```

### Role-Based Access Control (RBAC)

**Roles:**

| Role | Permissions |
|------|-------------|
| `student` | View own declarations only |
| `agent` | Submit agent declarations, view client applications |
| `gs_staff` | Full read/write on GS assessments |
| `gs_manager` | All staff permissions + override decisions |
| `admin` | Full system access |

**Permission Matrix:**

| Action | Student | Agent | GS Staff | GS Manager | Admin |
|--------|---------|-------|----------|------------|-------|
| View GS Assessment | Own only | Clients only | All | All | All |
| Upload Documents | Own only | Clients only | All | All | All |
| Submit Student Declaration | Yes | On behalf | N/A | N/A | Yes |
| Submit Agent Declaration | No | Yes | N/A | N/A | Yes |
| Schedule Interview | No | No | Yes | Yes | Yes |
| Complete Interview | No | No | Yes | Yes | Yes |
| Submit Staff Assessment | No | No | Yes | Yes | Yes |
| Override Decision | No | No | No | Yes | Yes |
| View Statistics | No | No | Yes | Yes | Yes |

### API Security Measures

1. **Rate Limiting:**
   - 100 requests per minute per user
   - 1000 requests per hour per IP

2. **File Upload Security:**
   - Virus scanning (ClamAV integration)
   - File type validation
   - File size limits
   - Secure file storage with access controls

3. **Data Encryption:**
   - TLS 1.3 for transport
   - Encrypted file storage
   - Sensitive fields encrypted at rest

4. **Audit Logging:**
   - All GS Assessment actions logged
   - User ID, timestamp, action, IP address
   - Immutable audit trail

5. **Input Sanitization:**
   - SQL injection prevention (parameterized queries)
   - XSS protection
   - CSRF tokens for state-changing operations

---

## File Upload Handling

### S3 Configuration

**Bucket Structure:**

```
churchill-university-documents/
├── gs-assessments/
│   ├── {application_id}/
│   │   ├── documents/
│   │   │   ├── document_1_passport.pdf
│   │   │   ├── document_2_transcripts.pdf
│   │   │   └── ...
│   │   ├── student-declaration/
│   │   │   ├── visa_document.pdf
│   │   │   ├── marriage_certificate.pdf
│   │   │   └── ...
│   │   ├── agent-declaration/
│   │   │   └── ...
│   │   └── interview/
│   │       └── recording_2026-01-25.mp4
```

### Upload Process

```python
def upload_file_to_s3(file, application_id: str, category: str) -> str:
    """
    Uploads file to S3 and returns secure URL
    
    Args:
        file: Uploaded file object
        application_id: Application UUID
        category: 'documents', 'student-declaration', 'agent-declaration', 'interview'
    
    Returns:
        str: Secure S3 URL
    """
    # Generate unique filename
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    file_extension = file.filename.split('.')[-1]
    safe_filename = f"{timestamp}_{uuid4().hex[:8]}.{file_extension}"
    
    # S3 key path
    s3_key = f"gs-assessments/{application_id}/{category}/{safe_filename}"
    
    # Upload with metadata
    s3_client.upload_fileobj(
        file,
        bucket_name='churchill-university-documents',
        key=s3_key,
        ExtraArgs={
            'ContentType': file.content_type,
            'Metadata': {
                'application_id': application_id,
                'uploaded_by': current_user.id,
                'uploaded_at': datetime.now().isoformat()
            },
            'ServerSideEncryption': 'AES256'
        }
    )
    
    # Generate presigned URL (expires in 7 days)
    url = s3_client.generate_presigned_url(
        'get_object',
        Params={
            'Bucket': 'churchill-university-documents',
            'Key': s3_key
        },
        ExpiresIn=604800  # 7 days
    )
    
    return url
```

### File Download

**Endpoint:** `GET /gs-assessment/{application_id}/files/{file_id}/download`

**Response:** Presigned S3 URL with 1-hour expiration

```json
{
  "success": true,
  "data": {
    "download_url": "https://s3.amazonaws.com/churchill-university-documents/...",
    "expires_at": "2026-01-21T13:00:00Z",
    "file_name": "passport_john_doe.pdf",
    "file_size": 1024000
  }
}
```

---

## Email Notifications

### Interview Invitation Email

**Trigger:** Interview scheduled (Stage 3 completion)

**Template:**

```
Subject: GS Assessment Interview Scheduled - Churchill University

Dear [Student Name],

Your Genuine Student (GS) Assessment interview has been scheduled for your application to Churchill University.

Interview Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 Date: [Interview Date]
🕐 Time: [Interview Time] (Melbourne Time)
⏱️ Duration: 30 minutes
🎥 Platform: Zoom

Join Interview:
Meeting Link: [Zoom Link]
Meeting ID: [Meeting ID]
Password: [Password]

Interviewer: [Interviewer Name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

What to Prepare:
✓ Valid government-issued ID
✓ Knowledge of your chosen program
✓ Understanding of course requirements
✓ Career goals and study plans
✓ Financial capacity documentation
✓ Stable internet connection

Important Notes:
• Please join 5 minutes before the scheduled time
• Ensure you are in a quiet environment
• Have your documents ready for reference
• The interview will be recorded for assessment purposes

If you need to reschedule, please contact us at least 24 hours in advance.

📧 Email: admissions@churchill.edu.au
📞 Phone: +61 3 9999 8888

We look forward to speaking with you!

Best regards,
Churchill University Admissions Team
```

**Attachments:**
- Calendar invite (.ics file)

---

### Interview Reminder Email

**Trigger:** 24 hours before interview

**Template:**

```
Subject: Reminder: GS Assessment Interview Tomorrow

Dear [Student Name],

This is a friendly reminder that your GS Assessment interview is scheduled for tomorrow.

📅 Tomorrow, [Interview Date]
🕐 [Interview Time] (Melbourne Time)
🎥 Zoom Link: [Link]

See you tomorrow!

Best regards,
Churchill University
```

---

### GS Assessment Approved Email

**Trigger:** Stage 5 completed with "approved" decision

**Template:**

```
Subject: 🎉 GS Assessment Approved - Churchill University

Dear [Student Name],

Congratulations! Your Genuine Student (GS) Assessment has been approved.

Application Reference: [Reference Number]
Decision Date: [Decision Date]

Next Steps:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. ✅ Review your Letter of Offer (attached)
2. ✅ Sign and return the offer letter
3. ✅ Pay tuition deposit
4. ✅ Receive Confirmation of Enrolment (CoE)
5. ✅ Apply for student visa

Your personalized offer letter will be sent to you within 2 business days.

For questions, contact:
📧 admissions@churchill.edu.au
📞 +61 3 9999 8888

Welcome to Churchill University!

Best regards,
Admissions Team
```

---

### Email Configuration

**SMTP Settings:**

```python
EMAIL_CONFIG = {
    'smtp_host': 'smtp.sendgrid.net',
    'smtp_port': 587,
    'smtp_user': 'apikey',
    'smtp_password': os.getenv('SENDGRID_API_KEY'),
    'from_email': 'admissions@churchill.edu.au',
    'from_name': 'Churchill University Admissions'
}
```

**Email Queue:**

Use Celery for asynchronous email sending:

```python
@celery.task
def send_interview_invitation_email(interview_id: str):
    interview = get_interview_by_id(interview_id)
    
    email_data = {
        'to': interview.student_email,
        'subject': 'GS Assessment Interview Scheduled - Churchill University',
        'template': 'interview_invitation',
        'context': {
            'student_name': interview.student_name,
            'interview_date': interview.interview_date.strftime('%A, %B %d, %Y'),
            'interview_time': interview.interview_time.strftime('%I:%M %p'),
            'meeting_link': interview.meeting_link,
            'meeting_id': interview.meeting_id,
            'meeting_password': interview.meeting_password,
            'interviewer_name': interview.interviewer_name
        },
        'attachments': [
            create_calendar_invite(interview)
        ]
    }
    
    send_email(email_data)
```

---

## Implementation Checklist

### Database Setup

- [ ] Create all 6 database tables
- [ ] Set up foreign key relationships
- [ ] Create indexes for performance
- [ ] Set up database migrations (Alembic)
- [ ] Seed initial data for testing

### API Endpoints

**Stage 1 - Documents:**
- [ ] GET /gs-assessment/{application_id}/documents
- [ ] POST /gs-assessment/{application_id}/documents/{document_number}/upload
- [ ] PATCH /gs-assessment/{application_id}/documents/{document_number}/status
- [ ] POST /gs-assessment/{application_id}/documents/auto-complete

**Stage 2 - Declarations:**
- [ ] GET /gs-assessment/{application_id}/student-declaration
- [ ] POST /gs-assessment/{application_id}/student-declaration/save
- [ ] POST /gs-assessment/{application_id}/student-declaration/submit
- [ ] POST /gs-assessment/{application_id}/student-declaration/upload/{field_name}
- [ ] GET /gs-assessment/{application_id}/agent-declaration
- [ ] POST /gs-assessment/{application_id}/agent-declaration/save
- [ ] POST /gs-assessment/{application_id}/agent-declaration/submit
- [ ] GET /gs-assessment/{application_id}/stage-2/status

**Stage 3 - Interview Scheduling:**
- [ ] GET /gs-assessment/{application_id}/interview
- [ ] POST /gs-assessment/{application_id}/interview/schedule
- [ ] PATCH /gs-assessment/{application_id}/interview/reschedule
- [ ] DELETE /gs-assessment/{application_id}/interview

**Stage 4 - Interview Process:**
- [ ] POST /gs-assessment/{application_id}/interview/start
- [ ] POST /gs-assessment/{application_id}/interview/complete
- [ ] POST /gs-assessment/{application_id}/interview/no-show

**Stage 5 - Staff Assessment:**
- [ ] GET /gs-assessment/{application_id}/staff-assessment
- [ ] POST /gs-assessment/{application_id}/staff-assessment/save
- [ ] POST /gs-assessment/{application_id}/staff-assessment/submit
- [ ] PATCH /gs-assessment/{application_id}/staff-assessment/decision

**Core Endpoints:**
- [ ] POST /gs-assessment/initialize
- [ ] GET /gs-assessment/{application_id}
- [ ] PATCH /gs-assessment/{application_id}/stage
- [ ] GET /gs-assessment/{application_id}/progress
- [ ] GET /gs-assessment/list
- [ ] GET /gs-assessment/statistics

### Services Integration

- [ ] AWS S3 file storage setup
- [ ] Zoom API integration for meeting creation
- [ ] Email service (SendGrid) configuration
- [ ] Celery task queue for async operations
- [ ] ClamAV virus scanning integration

### Security

- [ ] JWT authentication implementation
- [ ] Role-based access control (RBAC)
- [ ] Rate limiting middleware
- [ ] CORS configuration
- [ ] Input validation & sanitization
- [ ] Audit logging system

### Testing

- [ ] Unit tests for all endpoints
- [ ] Integration tests for workflow
- [ ] Load testing for file uploads
- [ ] Security testing (OWASP Top 10)
- [ ] End-to-end testing with frontend

### Documentation

- [ ] API documentation (Swagger/OpenAPI)
- [ ] Postman collection
- [ ] Developer setup guide
- [ ] Deployment guide

---

## API Testing Examples

### Postman Collection Structure

```
GS Assessment API/
├── 1. Core Operations/
│   ├── Initialize GS Assessment
│   ├── Get GS Assessment
│   └── Update Stage
├── 2. Stage 1 - Documents/
│   ├── Get All Documents
│   ├── Upload Document
│   ├── Update Document Status
│   └── Auto-complete Documents
├── 3. Stage 2 - Declarations/
│   ├── Student Declaration/
│   │   ├── Get Student Declaration
│   │   ├── Save Draft
│   │   ├── Submit Declaration
│   │   └── Upload Supporting Doc
│   └── Agent Declaration/
│       ├── Get Agent Declaration
│       ├── Save Draft
│       └── Submit Declaration
├── 4. Stage 3 - Interview Scheduling/
│   ├── Schedule Interview
│   ├── Get Interview
│   ├── Reschedule Interview
│   └── Cancel Interview
├── 5. Stage 4 - Interview Process/
│   ├── Start Interview
│   ├── Complete Interview
│   └── Mark No-Show
├── 6. Stage 5 - Staff Assessment/
│   ├── Get Staff Assessment
│   ├── Save Draft
│   ├── Submit Assessment
│   └── Update Decision
└── 7. Reporting & Analytics/
    ├── Get Progress
    ├── List All Assessments
    └── Get Statistics
```

---

## Sample cURL Requests

### Initialize GS Assessment

```bash
curl -X POST https://api.churchill.edu.au/api/v1/gs-assessment/initialize \
  -H "Authorization: Bearer {jwt_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "application_id": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

### Upload Document

```bash
curl -X POST https://api.churchill.edu.au/api/v1/gs-assessment/{application_id}/documents/1/upload \
  -H "Authorization: Bearer {jwt_token}" \
  -F "file=@/path/to/passport.pdf" \
  -F "notes=Valid passport copy"
```

### Submit Student Declaration

```bash
curl -X POST https://api.churchill.edu.au/api/v1/gs-assessment/{application_id}/student-declaration/submit \
  -H "Authorization: Bearer {jwt_token}" \
  -H "Content-Type: application/json" \
  -d @student_declaration.json
```

### Schedule Interview

```bash
curl -X POST https://api.churchill.edu.au/api/v1/gs-assessment/{application_id}/interview/schedule \
  -H "Authorization: Bearer {jwt_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "interview_title": "GS Assessment - John Doe",
    "interview_date": "2026-02-01",
    "interview_time": "14:00",
    "duration_minutes": 30,
    "interviewer_id": "660e8400-e29b-41d4-a716-446655440000",
    "send_email": true
  }'
```

---

## Appendix: Complete Request/Response Examples

### Complete Student Declaration Submission

**Request:**

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "date_of_birth": "1998-05-15",
  "student_id": "STU-2024-001",
  "currently_in_australia": true,
  "current_visa_document_url": "https://s3.../visa_20240115.pdf",
  "intend_to_apply_student_visa": true,
  "visa_refused_or_cancelled": false,
  "visa_refusal_explanation": null,
  "visa_refusal_document_url": null,
  "family_visa_refused_or_cancelled": false,
  "family_visa_refusal_document_url": null,
  "current_situation": "Currently working as a junior software developer in India with 2 years of experience. Completed Bachelor's in Computer Science in 2022.",
  "reasons_for_course": "I want to pursue a Master's degree in Computer Science to specialize in Artificial Intelligence and Machine Learning, which will help me transition into senior technical roles.",
  "career_benefits": "This qualification will enable me to work on advanced AI projects, qualify for senior developer positions, and potentially contribute to AI research in the future.",
  "other_information": "I have attended several online courses in ML and have personal projects on GitHub.",
  "study_history_in_australia_url": null,
  "reason_for_student_visa": "To study full-time at Churchill University and gain advanced knowledge in my field while experiencing Australian education system.",
  "is_married": false,
  "marriage_certificate_url": null,
  "has_children": false,
  "children_birth_certificates_url": null,
  "has_relatives_in_australia": true,
  "relatives_are_citizens": false,
  "relatives_visa_type": "Temporary Skilled Work visa (subclass 482)",
  "relationship_details": "My cousin lives in Melbourne and works as an accountant",
  "intend_to_live_with_relatives": false,
  "campus_location": "Melbourne",
  "intended_suburb": "Carlton",
  "knowledge_about_australia": "I have researched extensively about Melbourne's multicultural environment, public transport system, and student life. I'm aware of the academic expectations and living costs.",
  "travel_applicant": 2000.00,
  "travel_family": 0.00,
  "tuition_applicant": 35000.00,
  "tuition_family": 0.00,
  "oshc_applicant": 600.00,
  "oshc_family": 0.00,
  "living_expenses_applicant": 21041.00,
  "living_expenses_family": 0.00,
  "applicant_full_name": "John Doe",
  "applicant_signature_date": "2026-01-21"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440000",
    "gs_assessment_id": "660e8400-e29b-41d4-a716-446655440000",
    "application_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "submitted",
    "submitted_at": "2026-01-21T14:30:00Z",
    "created_at": "2026-01-20T10:00:00Z",
    "updated_at": "2026-01-21T14:30:00Z"
  },
  "message": "Student declaration submitted successfully"
}
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-21 | Initial comprehensive API requirements document |

---

## Support & Contact

For API implementation questions or clarifications, contact:

**Development Team:**
- Email: dev-team@churchill.edu.au
- Slack: #gs-assessment-api

**Project Manager:**
- Email: pm@churchill.edu.au

---

**End of Document**
