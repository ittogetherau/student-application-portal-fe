export const siteRoutes = {
  home: "/",
  auth: {
    login: "/login",
    register: "/register",
    signUp: "/sign-up",
    signUpAlt: "/signup",
  },
  dashboard: {
    root: "/dashboard",
    application: {
      root: "/dashboard/application",
      create: "/dashboard/application/create",
      archived: "/dashboard/application/archived",
      id: {
        root: (id: string) => `/dashboard/application/${id}`,
        details: (id: string) => `/dashboard/application/${id}/details`,
        documents: (id: string) => `/dashboard/application/${id}/documents`,
        timeline: (id: string) => `/dashboard/application/${id}/timeline`,
        communication: (id: string) =>
          `/dashboard/application/${id}/communication`,
        gs: (id: string) => `/dashboard/application/${id}/gs-process`,
        coe: (id: string) => `/dashboard/application/${id}/coe`,
      },
    },
    agents: {
      root: "/dashboard/agents",
    },
    tasks: "/dashboard/tasks",
    notifications: "/dashboard/notifications",
    gsInterviews: "/dashboard/gs-interviews",
  },
  track: {
    root: "/track",
    gsForm: (id: string) => `/track/gs-form/${id}`,
  },
} as const;

export type SiteRoutes = typeof siteRoutes;
