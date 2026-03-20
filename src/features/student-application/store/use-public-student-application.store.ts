import { create } from "zustand";

export type PublicStudentApplicationStatus =
  | "idle"
  | "validating"
  | "ready"
  | "expired";

type PublicStudentApplicationState = {
  enabled: boolean;
  token: string | null;
  applicationId: string | null;
  status: PublicStudentApplicationStatus;
  expiresAt: string | null;
  studentEmail: string | null;
  submittedByStudent: boolean | null;
  setSession: (payload: {
    token: string;
    applicationId?: string | null;
    status?: PublicStudentApplicationStatus;
    expiresAt?: string | null;
    studentEmail?: string | null;
    submittedByStudent?: boolean | null;
  }) => void;
  setStatus: (status: PublicStudentApplicationStatus) => void;
  setApplicationMeta: (payload: {
    studentEmail?: string | null;
    submittedByStudent?: boolean | null;
  }) => void;
  reset: () => void;
};

const initialState = {
  enabled: false,
  token: null,
  applicationId: null,
  status: "idle" as PublicStudentApplicationStatus,
  expiresAt: null,
  studentEmail: null,
  submittedByStudent: null,
};

export const usePublicStudentApplicationStore =
  create<PublicStudentApplicationState>()((set) => ({
    ...initialState,
    setSession: ({
      token,
      applicationId = null,
      status = "validating",
      expiresAt = null,
      studentEmail = null,
      submittedByStudent = null,
    }) =>
      set({
        enabled: true,
        token,
        applicationId,
        status,
        expiresAt,
        studentEmail,
        submittedByStudent,
      }),
    setStatus: (status) => set({ status }),
    setApplicationMeta: ({ studentEmail, submittedByStudent }) =>
      set((state) => ({
        studentEmail: studentEmail ?? state.studentEmail,
        submittedByStudent: submittedByStudent ?? state.submittedByStudent,
      })),
    reset: () => set(initialState),
  }));
