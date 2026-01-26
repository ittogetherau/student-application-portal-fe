/**
 * GS Assessment Constants and Utilities
 *
 * This file contains step configurations and helper functions for the
 * 5-stage GS Assessment workflow.
 *
 * API Indexing (all 1-indexed):
 * - current_stage (GET response): 1=Documents, 2=Declarations, 3=Schedule, 4=Interview, 5=Assessment
 * - stage_to_complete (PATCH request): 1=Documents, 2=Declarations, 3=Schedule, 4=Interview, 5=Assessment
 *
 * Internally we convert to 0-indexed (0-4) for array access.
 */

// Step names matching the 5-stage workflow
export type GSStepName =
  | "documents"
  | "declarations"
  | "schedule"
  | "interview"
  | "assessment";

// Step configuration with labels
export interface GSStepConfig {
  name: GSStepName;
  label: string;
  description: string;
}

// The 5 GS Assessment steps in order
export const GS_STEPS: readonly GSStepConfig[] = [
  {
    name: "documents",
    label: "Documents",
    description: "Upload and review 9 required documents",
  },
  {
    name: "declarations",
    label: "Declarations",
    description: "Student and agent declarations",
  },
  {
    name: "schedule",
    label: "Schedule",
    description: "Schedule the GS interview",
  },
  {
    name: "interview",
    label: "Interview",
    description: "Conduct the interview",
  },
  {
    name: "assessment",
    label: "Assessment",
    description: "Staff assessment and final decision",
  },
] as const;

// Step progress state
export type GSStepState = "completed" | "active" | "inactive";

// Progress for a single step
export interface GSStepProgress {
  step: GSStepName;
  state: GSStepState;
  statusText?: string;
}

// GS Assessment data from API (after transformation from snake_case)
export interface GSAssessmentData {
  currentStage: number; // 0-indexed (0=Documents, 1=Declarations, etc.)
  stageCompletedAt: (string | null)[]; // Array of 5 timestamps
  updatedAt: string;
  // Document counts for UI display
  documentsApproved?: number;
  documentsTotal?: number;
  // Declaration statuses
  studentDeclarationStatus?: string;
  agentDeclarationStatus?: string;
}

/**
 * Derive status text for a step based on available data
 */
function deriveStatusText(
  stepName: GSStepName,
  data: GSAssessmentData | null | undefined
): string | undefined {
  if (!data) return undefined;

  if (stepName === "documents") {
    if (data.documentsApproved !== undefined && data.documentsTotal !== undefined) {
      return `${data.documentsApproved}/${data.documentsTotal} approved`;
    }
  }

  if (stepName === "declarations") {
    if (data.studentDeclarationStatus || data.agentDeclarationStatus) {
      const student = data.studentDeclarationStatus ?? "pending";
      const agent = data.agentDeclarationStatus ?? "pending";
      return `Student: ${student}, Agent: ${agent}`;
    }
  }

  return undefined;
}

/**
 * Derive progress for all 5 GS steps based on API data.
 *
 * Logic:
 * - A step is "completed" if its stageCompletedAt[index] is not null
 * - A step is "active" if its index equals currentStage
 * - Otherwise, step is "inactive"
 */
export function deriveAllStepsProgress(
  data: GSAssessmentData | null | undefined
): GSStepProgress[] {
  const currentStage = data?.currentStage ?? 0;

  return GS_STEPS.map((config, index) => {
    const isCompleted = data?.stageCompletedAt?.[index] !== null &&
                        data?.stageCompletedAt?.[index] !== undefined;

    let state: GSStepState;
    if (isCompleted) {
      state = "completed";
    } else if (index === currentStage) {
      state = "active";
    } else {
      state = "inactive";
    }

    return {
      step: config.name,
      state,
      statusText: deriveStatusText(config.name, data),
    };
  });
}

/**
 * Transform raw API response (snake_case) to GSAssessmentData (camelCase).
 *
 * API returns:
 * - current_stage: 1-indexed (1=Documents, 2=Declarations, 3=Schedule, 4=Interview, 5=Assessment)
 * - stage_to_complete: 1-indexed (1=Documents, 2=Declarations, etc.) - used in PATCH requests
 *
 * We convert current_stage to 0-indexed internally for array access.
 */
export function transformGSAssessmentData(
  raw: Record<string, unknown> | null | undefined
): GSAssessmentData | null {
  if (!raw) return null;

  // API returns current_stage as 1-indexed, convert to 0-indexed for internal use
  // Fresh assessment starts at current_stage=1 (Documents), we convert to 0
  const rawCurrentStage = typeof raw.current_stage === "number" ? raw.current_stage : 1;
  const currentStage = Math.max(0, rawCurrentStage - 1);

  return {
    currentStage,
    stageCompletedAt: [
      (raw.stage_1_completed_at as string | null) ?? null,
      (raw.stage_2_completed_at as string | null) ?? null,
      (raw.stage_3_completed_at as string | null) ?? null,
      (raw.stage_4_completed_at as string | null) ?? null,
      (raw.stage_5_completed_at as string | null) ?? null,
    ],
    updatedAt: (raw.updated_at as string) ?? new Date().toISOString(),
    // Optional document counts
    documentsApproved: typeof raw.documents_approved === "number"
      ? raw.documents_approved
      : undefined,
    documentsTotal: typeof raw.documents_total === "number"
      ? raw.documents_total
      : undefined,
    // Optional declaration statuses
    studentDeclarationStatus: typeof raw.student_declaration_status === "string"
      ? raw.student_declaration_status
      : undefined,
    agentDeclarationStatus: typeof raw.agent_declaration_status === "string"
      ? raw.agent_declaration_status
      : undefined,
  };
}

/**
 * Get step index from step name
 */
export function getStepIndex(stepName: GSStepName): number {
  return GS_STEPS.findIndex((s) => s.name === stepName);
}

/**
 * Get step config by name
 */
export function getStepConfig(stepName: GSStepName): GSStepConfig | undefined {
  return GS_STEPS.find((s) => s.name === stepName);
}

// ============================================================================
// GS Document Configuration
// ============================================================================

/**
 * Document status from API (snake_case)
 */
export type GSDocumentBackendStatus =
  | "not_started"
  | "uploaded"
  | "in_review"
  | "approved"
  | "rejected";

/**
 * Configuration for each of the 9 GS documents
 */
export interface GSDocumentConfig {
  number: number;
  title: string;
  description: string;
  acceptedFormats: string;
}

/**
 * The 9 required GS Assessment documents
 */
export const GS_DOCUMENT_CONFIGS: readonly GSDocumentConfig[] = [
  {
    number: 1,
    title: "Passport All Page Color Scanned or Certified Copy",
    description: "All pages of passport including blank pages, color scanned or certified",
    acceptedFormats: "PDF, JPG, PNG",
  },
  {
    number: 2,
    title: "Academic Color Scanned Or Certified Copy",
    description: "Academic transcripts, certificates, and mark sheets - color scanned or certified",
    acceptedFormats: "PDF, JPG, PNG",
  },
  {
    number: 3,
    title: "Student Gap Evidence If Any",
    description: "Documentation explaining any gaps in education or employment history",
    acceptedFormats: "PDF, JPG, PNG",
  },
  {
    number: 4,
    title: "Financial / Banking Documents",
    description: "Bank statements, fixed deposits, or other financial evidence",
    acceptedFormats: "PDF, JPG, PNG",
  },
  {
    number: 5,
    title: "Relationship Documents / Family Register",
    description: "Documents proving relationship with sponsor - family register, birth certificate",
    acceptedFormats: "PDF, JPG, PNG",
  },
  {
    number: 6,
    title: "Income Proof / Source of Income",
    description: "Salary slips, employment letter, business income proof, or other income evidence",
    acceptedFormats: "PDF, JPG, PNG",
  },
  {
    number: 7,
    title: "Tax Payment Documents If Applicable",
    description: "Tax returns, income tax certificates, or tax clearance documents",
    acceptedFormats: "PDF, JPG, PNG",
  },
  {
    number: 8,
    title: "Statement of Purpose",
    description: "Written statement explaining study goals and career plans",
    acceptedFormats: "PDF",
  },
  {
    number: 9,
    title: "Other Documents",
    description: "Any additional supporting documents",
    acceptedFormats: "PDF, JPG, PNG",
  },
] as const;

/**
 * Get document config by number (1-9)
 */
export function getDocumentConfig(documentNumber: number): GSDocumentConfig | undefined {
  return GS_DOCUMENT_CONFIGS.find((d) => d.number === documentNumber);
}

/**
 * Map backend status to UI-friendly label
 */
export function getDocumentStatusLabel(status: GSDocumentBackendStatus): string {
  switch (status) {
    case "approved":
      return "Approved";
    case "uploaded":
      return "Uploaded";
    case "in_review":
      return "Under Review";
    case "rejected":
      return "Rejected";
    case "not_started":
    default:
      return "Not Started";
  }
}

/**
 * File object within a document
 */
export interface GSDocumentFile {
  id: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string | null;
  uploadedAt: string | null;
}

/**
 * Document data structure from API (after transformation)
 */
export interface GSDocumentData {
  id: string;
  documentNumber: number;
  documentName: string; // From API (e.g., "Passport Copy", "Academic Transcripts")
  title: string; // Alias for documentName for backward compatibility
  status: GSDocumentBackendStatus;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  fileType: string | null;
  uploadedBy: string | null;
  uploadedAt: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  notes: string | null;
  files: GSDocumentFile[];
}

/**
 * Normalize status from API (handles uppercase/lowercase)
 */
function normalizeDocumentStatus(status: unknown): GSDocumentBackendStatus {
  if (typeof status !== "string") return "not_started";

  const normalized = status.toLowerCase() as GSDocumentBackendStatus;
  const validStatuses: GSDocumentBackendStatus[] = [
    "not_started",
    "uploaded",
    "in_review",
    "approved",
    "rejected",
  ];

  return validStatuses.includes(normalized) ? normalized : "not_started";
}

/**
 * Transform raw API file object to frontend format
 */
function transformGSDocumentFile(raw: Record<string, unknown>): GSDocumentFile {
  return {
    id: (raw.id as string) ?? "",
    fileUrl: (raw.file_url as string) ?? "",
    fileName: (raw.file_name as string) ?? "",
    fileSize: typeof raw.file_size === "number" ? raw.file_size : 0,
    fileType: (raw.file_type as string) ?? "",
    uploadedBy: (raw.uploaded_by as string | null) ?? null,
    uploadedAt: (raw.uploaded_at as string | null) ?? null,
  };
}

/**
 * Transform raw API document to frontend format
 */
export function transformGSDocument(
  raw: Record<string, unknown>
): GSDocumentData {
  const documentNumber = typeof raw.document_number === "number"
    ? raw.document_number
    : 1;
  const config = getDocumentConfig(documentNumber);

  // Use document_name from API, fallback to our config title
  const documentName = (raw.document_name as string) ?? config?.title ?? `Document ${documentNumber}`;

  // Transform files array
  const rawFiles = Array.isArray(raw.files) ? raw.files : [];
  const files = rawFiles.map((f) => transformGSDocumentFile(f as Record<string, unknown>));

  return {
    id: (raw.id as string) ?? `doc-${documentNumber}`,
    documentNumber,
    documentName,
    title: documentName, // Alias for backward compatibility
    status: normalizeDocumentStatus(raw.status),
    fileUrl: (raw.file_url as string | null) ?? null,
    fileName: (raw.file_name as string | null) ?? null,
    fileSize: typeof raw.file_size === "number" ? raw.file_size : null,
    fileType: (raw.file_type as string | null) ?? null,
    uploadedBy: (raw.uploaded_by as string | null) ?? null,
    uploadedAt: (raw.uploaded_at as string | null) ?? null,
    reviewedBy: (raw.reviewed_by as string | null) ?? null,
    reviewedAt: (raw.reviewed_at as string | null) ?? null,
    reviewNotes: (raw.review_notes as string | null) ?? null,
    notes: (raw.notes as string | null) ?? null,
    files,
  };
}

/**
 * Transform array of raw API documents
 * Always returns documents sorted by documentNumber (1-9)
 */
export function transformGSDocuments(
  raw: unknown[] | null | undefined
): GSDocumentData[] {
  if (!raw || !Array.isArray(raw)) {
    // Return default empty documents if no data
    return GS_DOCUMENT_CONFIGS.map((config) => ({
      id: `doc-${config.number}`,
      documentNumber: config.number,
      documentName: config.title,
      title: config.title,
      status: "not_started" as GSDocumentBackendStatus,
      fileUrl: null,
      fileName: null,
      fileSize: null,
      fileType: null,
      uploadedBy: null,
      uploadedAt: null,
      reviewedBy: null,
      reviewedAt: null,
      reviewNotes: null,
      notes: null,
      files: [],
    }));
  }

  // Transform and sort by documentNumber to ensure correct order (1-9)
  const transformed = raw.map((doc) => transformGSDocument(doc as Record<string, unknown>));
  return transformed.sort((a, b) => a.documentNumber - b.documentNumber);
}
