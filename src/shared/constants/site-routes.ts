type GS_TABS_TYPE =
  | "documents"
  | "declarations"
  | "schedule"
  | "interview"
  | "assessment";

export const siteRoutes = {
  home: "/",
  auth: {
    login: "/login",
    register: "/register",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
    signUp: "/sign-up",
    signUpAlt: "/signup",
  },
  student: {
    root: "/student",
    manageApplication: "/student/manage-application",
  },
  dashboard: {
    root: "/dashboard",
    application: {
      root: "/dashboard/application",
      filteredBySubAgent: (subAgentId: string) =>
        `/dashboard/application?subAgentId=${encodeURIComponent(subAgentId)}`,
      create: "/dashboard/application/manage-application",
      edit: (id: string) =>
        `/dashboard/application/manage-application?id=${id}&edit=true`,
      archived: "/dashboard/application/archived",
      id: {
        root: (id: string) => `/dashboard/application/${id}`,
        details: (id: string) => `/dashboard/application/${id}/details`,
        documents: (id: string) => `/dashboard/application/${id}/documents`,
        timeline: (id: string) => `/dashboard/application/${id}/timeline`,
        communication: (id: string) =>
          `/dashboard/application/${id}/communication`,
        gs: (id: string, tab?: GS_TABS_TYPE) =>
          `/dashboard/application/${id}/gs-process${tab ? `?gs_process_tab=${tab}` : ""}`,
        coe: (id: string) => `/dashboard/application/${id}/coe`,
      },
    },
    settings: {
      root: "/dashboard/settings",
      profile: "/dashboard/settings/profile",
      subAgents: "/dashboard/settings/sub-agents",
    },
    tasks: "/dashboard/tasks",
    notifications: "/dashboard/notifications",
    gsInterviews: "/dashboard/gs-interviews",
  },
  track: {
    root: (id?: string) => `/track${id ? `?tid=${id}` : ""}`,
    gsForm: (id: string) => `/track/gs-form/${id}`,
  },
} as const;

export type SiteRoutes = typeof siteRoutes;
