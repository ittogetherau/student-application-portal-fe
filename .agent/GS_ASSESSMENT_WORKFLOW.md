# GS Assessment Workflow - Complete Implementation Guide

## Overview
This document describes the complete 5-step GS (Genuine Student) Assessment workflow implemented in the Student Application Management System for Churchill University Staff Portal.

## Workflow Steps

### Step 1: Upload Required Documents (9 Documents)
**Status**: Can start immediately  
**Location**: GS Documents Tab

**Required Documents:**
1. Passport All Page Color Scanned or Certified Copy
2. Academic Color Scanned Or Certified Copy
3. Student Gap Evidence If Any
4. Financial / Banking Documents
5. Relationship Documents / Family Register
6. Income Proof / Source of Income
7. Tax Payment Documents If Applicable
8. Statement of Purpose
9. Other Documents
10. GS Screening Form (Genuine Student) - Special Document

**Actions Available:**
- Upload individual documents for each category
- Click "Auto-Fill All" to mark all 9 documents as completed (for demo/testing)
- View document details, download, or delete uploaded files

**Progress Tracking:**
- Shows completed/pending/not-started counts
- Circular progress indicator
- Progress bar for each step
- Real-time updates in the side GS Assessment card

**Completion Criteria:** All 9 documents must be marked as "Completed"

---

### Step 2: Complete Declaration Forms
**Status**: Unlocked when all 9 documents are completed  
**Location**: GS Documents Tab → Document #10 (GS Screening Form)

**Two Declaration Forms Required:**
1. **Student Declaration Form**
2. **Agent Declaration Form**

**Actions Available for Each Declaration:**

#### Send Declaration (Email Link Method)
- Click "Send" button next to Student/Agent Declaration
- System copies shareable link to clipboard
- Link format: `/track/gs-form/{referenceNumber}`
- Student/Agent receives email with link
- They complete the form independently
- Form auto-saves and marks declaration as complete

#### Fill on Behalf (Staff Entry Method)
- Click "Fill" button next to Student/Agent Declaration
- Opens inline GS Screening Form with breadcrumb navigation
- Staff fills out the form on behalf of student/agent
- Includes:
  - Applicant Details (Name, DOB, Student ID, Passport, Email)
  - Stage 1: Application Questions (7 YES/NO questions)
  - Stage 2: GTE Document Questions (6 YES/NO with evidence verification)
- Click "Submit & Complete" to save
- Automatically marks that declaration as "Completed"

**Additional Options:**
- "Copy Student Form Link" - Copies link to clipboard
- "View Only (Read-Only)" - Navigate to read-only form view

**Progress Tracking:**
- Each declaration shows checkbox status (Pending/Completed)
- Green checkmark appears when completed
- Both must be completed to proceed

**Completion Criteria:** Both Student AND Agent declarations must be completed

---

### Step 3: Schedule Interview
**Status**: Unlocked when both declarations are completed  
**Location**: GS Assessment Card (Sidebar)

**Process:**
1. Click "Schedule Interview" button
2. Dialog opens with two fields:
   - **Interview Title** (default: "GS Assessment Interview")
   - **Interview Date & Time** (datetime picker)
3. Click "Schedule Interview" to confirm
4. System integrates with Microsoft API (configured for future implementation)
5. Meeting invitation sent to student and staff

**Information Displayed:**
- Meeting title
- Formatted date and time
- Shows in GS Assessment card

**Completion Criteria:** Interview must be scheduled with valid date/time

---

### Step 4: Complete Interview
**Status**: Unlocked when interview is scheduled  
**Location**: GS Assessment Card (Sidebar) & GS Documents Tab

**Process:**
1. Conduct the scheduled interview with the student
2. Check the "Mark interview as completed" checkbox
3. System automatically:
   - Marks step as completed
   - Generates/displays interview recording link
   - Unlocks Staff Assessment Form

**Interview Recording:**
- Link appears immediately after marking complete
- Opens in new tab (example.com/interview-recording for demo)
- Shows meeting date
- Accessible from both GS Assessment card and GS Documents tab

**Completion Criteria:** Interview completed checkbox must be checked

---

### Step 5: Staff Assessment Form
**Status**: Unlocked when interview is completed  
**Location**: GS Documents Tab → "Complete Staff Assessment Form" button

**Process:**
1. Click "Complete Staff Assessment Form" in:
   - GS Assessment card sidebar, OR
   - GS Documents tab (appears when both declarations complete)
2. Opens comprehensive inline staff assessment form with breadcrumb navigation

**Staff Assessment Form Sections:**

#### Section A: Applicant Details (Read-Only Display)
- Given Name
- Family Name  
- Date of Birth
- Student ID
- Passport Number
- Email Address

#### Section B: Stage 1 - Application (7 Questions)
Each with YES/NO toggle and "Evidence Verified" checkbox:
1. Did the student complete the application themselves?
2. Did the agent complete sections on behalf of the student?
3. Are the answers provided for course selection reasonable?
4. Do the student's documents support the answers?
5. Did the student provide genuine supporting documents?
6. Is the student's education history consistent?
7. Are there any concerns about genuineness?

#### Section C: Stage 2 - GTE Document (6 Questions)
Each with YES/NO toggle, "Evidence Verified" checkbox, AND approval dropdown:
1. Is the student interview genuine?
2. Did the student demonstrate genuine intent?
3. Were the student's answers consistent?
4. Did the student provide satisfactory explanations?
5. Are there concerns about student's circumstances?
6. Does the student meet GTE requirements?

**Approval Options per Question:**
- Approved
- Not Approved
- Pending Review

#### Section D: Student GS Status (Final Decision)
- Radio buttons: **Approved** or **Not Approved**
- Must select one to enable submit

#### Section E: Notes and Remarks
- Optional text area for additional comments
- Staff can provide detailed reasoning

**Actions:**
- "Submit & Complete" button (disabled until GS Status selected)
- Saves all form data
- Triggers final decision workflow
- Updates application status
- Logs activity in timeline

**Completion Criteria:** 
- All questions answered
- Final GS Status selected (Approved or Not Approved)
- Form submitted successfully

---

## Visual Progress Tracking

### GS Assessment Card (Sidebar)
Shows all 5 steps with real-time status:

**Step Statuses:**
- 🟢 **Completed** - Green badge, checkmark icon
- 🟡 **In Progress** - Yellow badge, clock icon  
- ⚪ **Pending** - Gray badge, circle icon
- 🔒 **Locked** - Gray badge, circle icon (cannot interact)

**Step-by-Step Display:**

**Step 1: Upload Required Documents**
- Progress: X/9 documents
- Progress bar visualization
- "View Documents" button (when not complete)

**Step 2: Complete Declaration Forms**
- Student Declaration checkbox + Send/Fill buttons
- Agent Declaration checkbox + Send/Fill buttons
- Shows completion status for each

**Step 3: Schedule Interview**
- "Schedule Interview" button (enabled when Step 2 complete)
- Shows meeting title and date when scheduled

**Step 4: Complete Interview**  
- "Mark interview as completed" checkbox
- Interview Recording link (appears when checked)

**Step 5: Staff Assessment Form**
- "Complete Staff Assessment" button (enabled when Step 4 complete)
- Shows final decision when completed (Approved/Rejected)

---

## System Integration Points

### State Management
All workflow state managed in `/pages/staff/ApplicationReview.tsx`:
- `studentDeclarationCompleted` - Boolean
- `agentDeclarationCompleted` - Boolean  
- `meetingScheduled` - Boolean
- `meetingDate` - String (formatted date)
- `meetingTitle` - String
- `interviewCompleted` - Boolean
- `staffAssessmentCompleted` - Boolean
- `finalGSDecision` - 'approved' | 'rejected' | null
- `gsDocsProgress` - Object with completed/pending/notStarted/total

### Component Communication
- **GSAssessmentProgressCard** - Displays workflow steps and controls
- **GSDocumentsSection** - Manages document uploads and forms
- **GSScreeningForm** - Student/Agent declaration form
- **GSAssessmentStaffForm** - Final staff assessment form

### Callbacks
- `onDeclarationComplete(type)` - Called when declaration saved
- `onGSAssessmentComplete(status)` - Called when final decision made
- `onDocumentStatusChange(completed, pending, notStarted, total)` - Real-time document tracking
- `onScheduleInterview()` - Opens meeting scheduler dialog
- `onMarkInterviewComplete(boolean)` - Toggles interview completion
- `onOpenStaffAssessment()` - Navigates to staff assessment form

---

## User Journey

### Staff Member Workflow
1. Navigate to application in review queue
2. Click "Start GS Documentation" (if status allows)
3. Go to "GS Documents" tab
4. Upload all 9 required documents OR click "Auto-Fill All" for demo
5. Monitor progress in sidebar GS Assessment card
6. Once docs complete, send declaration forms OR fill on behalf
7. Wait for/complete both declarations
8. Click "Schedule Interview" and set date/time
9. Conduct interview with student
10. Mark interview as completed
11. Click "Complete Staff Assessment Form"
12. Fill comprehensive assessment form
13. Select final decision: Approved or Not Approved
14. Submit form
15. Application status updates automatically

### Student/Agent Workflow (Declaration Forms)
1. Receive email with form link from staff
2. Click link to open form
3. Complete their section of GS Screening Form
4. Submit form
5. Confirmation shown
6. Staff sees declaration marked as complete

---

## Testing the Workflow

### Quick Demo Flow
1. Open any application in Staff Portal
2. Start GS Documentation
3. Click "Auto-Fill All" button (marks all 9 docs as complete)
4. In GS Assessment card, click "Fill" for Student Declaration
5. Fill form and submit (marks student declaration complete)
6. Click "Fill" for Agent Declaration  
7. Fill form and submit (marks agent declaration complete)
8. Click "Schedule Interview"
9. Set title and date, click Schedule
10. Check "Mark interview as completed"
11. Interview recording link appears
12. Click "Complete Staff Assessment Form" button
13. Fill all sections of assessment form
14. Select "Approved" or "Not Approved"
15. Submit form
16. See final status in GS Assessment card

---

## Status Progression

The application status changes through these stages:
1. **Submitted** → Application Received
2. **Under Review** → Application Under Review
3. **GS Documents Pending** → GS in Process
4. **GS Interview Scheduled** → GS in Process
5. **GS Approved** → GS in Process  
6. **Offer Sent** → Awaiting Signatures
7. **COE Issued** → COE Issued
8. **Rejected** → Application Rejected (if GS not approved)

---

## Files Modified/Created

### Modified Files
- `/pages/staff/ApplicationReview.tsx` - Main application review page
- `/components/GSDocumentsSection.tsx` - Document management section

### Created Files
- `/components/GSAssessmentProgressCard.tsx` - 5-step progress card
- `/components/GSScreeningForm.tsx` - Student/Agent declaration form
- `/components/GSAssessmentStaffForm.tsx` - Comprehensive staff assessment form

---

## Key Features

✅ **Complete 5-Step Workflow** - From document upload to final decision  
✅ **Progressive Unlocking** - Steps unlock as previous steps complete  
✅ **Real-Time Status Tracking** - Visual progress indicators throughout  
✅ **Dual Form Entry** - Staff can fill forms on behalf OR send links  
✅ **Comprehensive Assessment** - Detailed staff evaluation form  
✅ **Breadcrumb Navigation** - Easy navigation between forms and main view  
✅ **Activity Logging** - All actions logged in application timeline  
✅ **Responsive Design** - Works on desktop and mobile  
✅ **Role-Based Access** - Staff-only functionality  
✅ **Microsoft API Integration** - Ready for meeting scheduler integration  

---

## Future Enhancements

- [ ] Actual Microsoft API integration for meeting scheduling
- [ ] Real file upload and storage
- [ ] Email notification system for declaration form links
- [ ] Video recording storage and playback
- [ ] PDF export of completed assessment forms
- [ ] Bulk operations for multiple applications
- [ ] Advanced filtering and search in document list
- [ ] Document OCR for automatic data extraction
- [ ] Signature capture for declarations
- [ ] Multi-language support

---

*Last Updated: January 20, 2026*
