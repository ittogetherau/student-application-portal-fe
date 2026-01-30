# Agent Context

This document captures the high-level structure and runtime concerns for the Churchill Application Portal frontend so that future work can be grounded in the same context.

## 1. At a glance
- **Product**: Student Application Management System (Churchill Institute of Higher Education portal) built with **Next.js 16**, **React 19** (app router), **Tailwind 4**, and **NUQS/TanStack** tooling.
- **Runtime**: NextAuth (credentials + Microsoft OAuth) drives auth, React Query caches API data, and custom Axios instances add auth headers + token refresh. State is partly handled in **Zustand** stores plus a few React contexts.
- **Domain**: Agents, staff, admins and students interact with dashboards, multi-step application forms, GS (Genuine Student) workflows, and an applicant tracking page.

## 2. App router surface
- `app/page.tsx`: public landing page with hero media and shortcuts to `/login` and `/track`. Uses `siteRoutes` constants.
- `app/(auth)/login`, `/register`, `/error`: sign-in layouts include Microsoft OAuth, staff/partner links, and a link to track status. The Microsoft button handles both redirect (code) and token payload callbacks before delegating to NextAuth credentials.
- `app/dashboard`: sidebar layout (`SidebarNav`, `AppToolbar`, `NAV_LINKS`) renders `application`, `agents`, `tasks` subroutes depending on role. The dashboard layout wraps everything with `SidebarProvider`.
  - `/dashboard/application/create`: `NewForm` component orchestrates form steps (including the currently active `review-form.tsx` inside `_forms`), auto-fill, and step navigation (see `_components/new-form.tsx` and `_forms/*` for personal details, documents, GS, etc.).
  - `/dashboard/application/[id]`: per-application view composed of `ApplicationStage`, `ApplicationSidebar`, sign displays, and GS tabs (`gs-tab.tsx` with documents/declarations/schedule/interview/assessment pipelines).
  - `/dashboard/application/archived`, `/dashboard/tasks`, `/dashboard/agents`: dedicated feature slices (tasks and archived tables are client components; agents page is currently placeholder).
- `app/track`: tracking interface plus `/track/gs-form/[trackingId]` that renders applicant/course info and `GSScreeningFormPreview`.
- `app/api`: Next.js route for NextAuth (`/api/auth/[...nextauth]/route.ts`) and Google Places proxies (`/api/google-places/autocomplete` and `/details`) so client hooks never expose the API key.

## 3. Auth & session
- `src/lib/auth-options.ts`: NextAuth options with credential provider, Microsoft OAuth token handling, JWT refresh logic, staff-admin flag propagation, and NextAuth callbacks/tab session shaping. `AUTH_SECRET` comes from env or defaults to a dev placeholder.
- `src/lib/auth.ts` (not shown here but available) plus `src/app/providers.tsx` wrap the tree in `SessionProvider`, `QueryClientProvider`, `NuqsAdapter`, `ThemeProvider`, and `react-hot-toast` `Toaster`.
- `src/axios/axios.ts`: exports public/private Axios instances that automatically attach bearer tokens from the NextAuth session and retry once on 401 (refresh token flow).
- `src/service/auth.service.ts`: login/register refresh methods, Microsoft login callbacks, used by both server routes and client hooks.

## 4. Services, hooks & data access
- `src/service/*`: application, admin, dashboard, document, case, course, signature, staff/student, Galaxy sync, and helper services all wrap Axios + error handling (`src/utils/handle-api-error.ts`) with typed responses.
- Hooks (`src/hooks/*.hook.ts[x]`) are thin React Query wrappers around these services: `useApplications`, `useApplication`, `useApplicationSteps`, `useThreads`, `useDashboard`, `useDocument`, etc. There are also utility hooks for register, auto-fill, form persistence, mobile viewport detection, and Google Places autocomplete (`usePlacesAutocomplete.hook.ts` hitting `/api/google-places/*`).
- `src/store/*`: Zustand stores persist application form data (`useApplicationFormDataStore`), step navigation (`useApplicationStepStore`), and pagination preferences. These stores hydrate client state for create/edit flows and enable auto-fill/resume behavior.

## 5. Application forms & review
- The create/edit flow is centered in `src/app/dashboard/application/create/`. `NewForm` renders a sidebar stepper (filtered via `FORM_STEPS`/`HIDDEN_STEP_IDS`) and loads step components from `FORM_COMPONENTS`. Each `_forms/*` file (e.g., `personal-details-form.tsx`, `documents-upload-form.tsx`, `gs-screening`, `review-form.tsx`) handles its own validation (Zod schema in `src/validation/application/*.ts`) and submission/preview logic.
- `review-form.tsx` (current active file) compiles the latest step data, displays section summaries via `review-form-sections.tsx`, and shows status chips before final submission.
- `src/components/forms/*` add reusable form controls, e.g., `form-field.tsx`, while `_components/new-form.tsx` handles auto-fill via `useAutoFill` and step locking via `useStepNavigation`.
- `src/components/ui-kit/layout` supplies `ContainerLayout`, `TwoColumnLayout`, etc., used across the forms to keep spacing consistent.

## 6. Dashboard tooling & GS workflows
- `ApplicationStage.tsx` renders each `APPLICATION_STAGE` pill, wires stage-change mutations (`useApplicationChangeStageMutation`, `useApplicationSendOfferLetterMutation`, `useApplicationEnrollGalaxyCourseMutation`, `useApplicationGalaxySyncMutation`), and shows staff-only actions (start review, generate offer letter) plus GS assessment progress cards.
- GS tabs are implemented under `src/app/dashboard/application/[id]/_components/tabs/gs-tab.tsx` with nested tab content (`gs-tabs/*`) for documents, declarations, scheduling, interview, and assessment tracking.
- `components/dashboard/applications/*` hold the application table, columns, filters, and stage badges used on `/dashboard/application`.
- Shared UI like `ApplicationStagePill`, `GuidedTooltip`, `ThemeToggle`, `ThreadAttachmentInput`, and `UrlDrivenSheet` live under `src/components/shared`.

## 7. UI system & styling
- `src/components/ui` plus `ui-kit` house primitives (Button, Input, Card, Tabs, Badge, Sidebar, etc.). `globals.css` imports Tailwind 4 + `tw-animate-css`, defines themeable CSS variables (background, sidebar, charts, etc.), and provides base `.wrapper`, scrollbar helpers, and `.sticky-sidebar`.
- `src/app/layout.tsx` uses `Geist`/`Geist_Mono` fonts, sets metadata, and wraps the tree with the previously mentioned providers.
- `src/app/providers.tsx` configures toast styles (primary, success, error, loading) and toggles between light/dark via `ThemeProvider`.

## 8. Constants & data assets
- `src/constants`: `site-routes.ts` centralizes public/dashboard URLs, `application-steps.ts` describes the multi-step workflow, and `types.ts` enumerates roles (`USER_ROLE`), application stages/status, and other shared enums.
- `src/data`: `navlink.data.ts` chooses sidebar links per user role, `document-types.data.ts` and `countries-backup.json / country-list.ts` feed forms, and glimpsed `navlink` arrays align with dashboard nav.
- `public/images` contains logos, hero media, Microsoft icon, and `logo.svg` referenced across auth/login/landing pages.

## 9. Tooling & scripts
- Standard scripts in `package.json`: `npm run dev` (Next dev server), `build`, `start`, `lint` (ESLint config from `eslint.config.mjs`), and `knip` (unused exports checker). Tailwind plugins depend on `@tailwindcss/postcss`, `tailwindcss` 4, and `tw-animate-css`.
- `next.config.ts` turns on the React compiler/strict mode, allows the Churchill blob storage domain for remote images, redirects `/` to `/login`, rewrites API calls through `API_PROXY_TARGET` (or `NEXT_PUBLIC_API_PROXY_TARGET`), and proxies `/api/*` to the external backend when env var is set.
- `tsconfig.json` enables strict TS, JSX + app router support, and path aliases ( `@/*` → `./src/*`).

## 10. Environment & runtime configuration
- Required environment variables include `API_BASE_URL`, `NEXT_PUBLIC_API_BASE_URL`, `NEXTAUTH_URL`, `AUTH_SECRET`, `GOOGLE_PLACES_API_KEY`, and `GOOGLE_PLACES_AUTOCOMPLETE_TOKEN`. Never commit the real secret values (they appear in `.env` for local dev).
- Axios/Next middleware rely on `NEXT_PUBLIC_API_BASE_URL` for fetching data. `apiProxyTarget` in `next.config.ts` respects `API_PROXY_TARGET`/`NEXT_PUBLIC_API_PROXY_TARGET` to forward `/api/*`.
- NextAuth pages redirect to `/error` on failure, and `providers.tsx` expects system dark mode toggles.

## 11. Notes for future
- change this md file if needed.
- When adding new API calls, wrap them in `src/service/*` and expose a React Query hook under `src/hooks`.
- Keep form steps in sync between `FORM_STEPS/form-step-components` and `FORM_STEPS` data used by the sidebar + review form.
- Use `siteRoutes` and `NAV_LINKS` constants for navigation to avoid hard-coded URLs.


# Agent Instructions

Use shared helpers from `src/lib/document-file-helpers.ts` for file-related
constants and utilities (file size limits, allowed types, file keys, etc.)
instead of redefining them in individual components.
Use the `Dropzone` component for file uploads when feasible.
