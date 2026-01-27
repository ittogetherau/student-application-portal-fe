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
    },
    agents: {
      root: "/dashboard/agents",
    },
    tasks: "/dashboard/tasks",
    gsInterviews: "/dashboard/gs-interviews",
  },
  track: "/track",
} as const;

export type SiteRoutes = typeof siteRoutes;
